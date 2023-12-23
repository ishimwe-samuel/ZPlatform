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
