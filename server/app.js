const express = require('express');
const rateLimiter = require("express-rate-limit");
const mongoSanitizer = require("express-mongo-sanitize");
const helmet = require("helmet");
const hpp = require("hpp");
const xssFilters = require("xss-filters");
const path = require('path');
const cookieParser = require('cookie-parser');
const globalErrorController = require("./controller/errorController");
const morgan = require("morgan");
const cors = require("cors");
const customError = require('./utils/customError');
const session=require("express-session");
const { secureHelmet } = require('./utils/helmetSecurity');
const compression = require('compression');
const flash=require('connect-flash')
//const User = require('./models/User');
const { default: mongoose } = require('mongoose');
const logger = require('./utils/node_logger');
const origin = require('./config/origin')
const scheduleFailedMails = require('./utils/runFailedEmails');
//passport config
const app = express();

// Middleware to parse cookies
app.use(cookieParser()); 
// Enable express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies (form submissions)
//passport config for express session
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { 
       secure: process.env.NODE_ENV === 'production',  
       maxAge: parseInt(process.env.JWT_EXPIRES_IN.split('h')[0], 10) * 3600 * 1000
    }
}));
app.use(flash());
app.use((req,res,next)=>{
    res.locals.success_msg=req.flash('success')
    res.locals.error_msg=req.flash('error')
    next();
})
// Security measures and security policies mimicking https secure headers
// Adjust your Content Security Policy settings
app.use(helmet(secureHelmet));
app.use(hpp());
app.use(mongoSanitizer()); // Sanitize request body
const sanitizeInput = (req, res, next) => {
    req.params = sanitizeObject(req.params);
    req.query = sanitizeObject(req.query);
    req.body = sanitizeObject(req.body);
    next();
};
//sanitize inputs from users, sort of security measures
const sanitizeObject = (obj) => {
    const sanitizedObj = {};
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            sanitizedObj[key] = xssFilters.inHTMLData(obj[key]);
        }
    }
    return sanitizedObj;
};
app.use(sanitizeInput); // Apply the middleware to all routes
app.use(compression({
    level: 6,
    threshold: 0,
    filter:(req,res)=>{
        if(!req.headers['x-no-compression']){
            return compression.filter(req,res);
        }
        return false; // Don't apply compression if 'x-no-compression' header is present
    }
}));
//************update all schema******************** */
 app.use(async(req,res,next)=>{
    next();
}) 
const limiter = rateLimiter({
    max: 1500, //maximum of 1000 request from an app to my api
    windowMs: 60 * 60 * 1000, // 1 hour
    handler: (_,res)=>{
        res.status(429).send({
          status: "fail",
          message: 'Too many requests from this IP, try again later in about 1 hour.'
        })
      }
});
const limiterForLogin = rateLimiter({
    max: 5, //maximum of 1000 request from an app to my api
    windowMs: 60 * 60 * 1000, // 1 hour
    handler: (req,res)=>{
      res.status(429).send({
        status: "fail",
        message: 'You have tried logging in too may times, try again after an hour.'
      })
    }
});
app.use('/api/user/login', limiterForLogin);
app.use('/api/admin/login', limiterForLogin);
app.use('/api*', limiter);

if (process.env.NODE_ENV === "development") {
    const allowedOrigins = origin.origin().all;
    app.use(cors({
        origin: function (origin, callback) {
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(morgan("dev"));
}else{
    app.use(cors())
}
mongoose.connection.on('connected', () => {
    console.log('MongoDB is ready, starting failed  mail job.');
    scheduleFailedMails(); // Start the cron job once MongoDB is connected
});
  
mongoose.connection.on('error', (err) => {
logger.error('MongoDB connection error:', err);
});
//**** route middle-wares *****
app.use("/api/admin", require("./routes/adminRoute")); // admin router middleware
app.use("/api/user", require("./routes/userRoute")); // User router middleware
app.use("/api/book", require('./routes/bookRoute')); // book router middleware
//get user session token for login
app.get("/api/access-token", (async (req, res, next) => {
try{
    const token = req.cookies.auth_token;
    if(!token){
        return res.status(401).send({
            status: 'error',
            message: "User not authorized, pls login or sign-up"
        });
    }
    return res.status(200).json({
        status: "success",
        data: {
            token: token
        }
    });
}catch(error){
 next(error)
}
}));
//route to log users out
app.get("/api/logout", (req, res, next) => {
    // Clear the token cookie
    res.clearCookie('auth_token');
    return res.status(200).json({
        status: "success",
        message: "Logged out successfully..."
    });
});

// Set Headers for All Static Files Served from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Specific Route for Profile Images
app.get('/api/uploads/profile-images/:imageName', (req, res) => {
    const imagePath = path.join(__dirname, 'uploads', 'profile-images', req.params.imageName);
    res.sendFile(imagePath, (err) => {
        if (err) {
            res.status(404).send('Image not found');
        }
    });
});
app.get('/api/uploads/profile-admins-images/:imageName', (req, res) => {
    const imagePath = path.join(__dirname, 'uploads', 'profile-admins-images', req.params.imageName);
    res.sendFile(imagePath, (err) => {
        if (err) {
            res.status(404).send('Image not found');
        }
    });
});
app.get('/api/uploads/idcard-admins-images/:imageName', (req, res) => {
    const imagePath = path.join(__dirname, 'uploads', 'idcard-admins-images', req.params.imageName);
    res.sendFile(imagePath, (err) => {
        if (err) {
            res.status(404).send('Image not found');
        }
    });
});
app.get('/api/uploads/idcard-images/:imageName', (req, res) => {
    const imagePath = path.join(__dirname, 'uploads', 'idcard-images', req.params.imageName);
    res.sendFile(imagePath, (err) => {
        if (err) {
            res.status(404).send('Image not found');
        }
    });
});
app.get('/api/uploads/book-images/:imageName', (req, res) => {
    const imagePath = path.join(__dirname, 'uploads', 'book-images', req.params.imageName);
    res.sendFile(imagePath, (err) => {
        if (err) {
            res.status(404).send('Image not found');
        }
    });
});
// Serve React app
app.use(express.static(path.join(__dirname, "./dist")));
// Serve static files from React build file
app.get('/*', (_, res) => {
    res.sendFile(path.join(__dirname, "./dist", "index.html"));
});
// Handle invalid routes
app.all("*", (req, _, next) => {
    next(new customError(`Can't find this page or route ${req.originalUrl}`, 400));
});
//middle-ware to handle all errors
app.use(globalErrorController);

module.exports = app;
