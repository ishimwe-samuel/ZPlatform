const moment = require("moment");
const isValidOTP = () => {
  const givenDateTime = moment(this.createdAt);
  // Current date and time
  const currentDateTime = moment();
  // Add 5 minutes to the current date and time
  const futureDateTime = currentDateTime.clone().add(5, "minutes");
  // Check if the future date and time is equal to the given date and time
  const isEqual = futureDateTime.isSame(givenDateTime);
  return isEqual;
};
module.exports = isValid;
