module.exports = () => {
  require("dotenv").config();
  const mongoose = require("mongoose");

  mongoose
    .connect(process.env.MONGO_DB_URI)
    .then((result) => {
      console.log("mongoose is connected.");
    })
    .catch((err) => {
      console.log(err);
    });
};
