const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
  const OTP = sequelize.define(
    "OTP",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID, allowNull: true },
      otp: { type: DataTypes.STRING, unique: true },
      active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "otp",
    }
  );
  OTP.prototype.isValid = function () {
    const givenDateTime = moment(this.createdAt);
    // Current date and time
    const currentDateTime = moment();
    // Add 5 minutes to the current date and time
    const futureDateTime = givenDateTime.clone().add(5, "minutes");
    // Check if the future date and time is equal to the given date and time
    return currentDateTime.isBefore(futureDateTime);
  };
  return OTP;
};
