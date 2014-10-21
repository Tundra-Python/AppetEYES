var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  restaurantID: String,
  foodCategory: String
});

module.exports = mongoose.model('image', ImageSchema);
