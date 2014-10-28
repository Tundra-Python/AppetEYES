var Q = require('q');
var mongoose = require('mongoose');
var Image = require('./image-model.js');
var Restaurant = require('./restaurant-model.js');

module.exports = {

  saveRestaurant: function(req, res, next){

    //request body should contain an array of restaurants
    //returned by the yelp search API
    var searchResults = req.body.data;

    var findRestaurant = Q.nbind(Restaurant.findOne, Restaurant);
    var createRestaurant = Q.nbind(Restaurant.create, Restaurant);

    var saveSingleRestaurant = function(newRestaurant){

      if (newRestaurant) {

        var restaurant = {
          url: newRestaurant.mobileUrl,
          restaurantName: newRestaurant.name,
          address: newRestaurant.address.join(' \n'),
          phoneNumber: newRestaurant.phone
        };

        findRestaurant({url: restaurant.url})
        .then(function(result){
          if (!result) {
            return createRestaurant(restaurant);
          }
        })
        .then(function(result){
          if (result) {
            return module.exports.saveImage(newRestaurant.link, result._id);
          }
        })
        .then(function(image){
          saveSingleRestaurant(searchResults.shift());
        })
        .fail(function(error){
          console.log('Error in saving a restaurant result ', error);
          next(error);
        });

      } else {

        res.status(200).end();

      }

    };

    saveSingleRestaurant(searchResults.shift());

  },

  saveImage: function(image_url, restaurantID){

    var findImage = Q.nbind(Image.findOne, Image);
    var createImage = Q.nbind(Image.create, Image);

    findImage({url: image_url})
      .then(function(image){
        if (!image) {
          return createImage({
            url: image_url,
            restaurantID: restaurantID
          });
        }
      })
      .fail(function(error){
        next(error);
      });
      
  }

};
