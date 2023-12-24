const express = require("express");
const upload = require("../../../controllers/uploadController");

const {
  userRegistration,
  login,
  resendOTP,
  otpVerification,
  resetPassword,
  setPassword,
  userPreAuth,
  OTPLogin,
} = require("../../../controllers/authController");
const router = express.Router();
router.post("/sign-in/", login);
router.post("/sign-in/otp/", OTPLogin);
router.post("/pre-auth/", userPreAuth);
router.post("/sign-up/", userRegistration);
router.post("/resend-otp/:id/", resendOTP);
router.post("/verify-otp/", otpVerification);
router.post("/forgot-password/", resetPassword);
router.post("/set-password/", setPassword);

module.exports = router;
