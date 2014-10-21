var mongoose = require('mongoose');

var UserImageSchema = mongoose.Schema({
  userID: String,
  imageID: String,
  liked: Boolean
});

module.exports = mongoose.model('userImage', UserImageSchema);