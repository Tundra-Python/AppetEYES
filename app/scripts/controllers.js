'use strict';
angular.module('Appeteyes.controllers', [])

.controller('AppeteyesCtrl', function($scope, Fooder, Yelper, Preferences, $http) {
  
  Preferences.importPreferences(function(newPreferences){
    $scope.cuisines = newPreferences.cuisines;
    $scope.location = newPreferences.location;
    $scope.getPics($scope.cuisines[0], $scope.location, $scope.offset);
  });

  //Local Cache with Response from the Yelp API
  $scope.pics = Fooder.currentPics()||[];
  //Used to Store the current picture
  $scope.food = $scope.pics[0]||''; 
  //Gets information about the current session. If the user already has loaded pictures, it prevents the App from making another Yelp Request
  $scope.isNotLoaded = Fooder.isNotLoaded;
  $scope.like = 'Start Swipin';
  //Offset ensures we don't keep repeating the same pictures or run out of pictures to show
  $scope.offset = 0;

  $scope.sliding = function(direction){
    if(direction === 'left'){
      $scope.mood = '"button-assertive"';
      $scope.hateIt = true;
      $scope.like ='Hate it'; 
    }else if(direction === 'right'){
      $scope.mood = '"button-balanced"';
      $scope.loveIt = true;
      $scope.like ='Love it'; 
    }else{
      $scope.mood = '"button-positive"';
      //Resetting Button Classes
      $scope.loveIt = false;
      $scope.hateIt = false;
      $scope.like = 'Start Swipin';
    }
  } ;

  $scope.firstPic = function(){
    if ($scope.pics.length < 6) {
      $scope.isNotLoaded = true;
      $scope.getPics($scope.cuisines[0], $scope.location, $scope.offset);
    }
    return $scope.pics.shift();
  };

  //Models for Dinamic Classes used on the top-button
  $scope.loveIt = false;
  $scope.hateIt = false;
  //Used to handle the Like and Hate Button
  $scope.changePic = function(input){
    if(input){
      Fooder.addToSelection($scope.food);
      $scope.food = $scope.firstPic();
    }else{
      Fooder.addToDisliked($scope.food);
      $scope.food = $scope.firstPic();
    }
  };

  //Sets up Dinamic Class for the Header  
  $scope.mood = '"button-positive"';

  //Wrapper for the Yelp Interaction
  $scope.getPics = function(category, location, offset){

    if($scope.isNotLoaded){
      var promise = Yelper.search(category, location, offset);
      promise.then(function(data){
        console.log(data);
        $scope.pics = $scope.pics.concat(data.data);
        $scope.changePic();
        Fooder.addPics($scope.pics);
        Fooder.isNotLoaded = false;
        $scope.offset += 20;
        $http({
          method: 'POST',
          url: '/restaurant/info',
          data: data
        })
        .then(function(res){
          console.log(res.status);
        })
        .catch(function(error){
          console.log('$scope.getPics error', error);
        });
      },function(error){
        console.log(error);
      });
    }

  };

  $scope.$on('$locationChangeStart', function(){

    $http({
      method: 'POST',
      url: '/users/likes',
      data: {
        liked: Fooder.getSelected(),
        disliked: Fooder.getDisliked()
      }
    })
    .then(function(res){
      console.log('change user liked pics', res);
    })
    .catch(function(error){
      console.log('error in changing user liked pics', error);
    })
    
  });

})

.controller('MyFoodiesCtrl', function($scope, Fooder, $http) {
  $scope.foods = Fooder.getSelected();
  $http({
    method: 'GET',
    url: '/users/likes'
  })
  .then(function(data){
    console.log('data from get request on users/liked', data);
    Fooder.setLiked(data.data);
  });
})

.controller('FoodDetailCtrl', function($scope, $stateParams, Fooder) {
  $scope.food = Fooder.searchFood($stateParams.name);
  console.log($scope.food);
})

.controller('AccountCtrl', function($scope, Auth, Fooder) {
  //$scope.user.username and $scope.user.password are being used as ng-models on the template URL tab-account
  $scope.user = {};
  console.log('Form');

  $scope.submitForm = function(){
    Auth.login($scope.user);
  };

  $scope.signUp = function(){
    Auth.signup($scope.user);
  };

  $scope.signOut = function(){
    Auth.signout();
  };

})

.controller('PreferencesCtrl', function($scope, Preferences, Auth, Fooder) {

  //an object that holds the state of what is currently selected
  $scope.selectedOption = {
    'Location': {},
    'Cuisines': {}
  };

  $scope.importUserPreferences = function(){
    //uncommenting when importing from factory/server works
    //get token from local storage
    $scope.userPreferences = Preferences.importPreferences();
    console.log('user prefs pulled from db on load', $scope.userPreferences);

    //remove once importing from factory/server works
    // $scope.userPreferences = {
    //   cuisines: ['Thai', 'American', 'Japanese'],
    //   location: 'San Francisco',
    // };

    //pre-select options from imported preferences
    //set the imported cuisines
    for (var i=0; i<$scope.userPreferences.cuisines.length; i++){
     $scope.selectedOption.Cuisines[$scope.userPreferences.cuisines[i]] = $scope.userPreferences.cuisines[i];
    }
    
    //set the imported location
    if($scope.userPreferences.location === 'GPS'){
      $scope.selectedOption.Location['Use GPS'] = 'Use GPS';
      $scope.locationInput = '';
    } else {
      $scope.selectedOption.Location['Enter City'] = 'Enter City';
      $scope.locationInput = $scope.userPreferences.location;
    }
  };

  $scope.importUserPreferences();

  //an array of objects that populates the preferences tab
  $scope.preferencesList = [
    { name: 'Location',
      options: ['Use GPS', 'Enter City']
    },
    { name: 'Cuisines',
      options: Preferences.listCuisines()
    }
  ];

  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggle = function(preference) {
    if ($scope.isExpanded(preference)) {
      $scope.expandedOption = null;
    } else {
      $scope.expandedOption = preference;
    }
  };

  //run when a user preference is clicked upon
  //sets a specific preference as 'selected' or 'not selected' as necessary
  $scope.select = function(preference, option){
    if (preference.name === 'Cuisines'){
      if ($scope.isSelected(preference, option)){
        delete $scope.selectedOption[preference.name][option];
      } else {
        $scope.selectedOption[preference.name][option] = option;
      }
    }
    else if (preference.name === 'Location'){
      if (option === 'Use GPS'){
        //$scope.getGpsLocation();
        delete $scope.selectedOption[preference.name]['Enter City'];
        $scope.selectedOption[preference.name][option] = option;
        $scope.addCity('GPS');
      } else {
        delete $scope.selectedOption[preference.name]['Use GPS'];
        $scope.selectedOption[preference.name][option] = option;
      }
    }
  };

  //returns boolean based on if preference set is currently expanded
  $scope.isExpanded = function(preference) {
    return $scope.expandedOption === preference;
  };

  //returns boolean based on if a preference's option is currently selected
  $scope.isSelected = function(preference, option) {
    return $scope.selectedOption[preference.name][option] === option;
  };

  //returns boolean if the option in the ng-list is city so form/input can be shown
  $scope.isCity = function(preference, option){
    return (option === 'Enter City' && $scope.isSelected(preference, option));
  };

  $scope.addCity = function(locationInput){
    $scope.userPreferences.location = locationInput;
    console.log('changed');
  };
  
  // //when "save settings" button is clicked update new settings and send to factory
  // //which will in turn send to server
  $scope.saveTheSettings = function(){
    //populate userPreferences object with selected cuisine options
    Fooder.isNotLoaded = true;
    $scope.userPreferences.cuisines = [];
    for (var key in $scope.selectedOption.Cuisines){
      $scope.userPreferences.cuisines.push(key);
    }
    Fooder.resetPics();
    //use factory to send the updated user preferences to the server
    Preferences.savePreferences($scope.userPreferences);
  };
});
