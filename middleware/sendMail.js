const nodemailer = require("nodemailer");

const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        // host: process.env.SMTP_HOST,
        // port: process.env.SMTP_PORT,
        // service: process.env.SMTP_SERVICE,
        // auth:{
        //     user: process.env.SMTP_MAIL,
        //     pass: process.env.SMTP_PASSWORD,
        // },
        host: "mail.resellersprint.com",
        port: 465,
        secure: true,
        auth: {
            user: "admin@resellersprint.com",
            pass: "Great-2030-Gen",
        }
    });

    const mailOptions = {
        from: "admin@resellersprint.com",
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;