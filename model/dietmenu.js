const mongoose = require("mongoose");

const dietMenu = mongoose.Schema({
  foodName: {
    type: String,
    required: false,
  },
  kcal: {
    type: Number,
    required: false,
  },
  protein: {
    type: Number,
    required: false,
  },
  water: {
    type: Number,
    reqruied: false,
  },
  mineral: {
    type: Number,
    required: false,
  },
  carbohydrate: {
    type: Number,
    required: false,
  },
});

const NewDietMenu = mongoose.model("dietmenu", dietMenu);

module.exports = NewDietMenu;
