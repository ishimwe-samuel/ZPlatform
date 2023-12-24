const cors = require("cors");
const express = require("express");
require("./events/eventEmitters.js");
require("./handlers/eventHandlers.js");
require("dotenv").config({ path: ".env" });

const app = express();
require("dotenv").config();
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
