'use strict';
angular.module('Appeteyes.controllers', [])

.controller('DashCtrl', function($scope,Fooder) {
	$scope.food = Fooder.getRandomPic();
	$scope.changePic = function(input){
		if(input){
			Fooder.addToSelection($scope.food);
		}
		$scope.food = Fooder.getRandomPic();
	};

})

.controller('FriendsCtrl', function($scope, Fooder) {
  $scope.foods = Fooder.getSelected();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
	$scope.user = {};
	$scope.submitForm = function(){
		console.log($scope.user);
	}
});
