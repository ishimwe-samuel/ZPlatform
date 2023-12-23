const nodemailer = require("nodemailer");
require("dotenv").config();
const sendMail = async (recipient, subject, message) => {
  /**
     * EMAIL_HOST_USER=solvitcadet@gmail.com
EMAIL_HOST_PASSWORD=dxmjoqfoeewnfigh
     */
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: subject,
    html: message,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email send: ${info.response}`);
    }
  });
};
module.exports = sendMail;
