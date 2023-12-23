const generateOTP = (otpLength = 6) => {
  // Define the length of the OTP

  // Generate a random OTP
  const otp = Math.floor(Math.random() * Math.pow(10, otpLength));

  // Ensure the OTP has the desired length
  const formattedOTP = String(otp).padStart(otpLength, "0");

  return formattedOTP;
};

module.exports = generateOTP;
