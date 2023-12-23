const express = require("express");
const userRoutes = require("./api/v1/userRoutes");
const authRoutes = require("./api/v1/authRoutes");
const auth = require("../middlewares/authMiddleWare");
const routes = express.Router();
routes.use("/v1/users/", auth, userRoutes);
routes.use("/v1/auth/", auth, authRoutes);
// routes
module.exports = routes;
