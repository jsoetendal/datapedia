'use strict';

// Define the `phoneList` module
//angular.module('buurten', ['app','ngRoute', 'core.data', 'core.user','vr.directives.slider']);

// Register `phoneList` component, along with its associated controller and template
angular.
module('app').
component('login', {
    templateUrl: 'app/components/main/login.template.html',
    controller: ['$rootScope', '$scope', '$location', 'Setup',
        function LoginController($rootScope, $scope, $location, Setup) {
            var self = this;

            $scope.user = $rootScope.setup.user;
            $scope.doLogin = function(){
                $rootScope.setup.doLogin($scope);
            }
        }]
});