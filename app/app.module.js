'use strict';
angular.
  module('app').
  config(['$stateProvider','$urlRouterProvider','$sceDelegateProvider', function($stateProvider, $urlRouterProvider, $sceDelegateProvider) {

      $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from outer templates domain.
        'https://*.proloco.nl/**',
        'https://*.copaan.nl/**',
        'https://media.nvm.nl/**'
      ]); 

      //
      // For any unmatched url, redirect to /state1
      $urlRouterProvider.otherwise("/");
      //
      // Now set up the states
      $stateProvider
          .state('main', {
              url: "/",
              template: "<main class='controllermodule'></main>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('login', {
              url: "/login",
              template: "<login class='controllermodule'></login>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('signup', {
              url: "/signup",
              template: "<signup class='controllermodule'></signup>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('logoff', {
              url: "/logoff",
              template: "<logoff class='controllermodule'></logoff>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('passwordforgot', {
              url: "/passwordforgot",
              template: "<passwordforgot class='controllermodule'></passwordforgot>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('passwordreset', {
              url: "/passwordreset/{newPassword}/{tokenStr}",
              template: "<passwordreset class='controllermodule'></passwordreset>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('nodes', {
              url: "/nodes/{type}",
              template: "<nodes class='controllermodule'></nodes>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('nodes.tab', {
              url:"/tab/{tab}",
              controller: ['$scope','$stateParams', function($scope, $stateParams){
              }]
          })
          .state('add', {
              url: '/add/{table}/{nodeId}',
              template: "<node class='controllermodule'></node>"
          })
          .state('node', {
              url: '/node/{nodeId}', // /{title} toevoegen voor SEO? Let op: dan vervallen alle gedeelde lnks voor intake gemeentes evt. via specifieke .htaccess redirect opvangen!
              template: "<node class='controllermodule'></node>"
          })
          .state('node.tab', {
            url:"/tab/{tab}",
            controller: ['$scope','$stateParams', function($scope, $stateParams){
                $scope.setTab($stateParams.tab)
            }]
        })
          .state('node.new', {
              url:"/new/{type}",
              controller: ['$scope','$stateParams', function($scope, $stateParams){
              }]
          })
          .state('node.newrelated', {
              url:"/newrelated/{relation}/{type}",
              controller: ['$scope','$stateParams', function($scope, $stateParams){
              }]
          })
          /*
          .state('relation', {
              url: "/relation/{key}",
              template: "<nodes class='controllermodule'></nodes>",
              controller: ['$scope', function($scope) {
              }]
          })
          */
          .state('import', {
              url: "/import/{type}",
              template: "<import class='controllermodule'></import>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('dataoverheid', {
              url: "/dataoverheid",
              template: "<dataoverheid class='controllermodule'></dataoverheid>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('datatop15', {
              url: "/datatop15",
              template: "<datatop15 class='controllermodule'></datatop15>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('nodes.query', {
              url: "/{q}",
              template: "",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('users', {
              url: "/users",
              template: "<users class='controllermodule'></users>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('content', {
              url: "/admin/content",
              template: "<contentbeheer class='controllermodule'></contentbeheer>",
              controller: ['$scope', function($scope) {
              }]
          })
}]);
  //Zoeken naar: ui-router! Docs: https://github.com/angular-ui/ui-router/wiki
  
angular.
  module('app').
  run(['$rootScope','$location','$window','$state',
    function run($rootScope, $location, $window,$state) {
        // initialise google analytics
        if(window.trackingcode){
            $window.ga('create', window.trackingcode, 'auto');
     
            // track pageview on state change
            $rootScope.$on('$stateChangeSuccess', function (event) {
                $window.ga('send', 'pageview', $location.path());
            });
        }
    }]
  );