const Sentry = require("@sentry/node");
const handleMulterException = async (err, req, res, next) => {
  res.status(400).json({ error: err.message });
  Sentry.captureException(err);
};
module.exports = handleMulterException;
