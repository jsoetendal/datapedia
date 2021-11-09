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

            //Module naam goed zetten in start-url
            for(let i in $scope.settings.modules){
              if($scope.settings.modules[i].start && $scope.settings.modules[i].start.details){
                if(Array.isArray($scope.settings.modules[i].start.details)) $scope.settings.modules[i].start.details = {};
                $scope.settings.modules[i].start.details.modulename = $scope.settings.modules[i].name;
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