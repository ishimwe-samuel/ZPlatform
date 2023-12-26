const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigits = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);
  if (!password) {
    throw new Error("password is required");
  }
  if (password.length < 8) {
    // Password is too short
    throw new Error("Your password is too short");
  }
  if (!hasUpperCase) {
    throw new Error("Password must contain at least one uppercase character");
  }
  if (!hasLowerCase) {
    throw new Error("Password must contain at least one lowercase character");
  }
  if (!hasDigits) {
    throw new Error("Password must contain at least one digit");
  }
  if (!hasSpecialChars) {
    throw new Error("Password must contain at least one special character");
  }
  return true;
};
module.exports = validatePassword;
