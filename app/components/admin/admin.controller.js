'use strict';
angular.
module('app').
component('admin', {
    templateUrl: 'app/components/admin/admin.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Settings', '$location',
        function ModuleController($http, $rootScope, $scope, $state, $stateParams, $window, Settings, $location) {
            var self = this;

            $scope.user = $rootScope.setup.user;
            $scope.settings = $rootScope.settings;
        }
    ]
});