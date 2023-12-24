const userEmitter = require("../events/eventEmitters");
const { User, OTP, MultiFactorAuth } = require("../models");
const generateOTP = require("../utils/generate_otp");
const sendMail = require("../utils/sendMail");
userEmitter.on("user-created", async ({ user }) => {
  //  this event handler handles the newly create users
  let otp = generateOTP();
  let userOtp = await OTP.create({ userId: user.id, otp: otp });
  let message = `
    <h3>Welcome to the <b>zPlatform!</b></h3>
    <p>Please use this code to verify your account</p>
    <h1>${otp}</h1>
  `;
  sendMail(user.email, "Welcome to zPlatform", message);
  setTimeout(function () {
    userOtp.update({ active: false });
  }, 300000);
});
userEmitter.on("resend-otp", async ({ user }) => {
  let otp = generateOTP();
  await OTP.destroy({ where: { userId: user.id } });
  let userOtp = await OTP.create({ userId: user.id, otp: otp });

  let message = `
  <h3>Welcome to the <b>zPlatform!</b></h3>
  <p>Please use this code to verify your account</p>
  <h1>${otp}</h1>
`;
  sendMail(user.email, "Welcome to zPlatform", message);
  setTimeout(function () {
    userOtp.update({ active: false });
  }, 300000);
});
userEmitter.on("user-activated", async ({ user }) => {
  let message = `
  <h3>Welcome to the <b>zPlatform!</b></h3>
  <h1>Your account has be activated enjoy the zPlatform</h1>
`;
  sendMail(user.email, "Welcome to zPlatform", message);
  // create a mfa instance with password as default
  let userInstance = await User.findByPk(user.id);
  let mfa = await MultiFactorAuth.create();
  await userInstance.setMfa(mfa);
});
userEmitter.on("reset-password", ({ user, link }) => {
  let message = `
  <p>Hi</p>
  <p>It seems you are having trouble with your login please use this link to reset your password</p>  
  <a href='${link}'>Reset Password</a>
  `;
  sendMail(user.email, "Reset Password Request", message);
});
module.exports = {};
