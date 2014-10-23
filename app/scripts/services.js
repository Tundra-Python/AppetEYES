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

.factory('Auth', function ($http, $location, $window, $state) {

  var token;
  var login = function (user) {
    return $http({
      method: 'POST',
      url: '/users/signin',
      data: user
    })
    .then(function (resp) {
      if (resp.data.token) $state.transitionTo('tab.dash');
      return resp.data.token;
    });
  };

  var signup = function (user) {
    return $http({
      method: 'POST',
      url: '/users/signup',
      data: user
    })
    .then(function (resp) {
      //if (resp.data.token) redirect
      return resp.data.token;
    });
  };

//// STILL NEED TO EDIT
  var isAuth = function () {
    console.log(!!token);
    // return !!token;
    return !!$window.localStorage.getItem('com.appeteyes');
  };

  var signout = function () {
    $window.localStorage.removeItem('com.appeteyes');
    // $location.path('/tab.account');
  };

  var setToken = function(givenToken){
    $window.localStorage.setItem('com.appeteyes', givenToken);
  };
  var getToken = function(){
    return !!$window.localStorage.getItem('com.appeteyes');
  };

  return {
    login: login,
    signup: signup,
    isAuth: isAuth,
    signout: signout,
    token:token,
    setToken:setToken,
    getToken:getToken
  };
});

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
    token: 0,
    cuisines: [],
    location: '',
  };

  return {
    //takes an array as a parameter and outputs array to controller
    listCuisines: function(){
      return cuisines;
    },

    //retrieves stored user preferences from server/db
    importPreferences: function($http){

      //send GET request to server - use response data to fill userSettings
      var promise = $http.get('/users/preferences')
        .then(function(data){
          userPreferences.cuisines = data.cuisines;
          userPreferences.location = data.location;
        })

      return userPreferences;
    },

    //takes an object with all preferences saved
    //and updates factory userSettings and sends preferences
    savePreferences: function(newPreferences){
      userPreferences.token = newPreferences.token;
      userPreferences.cuisines = newPreferences.cuisines;
      userPreferences.location = newPreferences.location;
      //send POST request to server with userSettings as data
      var promise = $http.post('/users/preferences', userPreferences);
      prom

      console.log('now I just send a post');
      console.log(userPreferences);
      
    }
  };
});
