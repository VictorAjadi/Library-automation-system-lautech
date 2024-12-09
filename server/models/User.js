const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { applyCacheToQueries } = require("../config/cache");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Please enter your full name"],
        maxlength: [100, "User name must not be more than 100 characters"],
        minlength: [4, "User name must not be less than 4 characters"]
    },
    matricNo: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Please enter your matric number"],
        minlength: [5, "Matric number must not be less than 5 numbers"]
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Please enter your email address"],
        lowercase: true,
        validate: {
            validator: function(value) {
                return validator.isEmail(value);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    mobileNumber: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: function(value) {
                return validator.isMobilePhone(value);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    department: {
        type: String,
        required: [true, "Please enter your department"]
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        trim: true,
        minlength: [8, "Password must be more than 8 characters..."],
        select: false
    },
    confirmPassword: {
        type: String,
        trim: true,
        minlength: [8, "Password must be more than 8 characters..."],
        validate: {
            validator: function(value) {
                return value === this.password;
            },
            message: props => `${props.value} does not match the password.`
        }
    },
    profileImg: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: [true, "Please upload your Profile Image"]
    },
    idCard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: [true, "Please upload your ID Card"]
    },
    checkIn: [{
        type: Date
    }],
    checkOut: [{
        type: Date
    }],
    barcode: {
        type: String,
    },
    suspended: {
        type: Boolean,
        default: false,
        select: false
    },
    role: {
        type: String,
        default: "student",
        required: true,
        enum: ["student", "admin", "sub-admin","staff"],
        select: false
    },
    hashRole:{
        type: String,
        required: true,
        select: false
    },
    verified:{
        type: Boolean,
        required: true,
        default: false,
        select: false
    },
    passwordChangedAt: {
        type: Date
    },
    hashedResetToken: {
        type: String
    },
    resetTokenExpiresIn: {
        type: Date
    }
}, { timestamps: true });

userSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    this.confirm_password = undefined;
    this.passwordChangedAt = Date.now();
    next();
  }else{
    return next()
  }
});

userSchema.pre(/^find/, function (next) {
    // Ensure skipMiddleware is checked correctly and combined query is set
    if (!this.getOptions().skipMiddleware) {
      // Combine both conditions in a single .find() call
      this.find({
        suspended: false,
        $or: [
          { role: "student" },
          { role: "staff" }
        ]
      });
    }
    next();
});


userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.isPasswordChanged = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

userSchema.methods.createResetToken = async function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetTokenExpiresIn = Date.now() + process.env.RESET_TOKEN_EXPIRES_IN * 60 * 1000;
    return resetToken;
};

userSchema.methods.isResetTokenExpired = function() {
    return Date.now() > this.resetTokenExpiresIn;
};
userSchema.index({name: 'text',matricNo: 'text',email: 'text',mobileNumber: 'text'})
// Apply cache middleware to the schema
applyCacheToQueries(userSchema);
const User = mongoose.model("User", userSchema);

module.exports = User;
