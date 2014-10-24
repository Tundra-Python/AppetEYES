'use strict';
angular.module('Appeteyes.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [
    { id: 0, name: 'Scruff McGruff' },
    { id: 1, name: 'G.I. Joe' },
    { id: 2, name: 'Miss Frizzle' },
    { id: 3, name: 'Ash Ketchum' }
  ];



  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  };
})

.factory('Fooder',function(){

  var selected = [];
  var picArr = [];

  return {
    addPics:function(arr){
      picArr = arr;
    },
    currentPics:function(){
      return picArr;
    },
    isNotLoaded:true,

    addToSelection:function(image){
      selected.push(image);
    },
    getSelected:function(){
      return selected;
    },
    searchFood:function(name){
      for(var i = 0;i < selected.length;i++ ){
        if(selected[i].name === name){
          return selected[i];
        }
      }
      return {
            name:'Not Found'
        };
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

.factory('Auth', function ($http, $location, $window, $state) {

  var tokenKey = 'com.appeteyes'

  var login = function (user) {
    return $http({
      method: 'POST',
      url: '/users/signin',
      data: user
    })
    .then(function (resp) {
      if (resp.data.token) {
        $state.transitionTo('tab.dash');
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
      if (resp.data.token) $state.transitionTo('tab.dash');
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
    cuisines: [],
    location: '',
  };

  return {
    //takes an array as a parameter and outputs array to controller
    listCuisines: function(){
      return cuisines;
    },

    //retrieves stored user preferences from server/db
    importPreferences: function(){

      //send GET request to server - use response data to fill userSettings
      var promise = $http.get('/users/preferences')
        .then(function(data){
          console.log('data immediately from GET', data);
          userPreferences.cuisines = data.cuisines;
          userPreferences.location = data.location;
        })
        // .error(function(error){
        //   console.log(error);
        // })

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
      
    }
  };
});
