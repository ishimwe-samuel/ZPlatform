const Sentry = require("@sentry/node");
const { Sequelize } = require("sequelize");
const { User, UserProfile } = require("../models");
const deleteFile = require("../utils/deleteFile");
const validateUserProfile = require("../validators/validateUserProfile");
const userEmitter = require("../events/eventEmitters");

const allUsers = async (req, res) => {
  try {
    const { status, query } = req.query;
    const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
    const pageSize = 10; // Get the page size from query parameters

    const offset = (page - 1) * pageSize;

    let whereClause = {};

    // Check if the 'name' parameter is present in the query
    if (query) {
      whereClause = {
        [Sequelize.Op.or]: [
          { email: { [Sequelize.Op.like]: `%${query}%` } },
          { "$profile.firstName$": { [Sequelize.Op.like]: `%${query}%` } },
          { "$profile.lastName$": { [Sequelize.Op.like]: `%${query}%` } },
        ],
      };
    }

    if (status) {
      whereClause.status = { [Sequelize.Op.eq]: status };
    }
    const users = await User.findAndCountAll({
      where: { admin: false, ...whereClause },
      attributes: { exclude: ["password", "userId"] },
      include: "profile",
      offset: offset,
      limit: pageSize,
      order: [["createdAt", "DESC"]], // Adjust the order as per your requirement
    });
    const { count, rows } = users;
    const totalPages = Math.ceil(count / pageSize);

    res.status(200).json({
      count,
      totalPages: totalPages,
      currentPage: page,
      results: rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    Sentry.captureException(error);
  }
};
const userDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [
        {
          model: UserProfile,
          as: "profile",
        },
      ],
      attributes: { exclude: ["password"] },
    });
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ error: "User with this id was not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    Sentry.captureException(error);
  }
};
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    const userUpdate = await User.update(
      { status: status },
      { where: { id: id } }
    );

    res.status(200).json(userUpdate);
    userEmitter.emit("user-verified", { userId: id });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    Sentry.captureException(error);
  }
};
const updateProfile = async (req, res) => {
  try {
    let user = req.user;
    const {
      firstName,
      lastName,
      gender,
      dob,
      maritalStatus,
      nationality,
      nationalId,
    } = req.body;
    try {
      let userProfile = await UserProfile.findOne({
        where: { userId: user.id },
      });
      if (userProfile) {
        if (firstName) {
          userProfile.firstName = firstName;
        }
        if (lastName) {
          userProfile.lastName = lastName;
        }
        if (gender) {
          userProfile.gender = gender;
        }
        if (dob) {
          userProfile.dob = dob;
        }
        if (maritalStatus) {
          userProfile.maritalStatus = maritalStatus;
        }
        if (nationality) {
          userProfile.nationality = nationality;
        }
        if (nationalId) {
          userProfile.nationalId = nationalId;
        }
        if (req.files && req.files["profilePicture"]) {
          // remove user associated file and replace with new one
          deleteFile(userProfile.profilePicture);
          userProfile.profilePicture = req.files["profilePicture"][0].path;
        }
        if (req.files && req.files["nationalIdDocument"]) {
          // remove user associated file and replace with new one
          deleteFile(userProfile.nationalIdDocument);
          userProfile.nationalIdDocument =
            req.files["nationalIdDocument"][0].path;
        }
        userProfile.save();
      } else {
        validateUserProfile(req.body);
        let profilePicture = req.files["profilePicture"][0].path;
        let nationalIdDocument = req.files["nationalIdDocument"][0].path;
        let userProfileInstance = await UserProfile.create({
          firstName,
          lastName,
          gender,
          profilePicture,
          dob,
          maritalStatus,
          nationality,
          nationalId,
          nationalIdDocument,
        });
        user.setProfile(userProfileInstance);
      }
      res.status(200).json(userProfile);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
    Sentry.captureException(error);
  }
};
const updateMFA = async (req, res) => {
  try {
    let user = await User.findByPk(req.user.id, { include: "mfa" });
    const { authType } = req.body;
    if (["LINK", "OTP", "PASSWORD"].indexOf(authType) !== -1) {
      await user.mfa.update({ authType });
      return res.status(200).json(user.mfa);
    } else {
      return res.status(400).json({ error: "Wrong auth type" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    Sentry.captureException(error);
  }
};

module.exports = {
  updateUserStatus,
  updateProfile,
  allUsers,
  userDetail,
  updateMFA,
};
