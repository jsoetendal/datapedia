'use strict';
angular.
  module('app').
  component('start', {
    templateUrl: 'app/components/main/start.template.html',
    controller: ['$http', '$rootScope', '$scope', '$timeout', '$state', '$stateParams', '$window', 'Nodes', '$location',
      function StartController($http, $rootScope, $scope, $timeout, $state, $stateParams, $window, Nodes, $location) {
        var self = this;
        $scope.user = $rootScope.setup.user;


        this.start = function() {
          $timeout(function(){
            $rootScope.currentModule = null;
            $scope.settings = $rootScope.settings;
            if(!$scope.settings){
              //Wait for it to be loaded
              $timeout(function(){
                self.start();
              }, 500);
            } else {
              //Module naam goed zetten in start-url
              let count = 0;
              let redirectState = null;
              let redirectDetails = null;
              for (let i in $scope.settings.modules) {
                if ($scope.settings.modules[i].start && $scope.settings.modules[i].start.details) {
                  if (Array.isArray($scope.settings.modules[i].start.details)) $scope.settings.modules[i].start.details = {};
                  $scope.settings.modules[i].start.details.modulename = $scope.settings.modules[i].name;
                  if (!$scope.settings.modules[i].deactivated) {
                    count += 1;
                    redirectState = $scope.settings.modules[i].start.state;
                    redirectDetails = $scope.settings.modules[i].start.details;
                  }
                }
              }
              if (count == 1) { //Redirect if there is only one active module
                $state.go(redirectState, redirectDetails);
              }
            }
          });
        }

        $scope.doLogin = function(){
          $rootScope.setup.doLogin($scope);
        }


        this.start();
      }
    ]
  });