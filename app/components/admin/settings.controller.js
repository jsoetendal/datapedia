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

            $scope.selectEntity = function(entity){
                $scope.selected.entity = entity;

                //Bereken mogelijke dependencies voor deze entity = relatie van een ander type naar dit type, die nog niet in de dependencies is opgenomen
                if(entity){
                    $scope.selected.potentialDependencies = [];
                    for(let e in $scope.settings.content.entities){
                        if($scope.settings.content.entities[e].type != entity.type){
                            for(let r in $scope.settings.content.entities[e].relations){
                                if($scope.settings.content.entities[e].relations[r].type == entity.type){
                                    //This is a potential dependency. Just check if it does not exist
                                    let dependencyExists = false;
                                    for(let d in $scope.selected.entity.dependencies){
                                        if($scope.selected.entity.dependencies[d].key == $scope.settings.content.entities[e].relations[r].key){
                                            dependencyExists = true;
                                        }
                                    }
                                    if(!dependencyExists){
                                        let potentialDependency = angular.copy($scope.settings.content.entities[e].relations[r]);
                                        potentialDependency.type = $scope.settings.content.entities[e].type;
                                        $scope.selected.potentialDependencies.push(potentialDependency);
                                    }
                                }
                            }
                        }
                    }
                }
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

            $scope.addData = function(){
                $scope.selected.entity.data.push(
                    {
                        "key": "",
                        "type": "text",
                        "label": "Nieuw",
                        "descriptionInput": "",
                        "required": false,
                        "facet": false
                    }
                );
            }

            $scope.makeKey = function(item){
                if(!item.key || item.key == "") {
                    item.key = item.label;
                    item.key = item.key.replace(/[\W_]+/g, "_");
                }
            }

            $scope.deleteData = function (index){
                $scope.selected.entity.data.splice(index, 1);
            }

            $scope.deleteOption = function(item, index){
                item.options.splice(index, 1);
            }

            $scope.addOption = function(item, value){
                if(!item.options) item.options = [];
                item.options.push(value);
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

            $scope.addRelatie = function(type){
                if(!$scope.selected.entity.relations) $scope.selected.entity.relations = [];
                $scope.selected.entity.relations.push({
                    "key": $scope.selected.entity.type + "_" + type,
                    "type": type + "",
                    "label": type + "",
                    "description": "",
                    "descriptionInput": "",
                    "facet": true,
                    "view": "simple",
                    "min": 0,
                    "max": 999,
                    "cols":12
                });
            }

            $scope.deleteRelatie = function(index){
                $scope.selected.entity.relations.splice(index, 1);
            }

            $scope.addDependency = function(potentialDependency){
                if(!$scope.selected.entity.dependencies) $scope.selected.entity.dependencies = [];
                $scope.selected.entity.dependencies.push(potentialDependency);
                $scope.selectEntity($scope.selected.entity); //reselect to update potential dependencies
            }

            $scope.deleteDependency = function(index){
                $scope.selected.entity.dependencies.splice(index, 1);
                $scope.selectEntity($scope.selected.entity); //reselect to update potential dependencies
            }

            $scope.selected = {"entity": null };
            this.loadSettings();
        }
    ]
});