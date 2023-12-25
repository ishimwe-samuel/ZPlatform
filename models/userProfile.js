const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const userProfile = sequelize.define(
    "UserProfile",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: DataTypes.UUID,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      gender: {
        type: DataTypes.ENUM(["F", "M"]),
      },
      profilePicture: DataTypes.STRING,
      dob: DataTypes.DATEONLY,
      age: {
        type: DataTypes.VIRTUAL,
        get() {
          return moment().year()-moment(this.dob).year();
        },
        set(value) {
          throw new Error("Do not try to set the `fullName` value!");
        },
      },
      maritalStatus: {
        type: DataTypes.ENUM(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
      },
      nationality: DataTypes.STRING,
      nationalId: DataTypes.BIGINT,
      nationalIdDocument: DataTypes.STRING,
    },
    {
      tableName: "user_profile",
    }
  );
  return userProfile;
};
