'use strict';
angular.
module('app').
component('contentbeheer', {
    templateUrl: 'app/components/admin/content.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Nodes', '$location',
        function UsersController($http, $rootScope, $scope, $state, $stateParams, $window, Nodes, $location) {
            var self = this;
            this.user = $rootScope.setup.user;

            this.loadContent = function() {
                Nodes.loadSuggestions(function(data){
                    $scope.suggestions = data;
                })
                Nodes.loadUpdates(function(data){
                    $scope.updates = data;
                })
                Nodes.loadDeleted(function(data){
                    $scope.deleted = data;
                })
            }


            $scope.setContentTab = function(tab){
                $scope.tab = tab;
                if(!$scope.tab) $scope.tab = "suggestions";
            }

            $scope.selected = {"entity": null };
            this.loadContent();
            $scope.setContentTab($stateParams.tab);

        }
    ]
});