'use strict';

// Define the `phoneList` module
//angular.module('buurten', ['app','ngRoute', 'core.data', 'core.user','vr.directives.slider']);

// Register `phoneList` component, along with its associated controller and template
angular.
module('app').
component('logoff', {
    templateUrl: 'app/components/main/logoff.template.html',
    controller: ['$rootScope', '$scope', '$state', '$location', 'Setup',
        function SignoutController($rootScope, $scope, $state, $location, Setup) {
            var self = this;

            $scope.user = $rootScope.setup.user;
            $rootScope.setup.signOut();
        }]
});