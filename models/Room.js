const mongoose = require('mongoose');

const Room = mongoose.Schema({
  id: String,
  type: String,
  members: Array,
  message: Array,
  unread: Object,
  pinMessage: Array
});

module.exports = mongoose.model('Room', Room);
