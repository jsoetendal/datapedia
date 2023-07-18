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

            this.loadLinks = function(){
                if(!$scope.links && !$scope.loading){
                    $scope.loading = true;
                    Nodes.loadLinks(function (data){
                        $scope.links = data;
                        $scope.loading = false;
                        for(let i in $scope.links){
                            for(let j in $scope.links[i].links) {
                                $scope.links[i].links[j] = {
                                    'url': $scope.links[i].links[j],
                                    'code': 0,
                                    'description': 'wordt gecheckt...'
                                }
                                Nodes.checkLink($scope.links[i].links[j].url, function(data){
                                    $scope.links[i].links[j] = data;
                                });
                            }
                        }
                    });
                }
            }

            $scope.setContentTab = function(tab){
                $scope.tab = tab;
                if(!$scope.tab) $scope.tab = "suggestions";
                if(tab == "linkcheck"){
                    self.loadLinks();
                }
            }

            $scope.loading = false;
            $scope.selected = {"entity": null };
            this.loadContent();
            $scope.setContentTab($stateParams.tab);

        }
    ]
});