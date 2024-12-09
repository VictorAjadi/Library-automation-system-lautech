const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');

const config = {
    service: process.env.SERVICE,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS
    }
};

const sendEmail = async (option, type) => {
    let email;
    const transporter = nodemailer.createTransport(config);
    const copyright= `Copyright © ${new Date().getFullYear()} Lautech. All rights reserved.`
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Devon Tutorial',
            link: option.link || 'https://lautech.com' // Provide a default link if option.link is not provided
        }
    });
    if (type === "register") {
        const emailForRegister = {
            body: {
                name: `${option.name}`,
                intro: "Welcome to Lautech! We're very excited to have you on board, Thanks for signing up with us! We hope you enjoy your time with us. Check your account to update your profile.",
                outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
                copyright
            }
        };
        email = mailGenerator.generate(emailForRegister);
    } else if (type === "reset") {
        const emailForReset = {
            body: {
                name: `${option.name}`,
                action: {
                    instructions: `To reset your password, please click the following link below, the link will expire in the next ${process.env.RESET_TOKEN_EXPIRES_IN} minutes`,
                    button: {
                        color: '#ffc107',
                        text: 'Reset your password',
                        link: option.url
                    }
                },
                outro: "If you did not request a password reset, no further action is required.",
                copyright
            }
        };
        email = mailGenerator.generate(emailForReset);
    } else if (type === "request") {
        const emailForRequest = {
            body: {
                name: `${option.instructorName}`,
                intro: `Good day, my name is ${option.studentName}. I would like to apply for your course titled ${option.courseTitle}. Please kindly accept my request, thank you.`,
                outro: `If you will be putting a price on this course, please send me an email via ${option.studentEmail} to negotiate. Thanks for your time.`,
                copyright
            }
        };
        email = mailGenerator.generate(emailForRequest);
    }else if (type === "suspend") {
        const emailFromContact = {
            body: {
                name: `${option.name}`,
                intro: `This account violates our policy e.g excessive bad report from other users. so as a result of that your acount is currently on suspension.`,
                outro: `Need help, or have questions? Just reply to this email, we'd love to help.`,
                copyright
            }
        };
        email = mailGenerator.generate(emailFromContact);
    }else if (type === "unsuspend") {
        const emailFromContact = {
            body: {
                name: `${option.name}`,
                intro: `We're very excited to have you back on board, it's been a while. Thanks for your patience during the period your acount was suspended, you can now access your account back.`,
                outro: `Need help, or have questions? Just reply to this email, we'd love to help.`,
                copyright
            }
        };
        email = mailGenerator.generate(emailFromContact);
    }else if(type==="otp"){
        const emailForOTP = {
            body: {
                name: option.name,
                intro: `Your verification code is ${option.otp}. It is valid for the next ${option.validDuration} minutes.`,
                action: {
                    instructions: 'To verify your email, please use the following OTP code:',
                    button: {
                        color: '#22BC66', // Optional, set your preferred button color
                        text: option.otp, // The OTP code
                    }
                },
                outro: `If you did not request this code, please disregard this email. Need help or have questions? Just reply to this email, we'd love to assist.`,
                copyright
            }
        };
        
        email = mailGenerator.generate(emailForOTP);
        
    }

    let emailOptions = {
        from: process.env.COMPANY_EMAIL,
        to: type === "message" ? "zemonglobal@gmail.com" : option.email,
        subject: option.subject || 'Notification from Devon',
        html: email
    };

    await transporter.sendMail(emailOptions);

};

module.exports = sendEmail;