const jwt = require("jsonwebtoken");
const customError = require("../utils/customError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const utils=require("util");
const User = require("../models/User");
const { empty } = require("../utils/notFoundInModel");
const { decryptRole, encryptRole } = require("../utils/hashRole");

exports.protectRoutes=asyncErrorHandler(async (req,res,next)=>{
/*   console.log(await encryptRole('admin'))
 */  const auth_token=req.headers.authorization
  if(!auth_token || !auth_token.startsWith("Bearer")) return next(new customError("You don't seem to have a session token, either login or sign up..."), 404);
  let token = auth_token.split(" ")[1];
  const decoded_token= await utils.promisify(jwt.verify)(token, process.env.JWT_SECRET);
  empty(decoded_token, "Invalid or expired session token, go back to login...",401,next);
  if (decoded_token?.exp && Date.now() >= decoded_token.exp * 1000) {
    return next(new customError('Session has expired. Please log in.',401))
  }
  const user=await User.findOne({_id: decoded_token.id})
                        .setOptions({skipMiddleware: true})
                        .select("+password +role +verified +checkIn +checkOut +hashRole").populate('idCard').populate('profileImg');
  if(!user){
    return next(new customError("The user does not exist, invalid user ID...",401))
  }
  //check if user has changed password after session token has been issued
  if((await user.isPasswordChanged(decoded_token.iat))) return next(new customError("Password as been changed recently, try logging in again...",401));
  req.user=user;
  next()
})
exports.protectAdmins=asyncErrorHandler(async(req,res,next)=>{
  const {role,hashRole}=req.user;
  const decryptedRole=await decryptRole(hashRole)
  if(decryptedRole === "admin" || decryptedRole==="sub-admin" && decryptedRole===role){
    if(role === "admin" || role==="sub-admin"){
      return next()
    }
  }
  return next(new customError("This route is only available to admins and sub-admins...",401))
})
exports.protectOnlyAdmin=asyncErrorHandler(async(req,res,next)=>{
  const {role,hashRole}=req.user;
  const decryptedRole=await decryptRole(hashRole)
  if(decryptedRole === "admin" && decryptedRole===role){
    if(role === "admin"){
      return next()
    }
  }
  return next(new customError("This route is only available to admin...",401))
})

exports.protectOnlyStaff=asyncErrorHandler(async(req,res,next)=>{
  const {role,hashRole}=req.user;
  const decryptedRole=await decryptRole(hashRole)
  if(decryptedRole === "staff" && decryptedRole===role){
    if(role === "staff"){
      return next()
    }
  }
  return next(new customError("This route is only available to staff...",401))
})

exports.protectVerified=asyncErrorHandler(async(req,res,next)=>{
  const {verified}=req.user;
  if(verified===true){
      return next()
  }
  return next(new customError("This route is only available to verified users...",401))
})