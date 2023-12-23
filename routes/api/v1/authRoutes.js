const express = require("express");
const upload = require("../../../controllers/uploadController");

const {
  userRegistration,
  forgotPassword,
  login,
  updateUserStatus,
  resendOTP,
  otpVerification,
  resetPassword,
  setPassword,
  updateProfile,
} = require("../../../controllers/authController");
const router = express.Router();
router.post("/sign-in/", login);
router.post("/sign-up/", userRegistration);
router.post("/resend-otp/:id/", resendOTP);
router.post("/verify-otp/", otpVerification);
router.post("/forgot-password/", resetPassword);
router.post("/set-password/", setPassword);

module.exports = router;
