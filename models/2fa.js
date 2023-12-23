module.exports = (sequelize, DataTypes) => {
  const twoFactorAuth = sequelize.define(
    "twoFactorAuth",
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
      tableName: "twofactor",
    }
  );
  twoFactorAuth.prototype.isValid = function () {
    const moment = require("moment");

    const givenDateTime = moment(this.createdAt);
    // Current date and time
    const currentDateTime = moment();
    // Add 5 minutes to the current date and time
    const futureDateTime = currentDateTime.clone().add(5, "minutes");
    // Check if the future date and time is equal to the given date and time
    const isEqual = futureDateTime.isSame(givenDateTime);
    return isEqual;
  };
  return twoFactorAuth;
};
