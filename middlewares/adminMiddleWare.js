const jwt = require("jsonwebtoken");
const { User } = require("../models");
const TokenParser = require("../utils/tokenParser");

const auth = async (req, res, next) => {
  try {
    if (req.originalUrl.startsWith("/api/v1/auth/")) {
      return next();
    } else {
      if (
        req.headers["authorization"] === undefined ||
        req.headers["authorization"] === null ||
        req.headers["authorization"] === ""
      ) {
        return res.status(401).json({ message: "Token is required" });
      } else {
        const authHeader = req.headers["authorization"];
        let token = authHeader && authHeader.split(" ")[1];
        const parsedToken = TokenParser(token);
        const getUserByToken = await User.findByPk(parsedToken.userId, {
          attributes: { exclude: ["password"] },
        });
        if (!getUserByToken) {
          return res.status(401).json({ message: "Unauthorized" });
        } else {
          jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, user) => {
            if (err) {
              return res.status(401).json({ message: "Token has expired" });
            } else {
              req.user = getUserByToken;
              return next();
            }
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
module.exports = auth;
