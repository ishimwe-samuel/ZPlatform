"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: { type: Sequelize.STRING, unique: true },
      password: Sequelize.STRING,
      status: {
        type: Sequelize.ENUM(["UNVERIFIED", "PENDING", "VERIFIED"]),
        defaultValue: "UNVERIFIED",
      },
      active: { type: Sequelize.BOOLEAN, defaultValue: false },
      admin: { type: Sequelize.BOOLEAN, defaultValue: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
