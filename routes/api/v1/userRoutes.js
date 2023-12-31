const express = require("express");
const upload = require("../../../controllers/uploadController");

const {
  updateUserStatus,
  updateProfile,
  allUsers,
  userDetail,
  updateMFA,
} = require("../../../controllers/userController");
const handleMulterException = require("../../../controllers/multerErrorHandlerController");
const router = express.Router();
router.get("/", allUsers);
router.get("/:id", userDetail);
router.patch("/:id/", updateUserStatus);
router.patch("/me/mfa/", updateMFA);
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
  handleMulterException,
  updateProfile
);
module.exports = router;
