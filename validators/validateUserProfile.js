const validateUserProfile = (data) => {
  const {
    firstName,
    lastName,
    gender,
    dob,
    maritalStatus,
    nationality,
    nationalId,
  } = data;
  if (!firstName) {
    throw new Error("First Name  is required");
  }
  if (!lastName) {
    throw new Error("Last Name is required");
  }
  if (!gender) {
    throw new Error("Gender is required");
  }
  if (!dob) {
    throw new Error("Date of birth is required");
  }
  if (!maritalStatus) {
    throw new Error("Marital status is required");
  }
  if (!nationality) {
    throw new Error("Nationality is required");
  }
  if (!nationalId) {
    throw new Error("National id is required");
  }

  return;
};
module.exports = validateUserProfile;
