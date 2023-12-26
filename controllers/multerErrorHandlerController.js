const Sentry = require("@sentry/node");
const handleMulterException = async (err, req, res, next) => {
  if (!req.file) {
    // No file uploaded, allow the request to continue
    return next();
  }
  res.status(400).json({ error: err.message });
  Sentry.captureException(err);
};
module.exports = handleMulterException;
