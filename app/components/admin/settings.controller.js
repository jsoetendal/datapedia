'use strict';
angular.
module('app').
component('settings', {
    templateUrl: 'app/components/admin/settings.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Settings', '$location',
        function UsersController($http, $rootScope, $scope, $state, $stateParams, $window, Settings, $location) {
            var self = this;
            this.user = $rootScope.setup.user;

            this.loadSettings = function() {
                Settings.loadSettings(function(data){
                    $scope.settings = data;

                    Settings.getEntityCount(function(counts){
                        $scope.count = [];
                        for(var i in counts){
                            $scope.count[counts[i].type] = counts[i].count;
                        }
                    })
                });
            }

            $scope.saveSettings = function(){
                Settings.saveSettings($scope.settings);
            }

            $scope.addEntity = function(){
                var newEntity =
                        {
                        "type": "",
                        "single": "Nieuwe entiteit",
                        "plural": "Nieuwe entiteiten",
                        "image": false,
                        "path": false,
                        "background": "",
                        "views": [
                            "list"
                        ],
                        "facet": {
                            "optional": true,
                            "default": true
                        },
                        "data": [],
                        "relations": [],
                        "dependencies": []
                    };
                $scope.settings.content.entities.push(newEntity);
            }

            $scope.deleteEntity = function(type){
                var newArray = [];
                for(var i in $scope.settings.content.entities){
                    if($scope.settings.content.entities[i].type != type){
                        newArray.push($scope.settings.content.entities[i]);
                    }
                }
                $scope.settings.content.entities = newArray;
            }

            this.loadSettings();
        }
    ]
});