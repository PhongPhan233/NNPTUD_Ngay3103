const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "04624ae7b04ac6",
        pass: "357cd936d1942e"
    }
});

async function sendMail(to, html) {
    await transporter.sendMail({
        from: '"Admin" <no-reply@example.com>',
        to: to,
        subject: "Tài khoản của bạn",
        html: html
    });
}

transporter.verify(function (error, success) {
    if (error) {
        console.log("SMTP ERROR:", error);
    } else {
        console.log("SMTP READY");
    }
});
module.exports = { sendMail };
//af3d588b7fd7e4248ad3de607f68c93b