const express=require('express')
const Router=express.Router();
const {protectRoutes, protectAdmins, protectOnlyStaff, protectVerified} = require('../authentication/protect')
const {loginUser, updateUser, createUser, getLoginOTPToken, updatePassword, getOneUser, checkInUser, checkOutUser, verifyUser, getMate, userForgotPasswordResetToken, userPasswordReset} = require('../controller/userController')
const multer = require("multer")
const { generateFilename } = require('../utils/filenameGenerator');
const storage = multer.diskStorage({
    destination: (_, file, cb) =>{
      if(file.mimetype.startsWith('image/')){
        if(file.fieldname === 'profileImg'){
            cb(null, 'uploads/profile-images');
        }else if(file.fieldname === 'idCard'){
            cb(null, 'uploads/idcard-images');
        }else{
            cb(new Error('Invalid field name'), null)
        }
      }else {
        cb(new Error('Unsupported file type'), null)
      }
    },
    filename: generateFilename // Use the function for unique filenames
})
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } //2mb limitation
});
// Error handling middleware for Multer
Router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
  });
Router.get("/login", getLoginOTPToken); // get login otp @/api/user/login?email=bykerlee@gmail.com
Router.get("/departmental-mate", protectRoutes, protectVerified, getMate); // get login otp @/api/user/login?email=bykerlee@gmail.com
Router.get("/:id", protectRoutes,getOneUser); // get user by id  @/api/user/:id

Router.post("/login", loginUser); // login user @/api/user/login?code=sfneint
Router.post("/create", upload.fields([
    {name: 'profileImg',maxCount: 1},
    {name: 'idCard',maxCount: 1}
]), createUser); // sign up user @/api/user/login?code=sfneint
Router.post("/password-reset/token", userForgotPasswordResetToken); // Forgot password token

Router.patch("/password-reset/:token", userPasswordReset); // Reset password
Router.patch("/profile-details", protectRoutes, upload.fields([
    {name: 'profileImg',maxCount: 1},
    {name: 'idCard',maxCount: 1}
]),updateUser); // update user details @/api/user/profile-details
Router.patch("/profile-password", protectRoutes,protectOnlyStaff,updatePassword); // login user @/api/user/profile-password
Router.patch("/verify/:id", protectRoutes,protectAdmins,verifyUser); // verify user by id  @/api/user/verify/:id
Router.patch("/check-in/:id", protectRoutes,protectAdmins,checkInUser); // check in user by id  @/api/user/check-in/:id
Router.patch("/check-out/:id", protectRoutes,protectAdmins,checkOutUser); // check in user by id  @/api/user/check-in/:id

module.exports = Router;