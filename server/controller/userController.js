const asyncErrorHandler = require("../utils/asyncErrorHandler");
const create_jwt_token = require("../utils/create_jwt_token");
const customError = require("../utils/customError");
const { empty } = require("../utils/notFoundInModel")
const crypto=require("crypto")
const otpGenerator = require('otp-generator')
const jwt = require("jsonwebtoken");
const utils=require("util");
const FailedEmail = require("../models/FailedEmail");
const { encryptRole } = require("../utils/hashRole");
const fs = require('fs').promises;
const Media = require('../models/Media'); // Adjust the path to your Media model
const User = require("../models/User");
const { isCheckedInToday } = require("../utils/daychecker");
const { imgCleanUp } = require("../utils/imageCleaner");
const sendEmail = require("../config/email");
const { removeUndefined } = require("../utils/undefinedRemoval");
const { generateQRCode } = require("../utils/barcodeGenerator");
const Features = require('../utils/apiFeatures');
exports.verifyUser=asyncErrorHandler(async(req,res,next)=>{
  const {id}=req.params
  if(!id){
    return next(new customError('User to verify ID not found',404))
  }
  const user = await User.updateOne({_id: id,suspended: false},{$set: {verified: true}});
  if(!user){
    return next(new customError('This user does not exist or suspended',400))
  }
  return res.status(200).json({
    status: "success",
    message: "This user is now verified"
  })
})
exports.checkInUser=asyncErrorHandler(async(req,res,next)=>{
  const {id}=req.params
  if(!id){
    return next(new customError('User to check-in ID not found',404))
  }
  //check if user has been check in
  const student = await User.findById(id).select('+verified')
  if(!student){
    return next(new customError('This user does not exist or suspended',400))
  }
  if(!student.verified){
    return next(new customError('This user has not been verified, request not granted',400))
  }
  if(isCheckedInToday(student.checkIn[student.checkIn.at()])) return next(new customError('This user has been checked in earlier today.',400))
  const date = Date.now();
  const user = await student.updateOne({$push: {checkIn: date}});
  if(!user){
    return next(new customError('An error occured while checking user in',500))
  }
  return res.status(200).json({
    status: "success",
    message: "This user is now checked in"
  })
})
exports.checkOutUser=asyncErrorHandler(async(req,res,next)=>{
  const {id}=req.params
  if(!id){
    return next(new customError('User to check-out ID not found',404))
  }
  //check if user has been check out
  const student = await User.findById(id).select('+verified')
  if(!student){
    return next(new customError('This user does not exist or suspended',400))
  }
  if(!student.verified){
    return next(new customError('This user has not been verified, request not granted',400))
  }
  if(isCheckedInToday(student.checkOut[student.checkOut.at()])) return next(new customError('This user has been checked out earlier today.',400))
  const date = Date.now();
  const user = await student.updateOne({$push: {checkOut: date}});
  if(!user){
    return next(new customError('An error occured while checking user out',500))
  }
  return res.status(200).json({
    status: "success",
    message: "This user is now checked out"
  })
})
exports.getOneUser=asyncErrorHandler(async(req,res,next)=>{
  const {id}=req.params
  if(!id){
    return next(new customError('User ID not found',404))
  }
  if(id.toString() !== req.user._id.toString()) return next(new customError('User not authorized',404))
  const user = await User.findById(id).populate("profileImg").populate("idCard").select('+role').exec();
  if(!user){
    return next(new customError('This user does not exist or suspended',400))
  }
  user.password = undefined;
  user.hashRole = undefined;
  user.passwordChangedAt = undefined;
  user.updatedAt = undefined;
  user.suspended = undefined;
  user.checkIn = undefined;
  user.checkOut = undefined;
  return res.status(200).json({
    status: "success",
    data:{
        user
    }
  })
})
exports.getMate=asyncErrorHandler(async(req,res,next)=>{
  const filter = {department: req?.user?.department,role: req?.query?.role==='false'?'student':{$in: ['staff','admin','sub-admin']}}
  let promiseUser = User.find(filter).setOptions({skipMiddleware: true}).populate("profileImg").populate("idCard").select('+role +verified');
  const data = await getUsersWithFilter(req,promiseUser,filter);
  return res.status(200).json({
    status: "success",
    data
  })
})
const getUsersWithFilter = async (req,promiseUser,filter={}) => {
  const count = await User.countDocuments(filter);
  ['department','role'].forEach(field => delete req.query[field]);
  let usersQuery = new Features(promiseUser,req.query,count);
  // Apply search if present in query
  if (req.query.search) {
    usersQuery = await usersQuery.search(req.query.search, ['matricNo', 'name', 'email', 'mobileNumber']);
  }
  // Apply filtering, sorting, field limiting, and pagination
  usersQuery = usersQuery.filter(['verified', 'suspended', '_id']).sort().fields().paginate(10);
  const users = await usersQuery.queryObject;
  return {
      users,
      count
  };
};
exports.createUser=asyncErrorHandler(async(req,res,next)=>{
  if (!req.files) return next(new customError('Both profile image and id-card are required.', 400));
  const validImageFormats = ['image/jpeg', 'image/png', 'image/jpg'];
  if (req.files) {
      if (!validImageFormats.includes(req.files.profileImg[0].mimetype)) {
          if(req.files.idCard) await imgCleanUp(req,'idCard');
          await imgCleanUp(req,'profileImg')
          return next(new customError('Invalid image format for profile image...', 400));
      }
      if (!validImageFormats.includes(req.files.idCard[0].mimetype)) {
        if(req.files.idCard) await imgCleanUp(req,'idCard');
        await imgCleanUp(req,'profileImg')
        return next(new customError('Invalid image format for id card...', 400));
      }
      const formattedPath = req.files.profileImg[0].path.replace(/\\/g, '/');
      // Create and save the new profile image
      const profileImgMedia = await new Media({
          filename: req.files.profileImg[0].filename,
          path: formattedPath,
          url: `${req.protocol}://${req.get('host')}/api/${formattedPath}`,
          format: req.files.profileImg[0].mimetype
      }).save();
      if(!profileImgMedia){
        if(req.files.idCard) await imgCleanUp(req,'idCard');
        await imgCleanUp(req,'profileImg',profileImgMedia._id)
          return next(new customError('An unknown error occured while saving profile image',500))
      };
      // Create and save the new id card image
      const formattedPathCard = req.files.idCard[0].path.replace(/\\/g, '/');
      const cardImgMedia = await new Media({
        filename: req.files.idCard[0].filename,
        path: formattedPathCard,
        url: `${req.protocol}://${req.get('host')}/api/${formattedPathCard}`,
        format: req.files.idCard[0].mimetype
      }).save();
      if(!cardImgMedia){
          if(req.files.idCard) await imgCleanUp(req,'idCard',cardImgMedia._id);
          await imgCleanUp(req,'profileImg',profileImgMedia._id)
          return next(new customError('An unknown error occured while saving idCard image',500))
      };
      //create hash role
      const hashRole=await encryptRole(req.query.role==='true' ? 'staff': 'student')
      if(!hashRole){
        await imgCleanUp(req,'idCard',cardImgMedia._id)
        await imgCleanUp(req,'profileImg',profileImgMedia._id)
        return next(new customError('An error occured while creating this user, pls try again few moment later...',500))
      }

      const {password,...rest}=req.body;
      //create user
      const newUser = await User.create({
          ...rest,
          profileImg: profileImgMedia._id,
          ...(req.query.role==='true' && {matricNo: 'staff'}),
          idCard: cardImgMedia._id,
          ...(req.query.role==='true' && {role: 'staff'}),
          password: req.query.role==='true' ?  password : rest?.matricNo,
          hashRole
      });
      if(!newUser){
        await imgCleanUp(req,'idCard',cardImgMedia._id)
        await imgCleanUp(req,'profileImg',profileImgMedia._id)
        return next(new customError('Error occurred while creating new user',500))
      };
      let barcodeImage=await generateQRCode(newUser._id);
      if(!barcodeImage){
        await imgCleanUp(req,'idCard',cardImgMedia._id)
        await imgCleanUp(req,'profileImg',profileImgMedia._id)
        return next(new customError('An error occured while creating this user, pls try again few moment later...',500))
      }
      const findUser = await User.findByIdAndUpdate(newUser._id,{barcode:barcodeImage},{new: true,runValidator: false}).populate('profileImg').populate('idCard').select('+role +verified')
      if(!findUser){
        await imgCleanUp(req,'idCard',cardImgMedia._id)
        await imgCleanUp(req,'profileImg',profileImgMedia._id)
        return next(new customError('An error occured while creating this user, pls try again few moment later...',500))
      }
      create_jwt_token(res,findUser,201,"Thank you for signing up with us...",next);//create jwt token
      // Function to attempt email sending with retry mechanism
      const sendEmailWithRetry = async (options, retries = 3) => {
          for (let i = 0; i < retries; i++) {
              try {
                  await sendEmail(options, "register");
                  break;
                } catch (error) {
                  if (i === retries - 1) {
                    // Save failed email details to the database
                    await FailedEmail.create({
                      email: newUser.email,
                      option: JSON.stringify(options),
                      type: 'register',
                      isSent: false
                    });
                  }
              }
          }
      };
      // Attempt to send email with 3 retries
      await sendEmailWithRetry({
          email: newUser.email,
          name: newUser.name,
          subject: "User registered successfully"
      });
  }
})
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
  const { code } = req.query;
  empty(code, 'OTP Code not found...', 400, next);
  res.clearCookie('auth_token');
  empty(req.body.emailOrMatricNo, "Please enter your email address...", 400, next);
  empty(req.body.password, "Please enter your password...", 400, next);
  // Verify the OTP code
  if (!(await verifyLoginOTP(code, req))) {
      return next(new customError('Invalid OTP Code or OTP Code has expired, try again...', 400));
  }
  // Confirm email and password existence
  const login_user = await User.findOne({$or: [{email: req.body.emailOrMatricNo, matricNo: req.body.emailOrMatricNo}], suspended: false }).populate('profileImg').populate('idCard').select("+password +suspended +role +verified");
  if (!login_user || !(await login_user.comparePassword(req.body.password, login_user.password))) {
      return next(new customError("Email or Password does not exist...", 404));
  }
  res.clearCookie('auth_token');
  res.clearCookie('ptoedocresu'); // Clear OTP token
  create_jwt_token(res, login_user, 201, 'Login was successful...',next);
});
exports.updateUser = asyncErrorHandler(async (req, res, next) => {
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
    const updatedProfile = await User.updateOne({_id: req.user._id},{
        $set: { 
          ...removeUndefined(req.body),  // Remove undefined values from req.body
          ...(req.user.role==='staff' && {matricNo: 'staff'}),
            ...(ProfileByMedia && { profileImg: ProfileByMedia._id }),
            ...(cardByMedia && { idCard: cardByMedia._id })
        }
    });
    const profile = await User.findById(req.user._id).populate('profileImg').populate('idCard').select("+role +verified -passwordChangedAt -hashedResetToken")
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
exports.updatePassword=asyncErrorHandler(async(req,res,next)=>{
  empty(req.user,"User not logged in, try logging in...",404,next);
  const id=req.user._id;
  empty(id,"User not logged in, login and try again...",404,next);
  empty(req.body.password,"Please enter the password field...",404,next);
  empty(req.body.confirmPassword,"Please enter the confirm password field...",404,next);
  empty(req.body.currentPassword,"Please enter the current password field...",404,next);
  if(req.body.confirmPassword !== req.body.password) return next(new customError('confirm password and password does not match'))
 // if(req.user.oauthProvider!=='none') return next(new customError("Service not provided for this user, you must have been authenticated via social media links...",401))
  if(!(await req.user.comparePassword(req.body.currentPassword, req.user.password))) return next(new customError("Incorrect user password, try again..."));
  req.user.passwordChangedAt=Date.now();
  req.user.password=req.body.password;
  req.user.confirmPassword=req.body.confirmPassword;
  req.user.updatedAt=Date.now();
  const user=await req.user.save();
  empty(user,"Invalid user ID, login and try again...",404);
  res.clearCookie('auth_token');
  return res.status(200).json({
    status: "success",
    message: "Password update was successful, re-enter new password..."
  })
})
exports.getLoginOTPToken = asyncErrorHandler(async (req, res, next) => {
  // Validate email input
  empty(req.query.email, 'Please enter your email address...', 400, next);
  // Find user by email (inactive users only)
  const user = await User.findOne({ email: req.query.email})
  empty(user, 'User with this email address cannot be found or suspend...', 404, next);
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
  res.cookie('ptoedocresu', token, cookiesOption);
  return res.status(200).json({
    status: 'success',
    message: 'OTP code has been sent to your email...'
  });
});
const verifyLoginOTP = async (token, req) => {
  try {
    // Convert input token to string
    let newToken = token.toString();
    // Get the OTP JWT token from the cookies
    const ptoedocresu = req.cookies.ptoedocresu;
    if (!ptoedocresu) {
      throw new Error('OTP token is missing or has expired');
    }
    // Verify the JWT OTP token using the secret
    const otp_token = await utils.promisify(jwt.verify)(ptoedocresu, process.env.OTPSECRET);
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
exports.userForgotPasswordResetToken=asyncErrorHandler(async(req,res,next)=>{
  empty(req.body.email,"Please enter the email field...",401,next);
  let user = await User.findOne({email: req.body.email, role: 'staff'}).select("+role +suspended");
  empty(user, `User with ${req.body.email} email address can not be found/not a staff...`, 400,next);
  //if(user.oauthProvider!=='none') return next(new customError("Service not provided for this user, you must have been authenticated via social media links...",401))
  const reset_token = await user.createResetToken();
  user = await user.save({validateBeforeSave: false});
  const resetUrl= `${req.protocol}://${req.get('host')}/reset-password/${reset_token}`
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
exports.userPasswordReset=asyncErrorHandler(async(req,res,next)=>{
  res.clearCookie('auth_token');
  empty(req.body.password,"Please enter the password field...",404,next);
  empty(req.body.confirmPassword,"Please enter the confirm password field...",404,next);
  if(req.body.confirmPassword !== req.body.password) return next(new customError('confirm password and password does not match',400))
   const reset_token=req.params.token;
   empty(reset_token,"Error occurred while identifying reset token...",404,next);
   const token = crypto.createHash('sha256').update(reset_token).digest('hex');
   const user =await User.findOne({hashedResetToken: token, role: 'staff'}).select("+password");
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
   return res.status(200).json({
    status: "success",
    message: "Password reset was successful, login with new password..."
   })
})