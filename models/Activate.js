const mongoose = require("mongoose");

const activate = mongoose.Schema({
  email: {
    unique: true,
    type: String
  },
  id: {
    unique: true,
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Activating", activate);