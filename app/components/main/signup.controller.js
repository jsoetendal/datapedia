'use strict';

// Define the `phoneList` module
//angular.module('buurten', ['app','ngRoute', 'core.data', 'core.user','vr.directives.slider']);

// Register `phoneList` component, along with its associated controller and template
angular.
module('app').
component('signup', {
    templateUrl: 'app/components/main/signup.template.html',
    controller: ['$rootScope', '$scope', '$location', 'Setup',
        function SignUpController($rootScope, $scope, $location, Setup) {
            var self = this;

            $scope.user = $rootScope.setup.user;
            $scope.doSignup = function(){
                $rootScope.setup.doSignup($scope);
            }
        }]
});