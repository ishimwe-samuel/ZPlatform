const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { Token, OTP } = require("../models");
const generateOTP = require("../utils/generate_otp");
const authEventEmitter = require("../events/authEventEmitters");
const sendMail = require("../utils/sendMail");

authEventEmitter.on("mfa-link", async ({ user }) => {
  // this event handler handles login link
  let loginToken = crypto.randomBytes(32).toString("hex");
  const loginTokenHash = await bcrypt.hash(
    loginToken,
    Number(process.env.BCRYPT_SALT)
  );
  let userToken = await Token.findOne({
    where: { userId: user.id, tokenType: "LOGIN_LINK" },
  });
  if (userToken) {
    await userToken.destroy();
  }
  let userLoginToken = await user.createUserToken({
    token: loginTokenHash,
    tokenType: "LOGIN_LINK",
  });

  const link = `https://zplatform.samueldev.com/${loginToken}/${user.id}`;
  let message = `
  <p>Hi</p>
  <p>Please use this link to login in int the zPLatform!</p>  
  <a href='${link}'>Login</a>
  `;
  sendMail(user.email, "zPlatform! Login Link", message);
  setTimeout(function () {
    userLoginToken.destroy()
  }, 600000);
});

authEventEmitter.on("mfa-otp", async ({ user }) => {
  if (user.mfa.authType === "OTP") {
    let otp = generateOTP();
    let userOtp = await OTP.create({ userId: user.id, otp: otp });
    let message = `
        <h3>Welcome to the <b>zPlatform!</b></h3>
        <p>Please use this code to login</p>
        <h1>${otp}</h1>
      `;
    sendMail(user.email, "zPlatform Login OTP", message);
    setTimeout(function () {
      userOtp.update({ active: false });
    }, 300000);
  }
});
