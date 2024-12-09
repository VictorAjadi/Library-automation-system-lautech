const User = require("../models/User");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const customError = require("../utils/customError");
const { empty } = require("../utils/notFoundInModel");
const Features = require("../utils/apiFeatures");
const sendEmail = require("../config/email");
const create_jwt_token_admin = require("../utils/create_jwt_token_admin");
const otpGenerator = require('otp-generator')
const jwt = require("jsonwebtoken");
const utils=require("util");
const FailedEmail = require("../models/FailedEmail");
const crypto = require('crypto')
const { imgCleanUp } = require("../utils/imageCleaner");
const Media = require("../models/Media");
const StudentBooks = require("../models/StudentBooks");

const { removeUndefined } = require("../utils/undefinedRemoval");
const BookStore = require("../models/BookStore");
// @post desc
exports.loginAdmins = asyncErrorHandler(async (req, res, next) => {
    res.clearCookie('auth_token');
    const { code } = req.query;
    // Check if the OTP code is present
    empty(code, 'Admin OTP Code not found...', 404, next);
    // Check if email and password are provided
    empty(req.body.email, "Please enter your email address...", 400, next);
    empty(req.body.password, "Please enter your password...", 400, next);
      // Verify the OTP code
    if (!(await verifyAdminLoginOTP(code, req))) {
      return next(new customError('Invalid Admin OTP Code or OTP Code has expired, try again...', 400));
    }
    // Confirm email and password existence
    const login_user = await User.findOne({
      email: req.body.email,
      suspended: false,
      $or: [
        { role: "admin" },
        { role: "sub-admin" }
      ]
    }).setOptions({ skipMiddleware: true }).populate('profileImg').populate('idCard').select("+password +suspended +role +verified +checkIn +checkOut");
    // Check if the user exists and the password matches
    if (!login_user || !(await login_user.comparePassword(req.body.password, login_user.password))) {
      return next(new customError("Email or Password does not exist or suspended...", 404));
    }
    // Create JWT token
    create_jwt_token_admin(res, login_user, 200,'login was successful', next);
});
exports.forgotPasswordResetToken=asyncErrorHandler(async(req,res,next)=>{
  empty(req.body.email,"Please enter the email field...",401,next);
  let user = await User.findOne({
    email: req.body.email,
    suspended: false,
    $or: [
      { role: "admin" },
      { role: "sub-admin" }
    ]
  }).setOptions({ skipMiddleware: true }).select("+role +suspended");
  empty(user, `User with ${req.body.email} email address can not be found...`, 400,next);
  //if(user.oauthProvider!=='none') return next(new customError("Service not provided for this user, you must have been authenticated via social media links...",401))
  const reset_token=await user.createResetToken();
  user = await user.save({validateBeforeSave: false});
  const resetUrl= `${req.protocol}://${req.get('host')}/admins/reset-password/${reset_token}`
  try{
      //send mail now
    await sendEmail({
      email: user.email,
      name: user.name,
      url: resetUrl,
      subject: "password reset link"
    },"reset")
   //successful email
   return res.status(200).json({
    status: 'success',
    message : 'Check your email for password reset link...'
   })
  }catch(error){
    user.hashedResetToken=undefined;
    user.resetTokenExpiresIn=undefined;
    return next(new customError('An error occurred while sending reset link...',500))
  }
});
exports.passwordReset=asyncErrorHandler(async(req,res,next)=>{
  empty(req.body.password,"Please enter the password field...",404,next);
  empty(req.body.confirmPassword,"Please enter the confirm password field...",404,next);
  if(req.body.confirmPassword !== req.body.password) return next(new customError('confirm password and password does not match',400))
   const reset_token=req.params.token;
   empty(reset_token,"Error occurred while identifying reset token...",404,next);
   const token = crypto.createHash('sha256').update(reset_token).digest('hex');
   const user =await User.findOne({
    hashedResetToken: token, 
    suspended: false,
    $or: [
      { role: "admin" },
      { role: "sub-admin" }
    ]
  }).setOptions({ skipMiddleware: true }).select("+password");
   if(!user || (await user.isResetTokenExpired(user.resetTokenExpiresIn))){
    return next(new customError("Your password reset link or token has expired...",400));
   }
   user.passwordChangedAt=Date.now();
   user.password=req.body.password;
   user.confirmPassword=req.body.confirmPassword;
   user.resetTokenExpiresIn=undefined;
   user.hashedResetToken=undefined;
   user.updatedAt=Date.now();
   await user.save();
   res.clearCookie('auth_token');
   return res.status(200).json({
    status: "success",
    message: "Password reset was successful, login with new password..."
   })
})
// @patch desc
exports.addSubAdmin=asyncErrorHandler(async(req,res,next)=>{
    const {id}=req.params;
    empty(id,"Staff ID not found...",404,next);
    //find user and check if he was authenticated by google api and if he is a student
    const newAdmin = await User.findById(id).select("+role +verified -password");
    if(newAdmin.role!=="staff"){
        return next(new customError("Only a staff account can be converted to sub-admin...",400))
    }
    if(!newAdmin.verified){
      return next(new customError("This staff must be verified first...",400))
    }
    const upgradedToAdmin=await User.updateOne({_id: newAdmin._id,role: 'staff'},{$set: {role: "sub-admin"}},{new: true, runValidators: true});
    empty(upgradedToAdmin,"An unknown error occured: unable to add this account as a sub-admin...",500,next);
    return res.status(200).json({
        status: "success",
        message: "You have successfully added this person as a sub-admin..."
    })
})
exports.allUsers=asyncErrorHandler(async (req,res)=>{
    const query=req.query;
    const count = await User.countDocuments({role: {$ne: 'admin'}});
    //get all active users
    let feature1=new Features(User.find({role: {$ne: 'admin'}}).setOptions({skipMiddleware: true}).select("+role +suspended +verified").populate('profileImg').populate('idCard'),query,count);
    // Apply search if present in query
    if (req.query.search) {
      feature1 = await feature1.search(req.query.search, ['name', 'matricNo','email','mobileNumber']);
    }
    feature1 = feature1.filter().sort().fields().paginate(30);
    const users = await feature1.queryObject;
    const aggregate = await StudentBooks.aggregate([
      {
          $match: {
              status: "READING" // Filter for books with status "READING"
          }
      },
      {
          $group: {
              _id: "$book", // Group by book ID
              total: { $sum: 1 } // Count occurrences for each book
          }
      },
      {
          $sort: { total: -1 } // Sort by total in descending order
      },
      {
          $limit: 10 // Limit to the top 10 books
      },
      {
          $lookup: {
              from: "bookstores", // The collection name for BookStore
              localField: "_id", // Match _id from the group stage
              foreignField: "_id", // Match with the _id field in BookStore
              as: "bookDetails" // Alias for the joined data
          }
      },
      {
          $unwind: "$bookDetails" // Deconstruct the array from $lookup
      },
      {
          $project: {
              _id: 0, // Exclude _id
              bookId: "$_id", // Include book ID
              title: "$bookDetails.title", // Include book title
              author: "$bookDetails.author", // Include book author (optional)
              total: '$total' // Include the total count
          }
      }
  ]);
  const aggregateUsers = await User.aggregate([
    // Ensure `suspended` is explicitly selected
    {
        $project: {
            suspended: 1, // Include suspended
            createdAt: 1 // Include createdAt for grouping by date
        }
    },
    // Group users by the month of their creation
    {
        $group: {
            _id: { $dateToString: { format: "%B", date: "$createdAt" } }, // Month
            total: { $sum: 1 }, // Count total users
            suspendedCount: {
                $sum: { $cond: [{ $eq: ["$suspended", true] }, 1, 0] } // Count suspended users
            },
            unsuspendedCount: {
              $sum: { $cond: [{ $eq: ["$suspended", false] }, 1, 0] } // Count unsuspended users
          }
        }
    },
    // Sort by month
    {
        $sort: { _id: -1 }
    },
    // Calculate overall average of the total counts
    {
        $group: {
            _id: null, // Aggregate across all months
            averageTotal: { $avg: "$total" }, // Calculate average total
            allTotals: {
                $push: {
                    month: "$_id", // Month
                    total: "$total", // Total users
                    unsuspendedCount: '$unsuspendedCount',
                    suspendedCount: "$suspendedCount" // Suspended users
                }
            }
        }
    },
    // Flatten the array of results and add average total to each month
    {
        $unwind: "$allTotals"
    },
    {
        $addFields: {
            month: "$allTotals.month",
            total: "$allTotals.total",
            unsuspendedCount: "$allTotals.unsuspendedCount",
            suspendedCount: "$allTotals.suspendedCount",
            averageTotal: "$averageTotal"
        }
    },
    // Optionally remove unnecessary fields
    {
        $project: {
            _id: 0, // Exclude _id
            month: 1,
            total: 1,
            unsuspendedCount: 1,
            suspendedCount: 1,
            averageTotal: 1
        }
    }
  ]);

    let unsuspendedUsers= users.filter(each=> each.suspended===false)?.map(each=>{
      each.updatedAt=undefined;
      each.passwordChangedAt=undefined;
      each.suspended=undefined;
      each.createdAt=undefined;
      each.checkIn=undefined;
      each.checkOut=undefined;
      return each;
    })

    const suspendedUsers=users.filter(each=> each.suspended===true)?.map(each=>{
      each.updatedAt=undefined;
      each.passwordChangedAt=undefined;
      each.suspended=undefined;
      each.createdAt=undefined;
      each.checkIn=undefined;
      each.checkOut=undefined;
      return each;
    })
    return res.status(200).json({
      status: "success",
      data: {
        unsuspendedUsers,
        suspendedUsers,
        aggregate,
        count,
        bookCount: await BookStore.countDocuments(),
        aggregateUsers
      }
    })
})
exports.suspendAccount = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  empty(req.user, "Admin needs to be logged in, try logging in...", 404, next);
  empty(id, "empty user ID...", 400, next);
  // Check if user exists and is not already suspended
  const checkuser = await User.findOne({ _id: id, suspended: false })
    .setOptions({ skipMiddleware: true })
    .select('+role +verified +suspended');
  empty(checkuser, "User not found or does not exist...", 404, next);
  // Check permission for admin roles
  if (checkuser.role === 'admin') return next(new customError('Request not granted...', 401));
  if (checkuser.role === 'sub-admin' && req.user.role === 'sub-admin') return next(new customError('Request not granted to sub-admin...', 401));
  // Suspend user
  const user = await User.updateOne({ _id: id }, { $set: { suspended: true } }).select('+role +verified');
  empty(user, "This user ID is invalid or user does not exist...", 404, next);
  // Send response immediately
  res.status(200).json({
    status: "success",
    message: "This User account has been suspended..."
  });
  // Try to send the suspension email
  const sendEmailWithRetry = async (options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await sendEmail(options, "suspend");
        break;
      } catch (error) {
        if (i === retries - 1) {
          // Save failed email details to the database
          await FailedEmail.create({
            email: checkuser.email,
            name: checkuser.name,
            subject: "User Account Suspended",
            message: `Dear ${checkuser.name}, your account has been suspended.`,
            isSent: false
          });
        }
      }
    }
  };
  // Send the email with retry logic
  await sendEmailWithRetry({
    email: checkuser.email,
    name: checkuser.name,
    subject: "User Account Suspended"
  });
});
exports.unSuspendAccount = asyncErrorHandler(async (req, res, next) => {
  empty(req.user, "Admin needs to be logged in, try logging in...", 404, next);
  const { id } = req.params;
  empty(id, "empty user ID...", 400, next);
  const checkuser = await User.findById(id).setOptions({skipMiddleware: true}).select('+role +suspended');
  empty(checkuser, "User not found or does not exist...", 404, next);
  if(checkuser.role==='sub-admin' && req.user.role==='sub-admin') return next(new customError('Request not granted to sub-admin...',401));
    // Unsuspend user
    const user = await User.updateOne(
      { _id: id },
      { $set: { suspended: false } }
    ).setOptions({ skipMiddleware: true });
    empty(user, "This user ID is invalid or user does not exist...", 404, next);
      // Send response immediately
    res.status(200).json({
      status: "success",
      message: "This User account has been removed from suspended account..."
    });
    // Send mail for suspension
    const sendEmailWithRetry = async (options, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          await sendEmail(options, "unsuspend");
          break;
        } catch (error) {
          if (i === retries - 1) {
            // Save failed email details to the database
            await FailedEmail.create({
              email: checkuser.email,
              option: JSON.stringify(options),
              type: 'unsuspend',
              isSent: false
            });
          }
        }
      }
    };
    await sendEmailWithRetry({
      email: user.email,
      name: user.name,
      subject: "User Account Removed From Suspension"
    });
});
exports.getOneAdmin = asyncErrorHandler(async(req,res,next)=>{
  const {id}=req.params
  empty(id,'User ID not found...',404,next)
  if(id.toString() !== req.user._id.toString()) return next(new customError('User not authorized',401));
  const user=await User.findOne({
    _id: id,
    $or: [
      { role: "admin" },
      { role: "sub-admin" }
    ]
  }).setOptions({ skipMiddleware: true }).select('+role')
  empty(user,'This admin or sub-admin does not exist or suspend...',404,next)
  return res.status(200).json({
      status: 'success',
      data:{
          user
      }
  })
})
exports.getOTPToken = asyncErrorHandler(async (req, res, next) => {
  // Generate OTP token
  const otpToken = otpGenerator.generate(7, {
    digits: true,
    upperCaseAlphabets: true,
    lowerCaseAlphabets: false,
    specialChars: false
  });
  empty(otpToken, 'An error occurred while generating OTP...', 500, next);
  // Retry logic for sending the email
  const sendEmailWithRetry = async (options, retries = 3) => {
    let emailSent = false;
    for (let i = 0; i < retries; i++) {
      try {
        await sendEmail(options, "otp");
        emailSent = true;
        break; // Exit loop if email is successfully sent
      } catch (error) {
        if (i === retries - 1) {
          return false; // Return false if all retries fail
        }
      }
    }
    return emailSent;
  };
  // Attempt to send OTP email
  const emailSuccess = await sendEmailWithRetry({
    email: req.user.email,
    name: req.user.name,
    otp: otpToken,
    validDuration: process.env.OTPTIME,
    subject: "OTP Verification Code"
  });
  // If sending email failed after all retries
  if (!emailSuccess) {
    return next(new customError("Failed to send OTP Code to mail, due to bad network connection...", 400));
  }
  //encrypt otp token
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.OTPSECRET, 'hex'); // Ensure this is a 32-byte hex-encoded string
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(otpToken, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const encryptedOTP =  iv.toString('hex') + ':' + encrypted;
  // Create JWT token with OTP and expiration time
  const token = jwt.sign(
    { otp: encryptedOTP },
    process.env.OTPSECRET,
    { expiresIn: `${process.env.OTPTIME}m` } // Expire in OTPTIME minutes
  );
  // Set cookie options
  const expiresInMs = process.env.OTPTIME * 60 * 1000; // Convert OTPTIME to milliseconds
  const cookiesOption = {
    maxAge: expiresInMs,
    httpOnly: true,
    signed: false, // Ensure this is set to false
    secure: process.env.NODE_ENV === 'production' // Secure cookie in production
  };
  // Set the OTP token in a cookie
  res.cookie('ptoedoc', token, cookiesOption)
  // Send success response to the client
  return res.status(200).json({
    status: 'success',
    message: 'OTP Code has been sent to your email...'
  });
});
exports.updateAdminDetails = asyncErrorHandler(async (req, res, next) => {
  const validImageFormats = ['image/jpeg', 'image/png', 'image/jpg'];
  let ProfileByMedia;
  let cardByMedia;
  // If a new file is uploaded, handle image processing
  if (req.files) {
      if(req.files.profileImg){
        if (!validImageFormats.includes(req.files.profileImg[0].mimetype)) {
          if(req.files.idCard) await imgCleanUp(req,'idCard');
          await imgCleanUp(req,'profileImg')
          return next(new customError('Invalid image format for profile image...', 400));
        }
        // Delete previous image if it exists
        const mediaImage = await Media.findById(req.user.profileImg);
        if (mediaImage) {
            try {
                await fs.unlink(mediaImage.path);
                await mediaImage.deleteOne();
            } catch (error) {
                if(req.files.idCard) await imgCleanUp(req,'idCard');
                await imgCleanUp(req,'profileImg')
                return next(new customError('An error occurred while deleting previous profile image...', 500));
            }
        }
        const formattedPath = req.files.profileImg[0].path.replace(/\\/g, '/');
        // Create and save the new profile image
        ProfileByMedia = await new Media({
            filename: req.files.profileImg[0].filename,
            path: formattedPath,
            url: `${req.protocol}://${req.get('host')}/api/${formattedPath}`,
            format: req.files.profileImg[0].mimetype
        }).save();
        if(!ProfileByMedia) {
          if(req.files.idCard) await imgCleanUp(req,'idCard');
          await imgCleanUp(req,'profileImg')
        };
      }
      if(req.files.idCard){
        if (!validImageFormats.includes(req.files.idCard[0].mimetype)) {
          await imgCleanUp(req,'idCard');
          if(req.files.profileImg) await imgCleanUp(req,'profileImg',ProfileByMedia._id);
          return next(new customError('Invalid image format for id-card image...', 400));
        }
        // Delete previous image if it exists
        const mediaImage = await Media.findById(req.user.idCard);
        if (mediaImage) {
            try {
                await fs.unlink(mediaImage.path);
                await mediaImage.deleteOne();
            } catch (error) {
              await imgCleanUp(req,'idCard');
              if(req.files.profileImg) await imgCleanUp(req,'profileImg',ProfileByMedia._id);
              return next(new customError('An error occurred while deleting previous id-card image...', 500));
            }
        }
        const formattedPath = req.files.idCard[0].path.replace(/\\/g, '/');
        // Create and save the new id-card image
        cardByMedia = await new Media({
            filename: req.files.idCard[0].filename,
            path: formattedPath,
            url: `${req.protocol}://${req.get('host')}/api/${formattedPath}`,
            format: req.files.idCard[0].mimetype
        }).save();
        if(!cardByMedia) {
          await imgCleanUp(req,'idCard');
          if(req.files.profileImg) await imgCleanUp(req,'profileImg',ProfileByMedia._id);
        };
      }
  }
  // Exclude sensitive or restricted fields
  const excludeFields = ["checkOut","checkIn","password","role","hashRole","confirmPassword", "suspended", "verified", "passwordChangedAt", "hashedResetToken", "resetTokenExpiresIn"];
  excludeFields.forEach(field => delete req.body[field]);
  // Update user details, including profileImg if available
  const updatedProfile = await req.user.updateOne({
      $set: { 
        ...removeUndefined(req.body),  // Remove undefined values from req.body
        ...(ProfileByMedia && { profileImg: ProfileByMedia._id }),
          ...(cardByMedia && { idCard: cardByMedia._id })
      }
  });
  const profile = await User.findOne({   
    _id: req.user._id,
    $or: [
      { role: "admin" },
      { role: "sub-admin"}
    ]}
  ).setOptions({ skipMiddleware: true }).populate('profileImg').populate('idCard').select("+role +verified -passwordChangedAt -hashedResetToken")
  if(!profile || !updatedProfile){
    if(req.files.idCard) await imgCleanUp(req,'idCard',cardByMedia._id);
    if(req.files.profileImg) await imgCleanUp(req,'profileImg',ProfileByMedia._id);
    return next(new customError('An unknown error occured...', 500));
  }
  return res.status(200).json({
      status: "success",
      message: "User profile updated...",
      profile: profile
  });
});
// Controller to handle admin password update after OTP verification
exports.updateAdminPassword = asyncErrorHandler(async (req, res, next) => {
  const { code } = req.query;
  // Check if the OTP code is present
  empty(code, 'OTP Code not found...', 404, next);
  // Check if all password fields are provided
  empty(req.body.password, "Please enter the new password...", 404, next);
  empty(req.body.confirmPassword, "Please enter the confirm password...", 404, next);
  empty(req.body.currentPassword, "Please enter your current password...", 404, next);
  // Verify the OTP code
  if (!(await verifyOTP(code, req))) {
    return next(new customError('Invalid OTP Code or OTP Code has expired, try again...', 400));
  }
  // Check if password and confirm password match
  if (req.body.password !== req.body.confirmPassword) {
    return next(new customError('Password and Confirm Password do not match...', 400));
  }
  // Verify current password
  const isCurrentPasswordValid = await req.user.comparePassword(req.body.currentPassword, req.user.password);
  if (!isCurrentPasswordValid) {
    return next(new customError("Incorrect current password, try again...", 400));
  }
  // Update the user's password and relevant fields
  req.user.password = req.body.password;
  req.user.passwordChangedAt = Date.now();
  req.user.updatedAt = Date.now();
  // Save the user data
  const user = await req.user.save({validateBeforeSave: false});
  empty(user, "Invalid user, please login and try again...", 404, next);
  // Clear relevant cookies after the operation
  res.clearCookie('auth_token'); // Clear session authentication token
  res.clearCookie('ptoedoc'); // Clear OTP token

  // Respond with success
  return res.status(200).json({
    status: "success",
    message: "Password update was successful. Please log in with your new password.",
  });
});
// Function to verify OTP from the JWT stored in cookies
const verifyOTP = async (token, req) => {
  try {
    // Convert input token to string
    let newToken = token.toString();
    // Get the OTP JWT token from the cookies
    const ptoedoc = req.cookies.ptoedoc;
    if (!ptoedoc) {
      throw new Error('OTP token is missing or has expired');
    }
    // Verify the JWT OTP token using the secret
    const otp_token = await utils.promisify(jwt.verify)(ptoedoc, process.env.OTPSECRET);
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.OTPSECRET, 'hex'); // Ensure this is a 32-byte hex-encoded string
    const parts = otp_token.otp.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encrypted = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    // Compare the OTP from the query and the stored token
    return newToken === decrypted.toString(); 
  } catch (error) {
    // Handle JWT errors (expired token, invalid signature, etc.)
    return false;
  }
};
exports.getAdminLoginOTPToken = asyncErrorHandler(async (req, res, next) => {
  // Validate email input
  empty(req.query.email, 'Please enter your email address...', 400, next);
  // Find user by email (inactive users only)
  const user = await User.findOne({
    email: req.query.email,
    suspended: false,
    $or: [
      { role: "admin" },
      { role: "sub-admin" }
    ]
  }).setOptions({ skipMiddleware: true })
  empty(user, 'Admin or sub-admin with this email address cannot be found or suspend...', 404, next);
  // Generate OTP
  const otpToken = otpGenerator.generate(7, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
  empty(otpToken, 'An error occurred while generating OTP...', 500, next);
  // Retry logic for sending email
  const sendEmailWithRetry = async (options, retries = 3) => {
    let emailSent = false;
    for (let i = 0; i < retries; i++) {
      try {
        await sendEmail(options, "otp");
        emailSent = true;
        break; // Exit the loop if the email is successfully sent
      } catch (error) {
        if (i === retries - 1) {
          return false; // Return false if all retries fail
        }
      }
    }
    return emailSent;
  };
  // Attempt to send OTP email
  const emailSuccess = await sendEmailWithRetry({
    email: req.query.email,
    name: user.name,
    otp: otpToken,
    validDuration: process.env.OTPTIME,
    subject: "OTP Verification Code"
  });

  // If sending email failed after all retries
  if (!emailSuccess) {
    return next(new customError("Failed to send OTP Code to mail, due to bad network connection...", 400));
  }
  //encrypt otp token
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.OTPSECRET, 'hex'); // Ensure this is a 32-byte hex-encoded string
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(otpToken, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const encryptedOTP =  iv.toString('hex') + ':' + encrypted;

  // Create JWT token with OTP and expiration time
  const token = jwt.sign(
    { otp: encryptedOTP },
    process.env.OTPSECRET,
    { expiresIn: process.env.OTPTIME * 60 * 1000 } // Expiry in milliseconds
  );
  const expiresInMs = process.env.OTPTIME * 60 * 1000;
  const cookiesOption = {
    maxAge: expiresInMs,
    httpOnly: true,
    signed: false, // Ensure signed is false for unsigned cookies
    secure: process.env.NODE_ENV === 'production', // Secure cookies only in production
  };
  res.cookie('ptoedocadmin', token, cookiesOption);
  return res.status(200).json({
    status: 'success',
    message: 'Admin OTP code has been sent to email...'
  });
});
const verifyAdminLoginOTP = async (token, req) => {
  try {
    // Convert input token to string
    let newToken = token.toString();
    // Get the OTP JWT token from the cookies
    const ptoedocadmin = req.cookies.ptoedocadmin;
    if (!ptoedocadmin) {
      throw new Error('OTP token is missing or has expired');
    }
    // Verify the JWT OTP token using the secret
    const otp_token = await utils.promisify(jwt.verify)(ptoedocadmin, process.env.OTPSECRET);
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.OTPSECRET, 'hex'); // Ensure this is a 32-byte hex-encoded string
    const parts = otp_token.otp.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encrypted = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    // Compare the OTP from the query and the stored token
    return newToken === decrypted.toString(); 
  } catch (error) {
    // Handle JWT errors (expired token, invalid signature, etc.)
    return false;
  }
};