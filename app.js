const cors = require("cors");
const express = require("express");
// user events
require("./events/eventEmitters.js");
require("./handlers/eventHandlers.js");
// auth events
require("./events/authEventEmitters.js");
require("./handlers/authEventHandler.js");
require("dotenv").config({ path: ".env" });

const app = express();
const routes = require("./routes");
// routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.get("/api", (req, res) => {
  res.json("Welcome to ZPlatform!").status(200);
});
app.use("/api/", routes);
module.exports = app;
