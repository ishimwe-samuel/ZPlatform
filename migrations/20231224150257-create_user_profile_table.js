"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_profile", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: Sequelize.UUID,
      firstName: Sequelize.STRING,
      lastName: Sequelize.STRING,
      gender: {
        type: Sequelize.ENUM(["F", "M"]),
      },
      profilePicture: Sequelize.STRING,
      dob: Sequelize.DATEONLY,
      maritalStatus: {
        type: Sequelize.ENUM(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
      },
      nationality: Sequelize.STRING,
      nationalId: Sequelize.BIGINT,
      nationalIdDocument: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("user_profile");
  },
};
