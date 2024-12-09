const express = require('express');
const { protectRoutes, protectOnlyAdmin, protectAdmins } = require('../authentication/protect');
const { loginAdmins, addSubAdmin, suspendAccount, unSuspendAccount, allUsers, getOTPToken, updateAdminPassword, updateAdminDetails, getAdminLoginOTPToken, forgotPasswordResetToken, passwordReset, getOneAdmin } = require('../controller/adminController');
const multer = require("multer")
const path = require("path");
const fs = require('fs');
const { generateFilename } = require('../utils/filenameGenerator');
const storage = multer.diskStorage({
    destination: (_, file, cb) =>{
      if(file.mimetype.startsWith('image/')){
        if(file.fieldname === 'profileImg'){
            cb(null, 'uploads/profile-admins-images');
        }else if(file.fieldname === 'idCard'){
            cb(null, 'uploads/idcard-admins-images');
        }else{
            cb(new Error('Invalid field name'), null)
        }
      }else {
        cb (new Error('Unsupported file type'), null)
      }
    },
    filename: generateFilename // Use the function for unique filenames
})
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
}).fields([
  { name: "profileImg", maxCount: 1 },
  { name: "idCard", maxCount: 1 },
]);
const Router=express.Router();

// Error handling middleware for Multer
Router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
  } else if (err) {
      return res.status(400).json({ error: err.message });
  }
  next();
});

// Routes
Router.get("/login", getAdminLoginOTPToken); // Get login OTP
Router.get("/profile-password", protectRoutes, protectAdmins, getOTPToken); // Get admin password token
Router.get("/all/users", protectRoutes, protectAdmins, allUsers); // Get all users
Router.get("/:id", protectRoutes, protectAdmins, getOneAdmin); // Get an admin by ID

Router.post("/login", loginAdmins); // Login admin
Router.post("/password-reset/token", forgotPasswordResetToken); // Forgot password token

Router.patch("/password-reset/:token", passwordReset); // Reset password
Router.patch("/profile-password", protectRoutes, protectAdmins, updateAdminPassword); // Update password
Router.patch(
  "/profile-details",
  protectRoutes,
  protectAdmins,
  upload,
  updateAdminDetails
); // Update profile details
Router.patch("/add/:id", protectRoutes, protectOnlyAdmin, addSubAdmin); // Add admin
Router.patch("/suspend/:id", protectRoutes, protectAdmins, suspendAccount); // Suspend account
Router.patch("/unsuspend/:id", protectRoutes, protectAdmins, unSuspendAccount); // Unsuspend account


module.exports = Router;