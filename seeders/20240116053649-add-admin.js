"use strict";
const bcrypt = require("bcrypt");
const { User } = require("../models");
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    let password = "Zplatformadmin@123$";
    const encryptedPassword = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_SALT)
    );
    const userSeedData = [
      {
        email: "admin@zplatform.com",
        password: encryptedPassword,
        status: "VERIFIED",
        active: true,
        admin: true,
      },
      // Add more seed data as needed
    ];
    await User.sync({ force: true });
    await User.bulkCreate(userSeedData);
    // await queryInterface.bulkInsert(
    //   Sequelize.User,
    //   [
    //     {
    //       email: "admin@zplatform.com",
    //       password: encryptedPassword,
    //       status: "VERIFIED",
    //       active: true,
    //       admin: true,
    //     },
    //   ],
    //   {}
    // );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
