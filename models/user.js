module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: { type: DataTypes.STRING, unique: true },
      password: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM(["UNVERIFIED", "PENDING", "VERIFIED"]),
        defaultValue: "UNVERIFIED",
      },
      active: { type: DataTypes.BOOLEAN, defaultValue: false },
      admin: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: "user",
    }
  );
  return User;
};