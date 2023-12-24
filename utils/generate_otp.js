const generateOTP = (otpLength = 6) => {
  // Ensure that the OTP length is at least 1
  if (otpLength < 1) {
    throw new Error("OTP length must be at least 1");
  }

  // Generate a random OTP excluding the first digit
  const remainingDigits = otpLength - 1;
  const randomPart = Math.floor(Math.random() * Math.pow(10, remainingDigits));

  // Ensure the remaining part has the desired length
  const formattedRandomPart = String(randomPart).padStart(remainingDigits, "0");

  // Concatenate a non-zero digit at the beginning
  const firstDigit = Math.floor(Math.random() * 9) + 1; // Random digit from 1 to 9
  const formattedOTP = String(firstDigit) + formattedRandomPart;

  return formattedOTP;
};

module.exports = generateOTP;
