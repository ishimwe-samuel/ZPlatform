const express = require("express");
const upload = require("../../../controllers/uploadController");

const {
  updateUserStatus,
  updateProfile,
} = require("../../../controllers/userController");
const router = express.Router();
router.patch("/user-status/:id/", updateUserStatus);
router.post(
  "/update-profile/",
  upload.fields([
    {
      name: "profilePicture",
      maxCount: 1,
    },
    {
      name: "nationalIdDocument",
      maxCount: 1,
    },
  ]),
  updateProfile
);
module.exports = router;
