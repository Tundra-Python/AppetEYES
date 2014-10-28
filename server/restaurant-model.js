var mongoose = require('mongoose');

var RestaurantSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  restaurantName: String,
  address: String,
  phoneNumber: String
});

module.exports = mongoose.model('restaurant', RestaurantSchema);
