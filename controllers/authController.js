const Sentry = require("@sentry/node");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userEmitter = require("../events/eventEmitters");
const authEmitter = require("../events/authEventEmitters");
const validatePassword = require("../validators/password_validator");
const { User, OTP, Token } = require("../models");

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
          .json({ error: "Something went wrong please try again" });
      }
    } catch (error) {
      return res.status(400).json({ password: error.message });
    }
  } catch (error) {
    if (error.errors) {
      if (error.errors[0].validatorKey === "not_unique") {
        return res
          .status(400)
          .json({ error: "User with this email exist or phone number" });
      }
      return res.status(400).json({ error: error.errors[0].message });
    }
    return res.status(400).json({ error: "Something went wrong" });
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
          await otp.destroy();
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
    res.status(500).json({ error: "Something went wrong!" });
    Sentry.captureException(error);
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
    res.status(500).json({ error: "Something went wrong!" });
    Sentry.captureException(error);
  }
};
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    let userToken = await Token.findOne({
      where: { userId: user.id, tokenType: "RESET_PASSWORD" },
    });
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
    res.status(500).json({ error: "Something went wrong!" });
    Sentry.captureException(error);
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
    res.status(500).json({ error: "Something went wrong!" });
    Sentry.captureException(error);
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    } else {
      let user = await User.findOne({
        where: { email },
        include: "mfa",
      });
      if (user && !user.active) {
        return res.status(400).json({
          error:
            "Your account is inactive, please activate your account before login",
        });
      }
      if (user && (await bcrypt.compare(password, user.password))) {
        if (user.mfa.authType === "PASSWROD") {
          const token = jwt.sign(
            {
              userId: user.id,
            },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: "1h" }
          );

          return res.status(200).json({ token: token });
        } else if (user.mfa.authType === "OTP") {
          authEmitter.emit("mfa-otp", { user });
          res.status(200).json({
            "2fa": "OTP",
          });
        }
      } else {
        return res.status(400).json({ error: "Wrong email or password" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
    Sentry.captureException(error);
  }
};
const userPreAuth = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ email: "Email is required" });
    }
    let user = await User.findOne({ where: { email }, include: "mfa" });
    if (user) {
      if (!user.active) {
        return res.status(400).json({
          error:
            "Your account is inactive, please activate your account before login",
        });
      }
      // if login type is not password then send mail

      if (user.mfa.authType === "LINK") {
        authEmitter.emit("mfa-link", { user });
      }
      return res.status(200).json({ mfa: user.mfa, userId: user.id });
    } else {
      return res
        .status(404)
        .json({ email: "User with this email does not exists" });
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
    Sentry.captureException(error);
  }
};
const OTPLogin = async (req, res) => {
  try {
    const { otp, email } = req.body;
    if (!otp) {
      return res.status(400).json({ error: "OTP code is required" });
    }
    if (!email) {
      return res.status(400).json({ error: "OTP code is required" });
    }
    let user = await User.findOne({
      where: { email },
      include: "profile",
      attributes: { exclude: ["password"] },
    });
    if (user) {
      let userOTP = await OTP.findOne({
        where: { userId: user.id, otp: String(otp) },
      });

      if (userOTP && userOTP.isValid()) {
        const token = jwt.sign(
          {
            userId: user.id,
          },
          process.env.ACCESS_TOKEN_KEY,
          { expiresIn: "1h" }
        );
        await userOTP.destroy();
        return res.status(200).json({ token, user: user });
      } else {
        return res.status(403).json({ error: "The OTP provided has expired" });
      }
    } else {
      return res
        .status(400)
        .json({ error: "User with this email was not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
    Sentry.captureException(error);
  }
};
const verifyLoginLink = async (req, res) => {
  try {
    const { token, userId } = req.body;

    let user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (user) {
      let userToken = await Token.findOne({
        where: { userId: user.id, tokenType: "LOGIN_LINK" },
      });
      if (userToken) {
        const isValid = await bcrypt.compare(token, userToken.token);
        if (!isValid) {
          return res
            .status(404)
            .json({ error: "Invalid or expired password reset token" });
        } else {
          // TOken is valid
          const token = jwt.sign(
            {
              userId: user.id,
            },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: "1h" }
          );
          return res.status(200).json({ token: token, user: user });
        }
      } else {
        return res
          .status(403)
          .json({ error: "Invalid or expired login token" });
      }
    } else {
      return res
        .status(404)
        .json({ error: "User with this id does not exists" });
    }
  } catch (error) {}
};
module.exports = {
  userRegistration,
  login,
  OTPLogin,
  resendOTP,
  otpVerification,
  resetPassword,
  setPassword,
  userPreAuth,
  verifyLoginLink,
};
