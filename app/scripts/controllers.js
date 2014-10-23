'use strict';
angular.module('Appeteyes.controllers', [])

.controller('DashCtrl',function($scope,Fooder,Yelper) {
  //Local Cache with Response from the Yelp API
  $scope.pics = Fooder.currentPics()||[];
  //Used to Store the current picture
  $scope.food =$scope.pics[0]||''; 
  //Gets information about the current session. If the user already has loaded pictures, it prevents the App from making another Yelp Request
  $scope.isNotLoaded = Fooder.isNotLoaded;
  $scope.like = 'Start Swipin';
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
      $scope.food = $scope.firstPic();
    }
  };
  //Sets up Dinamic Class for the Header  
  $scope.mood = '"button-positive"';
  //Wrapper for the Yelp Interaction
  $scope.getPics = function(category,location){
    if($scope.isNotLoaded){
      var promise = Yelper.search(category,location);
      promise.then(function(data){
        console.log(data);
        $scope.pics = data.data;
        $scope.changePic();
        Fooder.addPics($scope.pics);
        Fooder.isNotLoaded = false;
      },function(error){
        console.log(error);
      });
    }
  };

  //Sets up default Settings for Category:Food / Location:San Francisco
  $scope.getPics('food','san-francisco');
  console.log($scope.pics);
})

.controller('FriendsCtrl', function($scope, Fooder) {
  $scope.foods = Fooder.getSelected();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Fooder) {
  $scope.food = Fooder.searchFood($stateParams.name);
  console.log($scope.food);
})

.controller('AccountCtrl', function($scope, Auth) {
	//$scope.user.username and $scope.user.password are being used as ng-models on the template URL tab-account
	$scope.user = {};
	console.log('Form');
	$scope.submitForm = function(){
		//$scope.token = 
		var promise = Auth.login($scope.user);
		promise.then(function(data){
				if(data){
				console.log('User Logged In');
				Auth.setToken(data);
				console.log('This is your token',Auth.getToken(data));
			}else{
				console.log('It doesnt work',Auth.token);
			}
		});
		//if ($scope.token) redirect THIS MIGHT BELONG IN THE FACTORY SINCE WE'RE NOT PASSING IN RES,REQ
	};
	$scope.signUp = function(){
		//$scope.token =
		Auth.signup($scope.user);
		if(Auth.token !== undefined ){
			console.log('User Logged In');
		}else{
			console.log('It doesnt work');
		}
		//if ($scope.token) redirect THIS MIGHT BELONG IN THE FACTORY SINCE WE'RE NOT PASSING IN RES,REQ
	};
	$scope.signOut = function(){
		Auth.signout();
	};

.controller('PreferencesCtrl', function($scope, Preferences) {

  //an object that holds the state of what is currently selected
  $scope.selectedOption = {
    'Location': {},
    'Cuisines': {}
  };

  $scope.importUserPreferences = function(token){
    //uncommenting when importing from factory/server works
    //$scope.userPreferences = Preferences.importPreferences('abc');

    //remove once importing from factory/server works
    $scope.userPreferences = {
      token: 56,
      cuisines: ['Thai', 'American', 'Japanese'],
      location: 'San Francisco',
    };

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
  $scope.importUserPreferences('abc');

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
    $scope.userPreferences.cuisines = [];
    for (var key in $scope.selectedOption.Cuisines){
      $scope.userPreferences.cuisines.push(key);
    }
    //use factory to send the updated user preferences to the server
		Preferences.savePreferences($scope.userPreferences);
	};
});
