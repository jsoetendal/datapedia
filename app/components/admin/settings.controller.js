'use strict';
angular.
module('app').
component('settings', {
    templateUrl: 'app/components/admin/settings.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Settings', '$location',
        function SettingsController($http, $rootScope, $scope, $state, $stateParams, $window, Settings, $location) {
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

                $scope.states = $state.get();
            }

            $scope.saveSettings = function(){
                Settings.saveSettings($scope.settings);
            }

            $scope.selectNav = function(module, nav){
                $scope.selected.module = module;
                $scope.selected.nav = nav;
                $scope.selectedType = null;
                if(nav && nav.details && nav.details.type) $scope.selectedType = nav.details.type;
                if(nav != null) $scope.selectEntity(null); //Die leegmaken
            }

            $scope.setNavDetailsType = function(nav, type){
                nav.details = {'type': type};
                console.log(nav.details);
            }

            $scope.selectEntity = function(entity){
                $scope.selected.entity = entity;
                if(entity != null) $scope.selectNav(null); //Die leegmaken

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
                        "maximagesize": 1024,
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

            $scope.addData = function(arr, relation){
                //$scope.selected.entity.data.push(
                let newitem = {
                    "key": "",
                    "type": "text",
                    "label": "Nieuw",
                    "descriptionInput": "",
                    "required": false,
                    "facet": false
                }

                if(!arr){
                    relation.data = [newitem];
                } else {
                    arr.push(newitem);
                }
            }

            $scope.makeKey = function(item){
                if(!item.key || item.key == "") {
                    item.key = item.label;
                    item.key = item.key.replace(/[\W_]+/g, "_");
                }
            }

            $scope.deleteData = function (arr, index){
                //$scope.selected.entity.data.splice(index, 1);
                arr.splice(index,1);
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

            $scope.addModule = function(){
                $scope.settings.modules.push({
                    "name": "Nieuwe module",
                    "navigation": []
                })
            }

            $scope.addNav = function(module){
                $scope.selected.module.navigation.push(        {
                    "label": "Nieuwe link",
                    "url": "",
                    "roles": [
                        "unauthenticated",
                        "contributor",
                        "editor",
                        "admin"
                    ]
                })
            }

            $scope.deleteNav = function(module, nav){
                $scope.selected.module.navigation.splice( $scope.selected.module.navigation.indexOf(nav),1);
                $scope.selectNav(null);
            }

            $scope.addSubNav = function(nav){
                if(!nav.sub) nav.sub = [];
                nav.sub.push({
                        "label": "Nieuwe sublink",
                        "url": ""
                    }
                )
            }

            $scope.deleteSubNav = function(nav, sub){
                nav.sub.splice(nav.sub.indexOf(sub), 1);
            }

            $scope.arrUp = function(arr, element){
                let pos = arr.indexOf(element);
                if(pos + 1 < arr.length){
                    arr.splice(pos+1, 0, arr.splice(pos, 1)[0]);
                }
            }

            $scope.arrDown = function(arr, element){
                let pos = arr.indexOf(element);
                if(pos > 0){
                    arr.splice(pos-1, 0, arr.splice(pos, 1)[0]);
                }
            }

            $scope.addTemplates = function(item){
                if(!item.templates) item.templates = {'input': '', view:''}
            }

            $scope.deleteTemplates = function(item){
                delete item.templates;
            }

            $scope.addDataview = function(entity){
                if(!entity.dataview) entity.dataview = "...";
            }

            $scope.deleteDataview = function(entity){
                delete entity.dataview;
            }

            $scope.addToprightview = function(entity){
                if(!entity.toprightview) entity.toprightview = "...";
            }

            $scope.deleteToprightview = function(entity){
                delete entity.toprightview;
            }

            $scope.deleteField = function(obj, field){
                delete obj[field];
            }

            $scope.setAdminTab = function(tab){
                $scope.tab = tab;
                if(!$scope.tab) $scope.tab = "entities";
            }

            $scope.selected = {"entity": null };
            this.loadSettings();
            $scope.setAdminTab($stateParams.tab);
        }
    ]
});