'use strict';
angular.module('Appeteyes.services', [])

.factory('Fooder',function(){


  var selected = {};
  var disliked = {};
  var picArr = [];

  return {
    isNotLoaded:true,
    addPics:function(arr){
      picArr = arr;
    },
    currentPics:function(){
      return picArr;
    },
    addToSelection:function(image){
      selected[image.name] = image;
      console.log(selected);
    },
    addToDisliked:function(image){
      disliked[image.name] = image;
      console.log(disliked);
    },
    getSelected:function(){
      return selected;
    },
    getDisliked:function(){
      return disliked;
    },
    resetPics:function(){
      picArr = [];
    },
    setLiked: function(priorLikes){
      for (var key in priorLikes){
        selected[key] = priorLikes[key];
      }
    },
    searchFood:function(name){
      console.log('Looking for this on selected',name);
      if(selected[name]=== undefined){
        return {
            name:'Not Found'
        };
      }else{
        return selected[name];
      } 
    }
  };
})

.factory('Yelper',function($http){

  return {
    search: function(category, location, offset){
      console.log('Searching for',category,location);
      var parsedLoc = location.split(' ').join('-');
      console.log('This is the thin',parsedLoc);
      var yelpUrl = category + '*' + parsedLoc + '*' + offset;
      return $http.get('/yelp/' + yelpUrl);
    },
    pics: function(){
      // return pictures;
    }
  };
})

.factory('Auth', function ($http, $location, $window, $state, Preferences) {

  var tokenKey = 'com.appeteyes'

  var login = function (user) {
    return $http({
      method: 'POST',
      url: '/users/signin',
      data: user
    })
    .then(function (resp) {
      if (resp.data.token) {
        $state.transitionTo('tab.appeteyes');
        Preferences.getLiked(function(priorLikes){
          Fooder.setLikes(priorLikes);
        });
      } else {
        $state.transitionTo('tab.account');
      }
      setToken(resp.data.token);
    });
  };

  var signup = function (user) {
    return $http({
      method: 'POST',
      url: '/users/signup',
      data: user
    })
    .then(function (resp) {
      setToken(resp.data.token);
      if (resp.data.token) $state.transitionTo('tab.appeteyes');
    });
  };

  var isAuth = function () {
    return !!$window.localStorage.getItem(tokenKey);
  };

  var signout = function () {
    $window.localStorage.removeItem(tokenKey);
  };

  var setToken = function(givenToken){
    $window.localStorage.setItem(tokenKey, givenToken);
  };

  var getToken = function(){
    return $window.localStorage.getItem(tokenKey);
  };

  return {
    login: login,
    signup: signup,
    isAuth: isAuth,
    signout: signout,
    setToken:setToken,
    getToken:getToken
  };

})

//Holds the logic for users to set up their 'preferences'
.factory('Preferences', function($http){
  //temp storage mechanism for cuisine types
  var cuisines = [
    'Give Me Random!',
    'Italian',
    'Thai',
    'American',
    'French',
    'Japanese',
    'Chinese',
    'Seafood',
    'Ethopian/Eritrean',
    'Burmese',
    'Mexican',
    'Mediterranean',
    'Middle Eastern',
    'Soul Food',
    'Korean',
    'Brazilian',
    'German',
    'Dessert'
  ];

  //object to be updated by controller based on user input. Later to be sent to server.
  var userPreferences = {
    cuisines: ['food'],
    location: 'San-Francisco'
  };

  return {
    //takes an array as a parameter and outputs array to controller
    listCuisines: function(){
      return cuisines;
    },

    preferences: function(){
      return userPreferences;
    },

    //retrieves stored user preferences from server/db
    importPreferences: function(callback){

      //send GET request to server - use response data to fill userSettings
      $http.get('/users/preferences')
        .then(function(data){
          console.log('data immediately from GET', data);
          userPreferences.cuisines = data.data.cuisines;
          userPreferences.location = data.data.location;
          if (callback) {
            callback(data.data);
          }
        })
        .catch(function(error){
          console.log('error in importing preferences ', error);
        });

      return userPreferences;

    },

    //takes an object with all preferences saved
    //and updates factory userSettings and sends preferences
    savePreferences: function(newPreferences){
      userPreferences.cuisines = newPreferences.cuisines;
      userPreferences.location = newPreferences.location;
      //send POST request to server with userSettings as data
      var promise = $http.post('/users/preferences', userPreferences);

      console.log('now I just send a post');
      console.log(userPreferences);
    },

    getLiked: function(callback){
      $http({
        method: 'GET',
        url: '/users/likes'
      })
      .then(function(result){
        callback(result);
      })
      .catch(function(error){
        console.log('error in getting liked pictures', error);
      });
    }

  };
});
