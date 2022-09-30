'use strict';
angular.
  module('app').
  config(['$stateProvider','$urlRouterProvider','$sceDelegateProvider', "$locationProvider", function($stateProvider, $urlRouterProvider, $sceDelegateProvider, $locationProvider) {

    $locationProvider.html5Mode(true); //prevent using #

    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from outer templates domain.
        'https://*.proloco.nl/**',
        'https://*.copaan.nl/**',
        'https://media.nvm.nl/**',
        'https://indd.adobe.com/**',
      ]); 

      //
      // For any unmatched url, redirect to /state1
      $urlRouterProvider.otherwise("/");
      //
      // Now set up the states
      $stateProvider
          .state('start', {
              url: "/",
              template: "<start class='controllermodule'></start>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('admin', {
              url: "/admin",
              template: "<admin class='controllermodule'></admin>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('admin.users', {
              url: "/users",
              template: "<users class='controllermodule'></users>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('admin.content', {
              url: "/content",
              template: "<contentbeheer class='controllermodule'></contentbeheer>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('admin.content.tab', {
              url:"/tab/{tab}",
              controller: ['$scope','$stateParams', function($scope, $stateParams){
                  $scope.setContentTab($stateParams.tab)
              }]
          })
          .state('admin.settings', {
              url: "/settings",
              template: "<settings class='controllermodule'></settings>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('admin.settings.tab', {
              url:"/tab/{tab}",
              controller: ['$scope','$stateParams', function($scope, $stateParams){
                  $scope.setAdminTab($stateParams.tab)
              }]
          })
          .state('admin.node', {
              url: '/node/{title}/{nodeId}',
              template: "<node class='controllermodule'></node>"
          })
          .state('admin.node.tab', {
              url:"/tab/{tab}",
              controller: ['$scope','$stateParams', function($scope, $stateParams){
                  $scope.setTab($stateParams.tab)
              }]
          })
          .state('module.main', {
              url: "/intro",
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
          .state('module.nodes', {
              url: "/nodes/{type}",
              template: "<nodes class='controllermodule'></nodes>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('module.nodes.tab', {
              url:"/tab/{tab}",
              controller: ['$scope','$stateParams', function($scope, $stateParams){
              }]
          })
          .state('module.add', {
              url: '/add/{table}/{nodeId}',
              template: "<node class='controllermodule'></node>"
          })
          .state('module.node', {
              url: '/node/{title}/{nodeId}',
              template: "<node class='controllermodule'></node>"
          })
          .state('module.node.tab', {
            url:"/tab/{tab}",
            controller: ['$scope','$stateParams', function($scope, $stateParams){
                $scope.setTab($stateParams.tab)
            }]
        })
          .state('module.node.new', {
              url:"/new/{type}",
              controller: ['$scope','$stateParams', function($scope, $stateParams){
              }]
          })
          .state('module.node.newrelated', {
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
          .state('module.import', {
              url: "/import/{type}",
              template: "<import class='controllermodule'></import>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('module.dataoverheid', {
              url: "/dataoverheid",
              template: "<dataoverheid class='controllermodule'></dataoverheid>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('module.datatop15', {
              url: "/datatop15",
              template: "<datatop15 class='controllermodule'></datatop15>",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('module.nodes.query', {
              url: "/{q}",
              template: "",
              controller: ['$scope', function($scope) {
              }]
          })
          .state('module', { //Let op! Achteraan, omdat 'ie anders de andere afvangt...
              url: "/{modulename}",
              template: "<module></module>",
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