const db = require("./models/");
const app = require("./app");
db.sequelize.sync().then(() => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.warn(`Server started on port ${PORT}`));
});
