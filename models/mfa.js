module.exports = (sequelize, DataTypes) => {
  const MultiFactorAuth = sequelize.define(
    "MultiFactorAuth",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID },
      auth_type: {
        type: DataTypes.ENUM(["LINK", "OTP", "PASSWORD"]),
        defaultValue: "PASSWORD",
      },
    },
    {
      tableName: "mfa",
    }
  );
  return MultiFactorAuth;
};
