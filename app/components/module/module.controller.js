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
            $scope.backgroundImgUrl = "https://smartmobilitymra.nl/wp-content/uploads/2019/07/Fietsfiles_Amsterdam_Centrum_3758.jpg";
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

            let modulename = $stateParams.modulename;
            for(var i in $rootScope.settings.modules){
                if($rootScope.settings.modules[i].name == modulename){
                    $scope.module = $rootScope.settings.modules[i];
                    $rootScope.module = $rootScope.settings.modules[i];
                }
            }

            if(!$scope.module){
                $scope.module = {
                    name: 'none',
                    title: '',
                    background: "https://smartmobilitymra.nl/wp-content/uploads/2019/07/Fietsfiles_Amsterdam_Centrum_3758.jpg",
                    start:{
                        state: "module.main",
                        details: {}
                    }
                }
            }
        }
    ]
});