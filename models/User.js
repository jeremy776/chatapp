const mongoose = require("mongoose");
const passportMongo = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  username: {
    type: String,
    unique: true
  },
  id: String,
  password: String,
  avatar: String,
  token: String,
  about: String,
  friends: Array,
  status: String,
  last_online: String,
  isBot: Boolean,
  isVerified: Boolean,
  badge: Array
}, {
  timestamps: true
});

const options = {
  usernameField: "email"
};

UserSchema.plugin(passportMongo, options);
module.exports = mongoose.model("User", UserSchema);