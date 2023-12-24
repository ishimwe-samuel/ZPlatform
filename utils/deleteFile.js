const fs = require("fs");
const path = require("path");
const deleteFile = (fileName) => {
  const filePath = path.join(__dirname, "../uploads", fileName); // A
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Handle the error (file doesn't exist)
      console.error("File does not exist:", filePath);
    } else {
      // File exists, so delete it
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          // Handle the error (failed to delete the file)
          console.error("Error deleting file:", unlinkErr);
        } else {
          console.log("File deleted successfully:", filePath);
        }
      });
    }
  });
};
module.exports = deleteFile;
