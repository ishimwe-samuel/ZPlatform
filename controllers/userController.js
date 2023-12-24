const Sentry = require("@sentry/node");
const { User, UserProfile } = require("../models");
const deleteFile = require("../utils/deleteFile");
const validateUserProfile = require("../validators/validateUserProfile");

const allUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      where: { admin: false },
    });
    res.status(200).json(users);
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
    const userDeletion = await User.update(
      { active: status },
      { where: { id: id } }
    );
    res.status(200).send();
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
      const profilePicture = req.files["profilePicture"][0].filename;
      const nationalIdDocument = req.files["nationalIdDocument"][0].filename;
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
        if (profilePicture) {
          // remove user associated file and replace with new one
          deleteFile(userProfile.profilePicture);
          userProfile.profilePicture = profilePicture;
        }
        if (nationalIdDocument) {
          // remove user associated file and replace with new one
          deleteFile(userProfile.nationalIdDocument);
          userProfile.nationalIdDocument = nationalIdDocument;
        }
        userProfile.save();
      } else {
        validateUserProfile(req.body);
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
      res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
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
};
