'use strict';
angular.
module('app').
component('module', {
    templateUrl: 'app/components/module/module.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Settings', '$location',
        function ModuleController($http, $rootScope, $scope, $state, $stateParams, $window, Settings, $location) {
            var self = this;

            $scope.user = $rootScope.setup.user;
            $scope.settings = $rootScope.settings;
            $scope.state = $rootScope.state;

            $scope.$on('$stateChangeSuccess', function(event, state, params){
                $scope.state = {
                    "name": state.name,
                    "params": params
                }
            });

            $scope.doLogin = function(){
                $rootScope.setup.doLogin($scope);
            }

            $scope.setNavigation = function(nav){
                for(let i in nav){
                    if(nav[i].details && nav[i].details.type && !nav[i].details.customview){
                        nav[i].details.customview = null;
                    } else if(nav[i].details && nav[i].details.type && nav[i].details.customview){
                        nav[i].details.title = nav[i].label;
                    }
                    if(nav[i].sub){
                        $scope.setNavigation(nav[i].sub);
                    }
                }
            }

            $scope.getEntity = function(){
                $scope.node = null;
                $scope.entity = null;
            }

            $scope.$on("SetNodeEntity", function(evt,data) {
                // handler code here });
                $scope.entity = data.entity;
                $scope.node = data.node;
            })

            $scope.$on("SetModuleBackground", function(evt,data) {
                $scope.module.background = "local/background"+ $scope.node.key+".jpg";
            });
            $scope.$on("ResetModuleBackground", function(evt,data) {
                $scope.module.background = "local/background.jpg";
            });

            //

            let modulename = $stateParams.modulename;
            if($rootScope.settings && $rootScope.settings.modules) {
                for (var i in $rootScope.settings.modules) {
                    if ($rootScope.settings.modules[i].name == modulename) {
                        $scope.module = $rootScope.settings.modules[i];
                        $rootScope.module = $rootScope.settings.modules[i];
                    }
                }
            }



            if(!$scope.module){
                $scope.module = {
                    name: 'none',
                    title: '',
                    background: "local/background.jpg",
                    start:{
                        state: "module.main",
                        details: {}
                    }
                }
            } else {
                $scope.setNavigation($scope.module.navigation);
                $scope.getEntity();
            }
        }
    ]
});