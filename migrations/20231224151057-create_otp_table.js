"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("otp", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: { type: Sequelize.UUID, allowNull: true },
      otp: { type: Sequelize.STRING, unique: true },
      active: { type: Sequelize.BOOLEAN, defaultValue: true },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("otp");
  },
};
