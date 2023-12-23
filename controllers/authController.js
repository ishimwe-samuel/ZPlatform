const { User, OTP, Token, UserProfile } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userEmitter = require("../events/eventEmitters");
const validatePassword = require("../validators/password_validator");

const userRegistration = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ email: "email is required" });
    } else if (email) {
      let existingUser = await User.findOne({ where: { email: email } });
      if (existingUser) {
        return res
          .status(400)
          .json({ email: "A user is already registered with this email" });
      }
    }
    try {
      // validate password
      // this will throw an error which we cacth and send to frontend
      validatePassword(password);
      const encryptedPassword = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_SALT)
      );
      const userCreated = await User.create({
        password: encryptedPassword,
        email: email,
      });
      if (userCreated) {
        res.status(201).json({ email: userCreated.email, id: userCreated.id });
        userEmitter.emit("user-created", { user: userCreated });
        userEmitter.emit("myEvent", { someData: "value" });
        return;
      } else {
        return res
          .status(400)
          .json({ message: "Something went wrong please try again" });
      }
    } catch (error) {
      return res.status(400).json({ password: error.message });
    }
  } catch (error) {
    if (error.errors) {
      if (error.errors[0].validatorKey === "not_unique") {
        return res
          .status(400)
          .json({ message: "User with this email exist or phone number" });
      }
      return res.status(400).json({ message: error.errors[0].message });
    }
    return res.status(400).json({ message: "Something went wrong" });
  }
};
const otpVerification = async (req, res) => {
  try {
    let { otp, userId } = req.body;
    let errors = [];
    if (!otp) {
      errors.push({ otp: "OTP is required" });
    }
    if (!userId) {
      errors.push({ userId: "User ID is required" });
    }
    if (errors.length) {
      return res.status(400).json({ errors });
    } else {
      const user = await User.findOne({ where: { id: userId } });
      if (user) {
        let otp = await OTP.findOne({ where: { userId: userId } });
        if (otp && otp.active == true && otp.isValid() == true) {
          user.update({ active: true });
          userEmitter.emit("user-activated", { user: user });
          return res.status(204).send();
        } else {
          return res
            .status(403)
            .json({ error: "The OTP provided has expired" });
        }
      } else {
        return res.status(404).json({ error: "User with such id not found" });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong!" });
  }
};
const resendOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id: id } });
    if (user) {
      userEmitter.emit("resend-otp", { user: user });
      return res.status(204).send();
    } else {
      return res.status(404).json({ error: "User with such id not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong!" });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    let userToken = await Token.findOne({ where: { userId: user.id } });
    if (userToken) {
      await userToken.destroy();
    }
    if (user && user.active) {
      let resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = await bcrypt.hash(
        resetToken,
        Number(process.env.BCRYPT_SALT)
      );
      await Token.create({
        userId: user.id,
        token: resetTokenHash,
      });
      const link = `http://localhost:4000/passwordReset?token=${resetToken}&id=${user.id}`;
      userEmitter.emit("reset-password", { user: user, link: link });
      res.status(200).send();
    } else {
      return res
        .status(404)
        .json({ error: "User with this email was not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong!" });
  }
};
const setPassword = async (req, res) => {
  try {
    const { userId, token, password } = req.body;
    let errorList = [];
    if (!userId) {
      errorList.push({ userId: "User id is required" });
    }
    if (!token) {
      errorList.push({ token: "Token id is required" });
    }
    if (!password) {
      errorList.push({ password: "Password is required" });
    }
    if (errorList.length) {
      return res.status(400).json(errorList);
    }

    const user = await User.findOne({ where: { id: userId } });
    const tokenInstace = await Token.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    if (!tokenInstace) {
      return res
        .status(404)
        .json({ error: "Invalid or expired password reset token" });
    }
    const isValid = await bcrypt.compare((data = token), tokenInstace.token);
    if (!isValid) {
      return res
        .status(404)
        .json({ error: "Invalid or expired password reset token" });
    }
    try {
      // validate password
      // this will throw an error which we cacth and send to frontend
      validatePassword(password);
      const hashedPassword = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_SALT)
      );
      user.update({
        password: hashedPassword,
      });
      await tokenInstace.destroy();
      res.status(204).send();
    } catch (error) {
      return res.status(400).json({ password: error.message });
    }
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong!" });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    } else {
      let myUser = await User.findOne({ where: { email } });
      if (myUser && (await bcrypt.compare(password, myUser.password))) {
        const token = jwt.sign(
          {
            userId: myUser.id,
            username: myUser.firstName,
            userType: myUser.userType,
          },
          process.env.ACCESS_TOKEN_KEY,
          { expiresIn: "1h" }
        );
        return res.status(200).json({ token: token });
      }
      return res.status(400).json({ message: "Wrong email or password" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
module.exports = {
  userRegistration: userRegistration,
  login: login,
  resendOTP: resendOTP,
  otpVerification: otpVerification,
  resetPassword: resetPassword,
  setPassword: setPassword,
};
