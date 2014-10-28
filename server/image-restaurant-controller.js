var Q = require('q'); // A Promise library
var mongoose = require('mongoose');
var User = require('./user-model.js');
var Image = require('./image-model.js');
var Restaurant = require('./restaurant-model.js');

module.exports = {

  saveUserLikes: function(req, res, next){ // Saves what the user liked/disliked to the database.
    //req.username is set by the middleware user.decode
    var username = req.username;
    var findUser = Q.nbind(User.findOne, User); // Creates a promisified function to find a single user based on a query
    var findImage = Q.nbind(Image.findOne, Image); // Creates a promisified function to find a single image based on a query
    console.log('request object', req.body);
    //request object should have a body that contains
    //newly liked/disliked images arrays
    findUser({username:username})// Combine locally stored liked/disliked images, then save to database.
      .then(function(user){
        if (!user) {
          next(new Error('user does not exist.'));
        } else {
          processImages(req.body.liked, function(newLikedImages){
            user.likedImages = newLikedImages;
            user.save(function(error){
              next(error);
            });
            processImages(req.body.disliked, function(newDislikedImages){
              user.dislikedImages = newDislikedImages;
              user.save(function(error){
                next(error);
              });
            });
          });

          res.status(200).end();
        }
      })
      .fail(function(error){
        next(error);
      });
  },

  getUserLikes: function(req, res, next){ 
    // retrieve likes from DB

    //req.username is set by the middleware user.decode
    var username = req.username;
    var findUser = Q.nbind(User.findOne, User); 
    var findImage = Q.nbind(Image.findOne, Image);
    var findRestaurant = Q.nbind(Restaurant.findOne, Restaurant);

    findUser({username:username})
      .then(function(user){

        if (!user) {
          next(new Error('user does not exist.'));
        } else {

          var savedLikes = {};
          var likedImages = user.likedImages;
          var numLikedImages = likedImages.length;

          var findOneRestaurant = function(imageId){
            findImage({_id: imageId})
            .then(function(image){
              if (!image) {
                console.log('Image not found in getUserLikes');
              } else {
                console.log('Image found');
                return [image.restaurantID, image.url];
              }              
            })
            .then(function(imageTuple){

              var restaurantID = imageTuple[0];
              var imageUrl = imageTuple[1];

              findRestaurant({_id: restaurantID})
              .then(function(restaurant){
                savedLikes[restaurant.restaurantName] = {
                  name: restaurant.restaurantName,
                  url: restaurant.url,
                  city: restaurant.address,
                  phone: restaurant.phoneNumber,
                  link: imageUrl
                };
                if (Object.keys(savedLikes).length === numLikedImages){
                  res.status(200).json(savedLikes);
                } else {
                  findOneRestaurant(likedImages.shift());
                }
              })
            })
            .fail(function(error){
              console.log('getUserLike error', error);
            })
          };

          findOneRestaurant(likedImages.shift());

        }//end if-else

      });

  },

  changeUserPreferences: function(req, res, next){ 
  // Save the user's last search preferences to DB
    //req.username is set by the middleware user.decode
    var username = req.username;
    //request should have new preferences in its body
    //it should be stored in a property called "newPreferences"
    //which should be an object
    var newPrefs = req.body;
    var findOne = Q.nbind(User.findOne, User); 

    //update the existing 
    findOne({username:username})
      .then(function(user){
        if (!user) {
          next(new Error('user does not exist.'));
        } else {
          user.location = newPrefs.location;
          user.cuisines = newPrefs.cuisines;
          console.log('USER', user);
          user.save(function(error){
            next(error);
          });
          res.status(200).end('Preferences saved');
        }
      })
      .fail(function(error){
        next(error);
      });
  },

  getUserPreferences: function(req, res, next){ 
  // Retrieves the user's last search preferences to DB
    //req.username is set by the middleware user.decode
    var username = req.username;
    var findOne = Q.nbind(User.findOne, User);

    //get an array of user preferred cuisines
    findOne({username: username})
      .then(function(user){
        //make sure user exists
        if (!user){
          next(new Error('user does not exist.'));
        } else {
          res.json({
            cuisines: user.cuisines,
            location: user.location
          });
        }
      })
      .fail(function(error){
        next(error);
      });
  },

  getRestaurantInfo: function(req, res, next){ 
  // Retrieve restaurant info based on the image selected
    //request body should contain the ImageID
    var imageID = req.body.imageID;
    var findImage = Q.nbind(Image.findOne, Image);
    var findRestaurant = Q.nbind(Restaurant.findOne, Restaurant);

    findImage({_id: ObjectId(imageID)})
      .then(function(image){
        if (!image) {
          next(new Error('image does not exist.'));
        } else {
          return findRestaurant({_id: ObjectId(image.restaurantID)})
        }
      })
      .then(function(restaurant){
        restaurant
          .then(function(restaurant){
            res.json(restaurant);
          })
          .fail(function(error){
            next(error);
          });
      })
      .fail(function(error){
        next(error);
      });

  }

};

var processImages = function(imageObject, callback){
//this function takes an array of image urls
//and looks them up in the images collection
//and returns a list of imageIDs

  var IDs = [];
  var findImage = Q.nbind(Image.findOne, Image);
  var imageArray = [];
  console.log('IMAGE OBJECT', imageObject);
  for (var key in imageObject){
    if (imageObject[key] && imageObject[key] !== ''){
      imageArray.push(imageObject[key]);
    }
  }
  var numImages = imageArray.length;
  console.log('IMAGE ARRAY', imageArray);
  var processOneImage = function(imageURL){
    findImage({url: imageURL})
    .then(function(image){
      if (image){
        IDs.push(image._id);
      }
      if (imageArray.length === 0){
        console.log('CALL BACK !!!!!!')
        callback(IDs); 
      } else {
        var nextImage = imageArray.shift()
        if (imageArray.length >= 0) processOneImage(nextImage.link);
      }
    })
    .fail(function(error){
      console.log('find image error', error);
    });
  };

  var firstImage = imageArray.shift();
  if (imageArray.length > 0) processOneImage(firstImage.link);

};