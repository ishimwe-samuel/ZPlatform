const { User, UserProfile } = require("../models");
const deleteFile = require("../utils/deleteFile");
const validateUserProfile = require("../validators/validateUserProfile");

const allUsers = async (req, res) => {
  try {
    const drivers = await User.findAll({
      attributes: { exclude: ["password"] },
      where: { admin: false },
    });
    res.status(200).json(drivers);
  } catch (error) {
    res.status(400).json({ message: "Something went wrong" });
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
        where: { userId: user.userId },
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
        await UserProfile.create({
          userId: user.userId,
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
      }
      res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  updateUserStatus: updateUserStatus,
  updateProfile: updateProfile,
  allUsers: allUsers,
};
