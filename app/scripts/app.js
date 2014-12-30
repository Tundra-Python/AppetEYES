'use strict';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('Appeteyes', ['ionic', 'config', 'Appeteyes.controllers', 'Appeteyes.services'])

.run(function($ionicPlatform, $rootScope, $state, Auth) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });

  $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
    if (toState.authenticate && !Auth.isAuth()){
      // User isn’t authenticated
      $state.transitionTo('tab.account');
      event.preventDefault(); 
    }
  });

})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html',
    })

    // Each tab has its own nav history stack:

    .state('tab.appeteyes', {
      url: '/appeteyes',
      views: {
        'tab-appeteyes': {
          templateUrl: 'templates/tab-appeteyes.html',
          controller: 'AppeteyesCtrl'
        }
      },
      authenticate:true
      // // resolve:{
      // //   Yelper:'Yelper',
      // //   Pics:function(Yelper){
      // //     console.log('YEAHHHHHHHHHHH');
      // //     return Yelper.search().$promise;
      // //   }
      // },
      // controller:'DashCtrl'
    })

    .state('tab.myFoodies', {
      url: '/myFoodies',
      views: {
        'tab-myFoodies': {
          templateUrl: 'templates/tab-myFoodies.html',
          controller: 'MyFoodiesCtrl'
        }
      },
      authenticate:true
    })

    .state('tab.foodDetail', {
      url: '/myFoodies/{name}',
      views: {
        'tab-myFoodies': {
          templateUrl: 'templates/foodDetail.html',
          controller: 'FoodDetailCtrl'
        }
      }
    })

    .state('tab.account', {
      url: '/account',
      views: {
        'tab-account': {
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl'
        }
      }
    })
    
    .state('tab.preferences', {
      url: '/preferences',
      views: {
        'tab-preferences': {
          templateUrl: 'templates/tab-preferences.html',
          controller: 'PreferencesCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/appeteyes');

  //We add $httpInterceptor into the array
  $httpProvider.interceptors.push('AttachTokens');
})

//taken from shortly-angular - this factory attaches the token in the header of all outgoing requests
.factory('AttachTokens', function ($window) {
  // this is an $httpInterceptor
  // its job is to stop all out going request
  // then look in local storage and find the user's token
  // then add it to the header so the server can validate the request
  var attach = {
    request: function (object) {
      var jwt = $window.localStorage.getItem('com.appeteyes');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
});

// .run(function ($rootScope, $location, Auth) {
//   // here inside the run phase of angular, our services and controllers
//   // have just been registered and our app is ready
//   // however, we want to make sure the user is authorized
//   // we listen for when angular is trying to change routes
//   // when it does change routes, we then look for the token in localstorage
//   // and send that token to the server to see if it is a real user or hasn't expired
//   // if it's not valid, we then redirect back to signin/signup
//   $rootScope.$on('$routeChangeStart', function (evt, next, current) {
//     if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
//       $location.path('/account');
//     }
//   });

// });
