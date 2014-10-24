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
			$scope.getPics('food','san-francisco', $scope.offset);
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
			$scope.food = $scope.firstPic();
		}
	};
	//Sets up Dinamic Class for the Header  
	$scope.mood = '"button-positive"';
	//Wrapper for the Yelp Interaction
	$scope.getPics = function(category,location, offset){
		if($scope.isNotLoaded){
			var promise = Yelper.search(category, location, offset);
			promise.then(function(data){
				console.log(data);
				$scope.pics = $scope.pics.concat(data.data);
				$scope.changePic();
				Fooder.addPics($scope.pics);
				Fooder.isNotLoaded = false;
				$scope.offset += 20;
			},function(error){
				console.log(error);
			});
		}
	};

	//Sets up default Settings for Category:Food / Location:San Francisco
	$scope.getPics('food','san-francisco', $scope.offset);
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
		Auth.login($scope.user);
	};

	$scope.signUp = function(){
		Auth.signup($scope.user);
	};

	$scope.signOut = function(){
		Auth.signout();
	};

})

.controller('PreferencesCtrl', function($scope, Preferences, Auth) {

  //an object that holds the state of what is currently selected
  $scope.selectedOption = {
    'Location': {},
    'Cuisines': {}
  };

  $scope.importUserPreferences = function(token){
    //uncommenting when importing from factory/server works

    //get token from local storage
    var localToken = Auth.getToken();
    $scope.userPreferences = Preferences.importPreferences(localToken);
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
});
