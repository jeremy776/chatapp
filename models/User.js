const mongoose = require("mongoose");
const passportMongo = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  username: {
    type: String
  },
  id: String,
  password: String,
  avatar: String,
  token: String,
  birthday: String,
  about: String,
  friends: Array,
  status: String,
  last_online: String,
  isBot: Boolean,
  isVerified: Boolean,
  isDisabled: Boolean,
  badge: Array
}, {
  timestamps: true
});

const options = {
  usernameField: "email",
  errorMessages: {
    MissingPasswordError: 'No password was given',
    AttemptTooSoonError: 'Account is currently locked. Try again later',
    TooManyAttemptsError: 'Account locked due to too many failed login attempts',
    NoSaltValueStoredError: 'Authentication not possible. No salt value stored',
    IncorrectPasswordError: 'Password or email are incorrect',
    IncorrectUsernameError: 'Password or email are incorrect',
    MissingUsernameError: 'No email was given',
    UserExistsError: 'A user with the given email is already registered'
  }
};

UserSchema.plugin(passportMongo, options);
module.exports = mongoose.model("User", UserSchema);