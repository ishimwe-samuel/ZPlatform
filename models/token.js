module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define(
    "Token",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID },
      tokenType: {
        type: DataTypes.ENUM(["RESET_PASSWORD", "LOGIN_LINK"]),
        defaultValue: "RESET_PASSWORD",
      },
      token: DataTypes.STRING,
    },
    {
      tableName: "token",
    }
  );
  return Token;
};
