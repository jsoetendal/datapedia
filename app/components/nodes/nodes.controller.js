'use strict';
angular.
  module('app').
  component('nodes', {
    templateUrl: 'app/components/nodes/nodes.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Nodes', '$location', '$anchorScroll', '$timeout',
      function NodesController($http, $rootScope, $scope, $state, $stateParams, $window, Nodes, $location, $anchorScroll, $timeout) {

        var self = this;
        $scope.zoeken = {};
        this.facetsCreated = false;

          this.loadNodes = function(type) {
              $scope.nodes = [];
              $scope.loaded = false;
              $scope.multipleTypes = false;

              for (var i in $rootScope.settings.content.entities) {
                  if ($rootScope.settings.content.entities[i].type == type) {
                      $scope.entity = $rootScope.settings.content.entities[i];
                      if($scope.entity.background) {
                          $rootScope.backgroundImgUrl = $scope.entity.background;
                      }
                  }
              }

              if($scope.entity.views[0] == "set" || $scope.entity.getNodesExtended){
                var extended = true;
              } else {
                var extended = false;
              }
              Nodes.loadNodes(type, extended, function () {
                  self.setNodes();
                  if ($scope.entity.facet.default) {
                      $scope.setFacet($scope.entity.facet.default);
                  } else {
                      $scope.setFacet(false);
                  }
              });

          }

          this.loadRelation = function(key) {
              $scope.nodes = [];
              $scope.loaded = false;
              $scope.multipleTypes = false;


              Nodes.loadRelation(key, function () {
                  var type = Nodes.getType();

                  for (var i in $rootScope.settings.viewable_relations) {
                      if ($rootScope.settings.viewable_relations[i].key == key) {
                          $scope.entity = $rootScope.settings.viewable_relations[i];
                          if($scope.entity.background) {
                              $rootScope.backgroundImgUrl = $scope.entity.background;
                          }
                      }
                  }

                  self.setNodes();

                  if($scope.entity.facet.default){
                      $scope.setFacet($scope.entity.facet.default);
                  } else {
                      $scope.setFacet(false);
                  }
              });
          }

          this.doSearch = function(searchText){
            $scope.nodes = [];
            $scope.loaded = false;
            $scope.multipleTypes = true;

            $scope.entity =
                {
                    "type": "zoeken",
                    "single": "resultaat",
                    "plural": "resultaten",
                    "image": "photo",
                    "path": {
                        "label": "Categorie",
                        "multilevel": false,
                        "multiple": true
                    },
                    "views": ["list"],
                    "facet": true
                };

            Nodes.searchNodes(searchText, function(){
                self.setNodes();
                self.facetsCreated = false; //Reset Facets, nieuwe nodes...
                $scope.setView("list");
                $scope.setFacet(true);
            });
        }

        this.setNodes = function(){
            $scope.nodes = Nodes.getNodes();
            $scope.loaded = true;
            //console.log($scope.nodes);

            Nodes.createTree(function(tree){
                $scope.tree = tree;
            });
            $scope.nodesLoaded = true;

            $scope.setView($scope.entity.views[0]);
            if (!$scope.view) $scope.setView('tile');
        }

        this.createFacets = function(){
            $scope.facets = [];

            //Type toevoegen als facet, indien meer dan 1:
            if($scope.multipleTypes){
                var facet = {'key': 'type', 'label': "Type", 'options': [], 'show': 5};
                for(var i in $scope.nodes) {
                    if($scope.nodes[i].visible) {
                        for (var j in $rootScope.settings.content.entities) {
                            if ($scope.nodes[i].type == $rootScope.settings.content.entities[j].type) {
                                var found = false;
                                $scope.nodes[i].typeSingle = $rootScope.settings.content.entities[j].single;
                                for (var k in facet.options) {
                                    if (facet.options[k].value == $rootScope.settings.content.entities[j].type) {
                                        found = true;
                                        facet.options[k].count += 1;
                                    }
                                }
                                if (!found) {
                                    facet.options.push({
                                        'label': $rootScope.settings.content.entities[j].single,
                                        'value': $rootScope.settings.content.entities[j].type,
                                        'count': 1
                                    });
                                }
                            }
                        }
                    }
                }
                $scope.facets.push(facet);
            }


            //Path toevoegen als facet

            //Check eerst of er al 'pathfirsts' in de huidige filters staan. (Als er een multilevel path is, en het eerste deel is geselecteerd)
            var pathfirstFilters = [];
            for(var j in $scope.filters){
                if($scope.filters[j].facet.key == "path"){
                    if($scope.filters[j].option.value.indexOf("\\") == -1){
                        pathfirstFilters.push($scope.filters[j].option.value);
                    }
                }
            }

            var facet = {'key': 'path', 'label': $scope.entity.path.label, 'options': [], 'show': 5};
            for(var i in $scope.nodes){
                if($scope.nodes[i].visible) {
                    if(typeof $scope.nodes[i].path == 'string') {
                        var paths = $scope.nodes[i].path.split(";");
                        for (var j in paths) {
                            if (typeof paths[j] !== 'string') continue;
                            if (paths[j].trim() == '' && paths.length > 1) continue; // Een leeg path, terwijl er ook nog andere paths zijn. skippen!
                            var pathparts = paths[j].split("\\");
                            var pathfirst = pathparts[0];
                            if(pathfirstFilters.indexOf(pathfirst) == -1 || pathparts.length <= 1){
                                //Normale situatie, neem alleen de 'pathfirst' op in de facets, het eerste deel voor de \
                                var found = false;
                                for (var k in facet.options) {
                                    if (facet.options[k].value == pathfirst) {
                                        found = true;
                                        facet.options[k].count += 1;
                                    }
                                }
                                if (!found) {
                                    var label = pathfirst;
                                    if (label.trim() == '') label = '[geen]';
                                    //label = label.replace("\\"," > ");
                                    facet.options.push({'label': label, 'value': pathfirst, 'count': 1});
                                }
                            } else {
                                //Het eerste deel van het path zit al in de filter. Neem daarom het gehele path op in de categorie
                                var found = false;
                                for (var k in facet.options) {
                                    if (facet.options[k].value == paths[j]) {
                                        found = true;
                                        facet.options[k].count += 1;
                                    }
                                }
                                if (!found) {
                                    var label = paths[j];
                                    if (label.trim() == '') label = '[geen]';
                                    label = label.replace("\\"," > ");
                                    facet.options.push({'label': label, 'value': paths[j], 'count': 1});
                                }
                            }
                        }
                    }

                }
            }
            $scope.facets.push(facet);

            //Alle datavelden toevoegen aan facets
            for(var i in $scope.entity.data){
                if($scope.entity.data[i].facet){
                    var facet = {'key': $scope.entity.data[i].key, 'label': $scope.entity.data[i].label, 'options': [], 'show': 5};
                    for(var j in $scope.nodes){
                        if($scope.nodes[j].visible) {
                            var found = false;
                            for (var k in facet.options) {
                                if (facet.options[k].value == $scope.nodes[j].data[$scope.entity.data[i].key]) {
                                    found = true;
                                    facet.options[k].count += 1;
                                }
                            }
                            if (!found) {
                                var label = $scope.nodes[j].data[$scope.entity.data[i].key];
                                if (!label || label.trim() == '') label = '[geen]';
                                facet.options.push({'label': label, 'value': $scope.nodes[j].data[$scope.entity.data[i].key], 'count': 1});
                            }
                        }
                    }
                    $scope.facets.push(facet);
                }
            }

            if(!$scope.multipleTypes) {
                //Alle relaties
                for (var i in $scope.entity.relations) {
                    if ($scope.entity.relations[i].facet) {
                        var facet = {
                            'key': $scope.entity.relations[i].key,
                            'label': $scope.entity.relations[i].label,
                            'options': [],
                            'show': 5
                        };
                        for (var j in $scope.nodes) {
                            if ($scope.nodes[j].visible) {
                                var arr = $scope.nodes[j][$scope.entity.relations[i].key];
                                if (arr) {
                                    for (var k in arr) {
                                        var found = false;
                                        for (var l in facet.options) {
                                            if (facet.options[l].value == arr[k]) {
                                                found = true;
                                                facet.options[l].count += 1;
                                            }
                                        }
                                        if (!found) {
                                            facet.options.push({'label': arr[k], 'value': arr[k], 'count': 1});
                                        }
                                    }
                                }
                            }
                        }
                        $scope.facets.push(facet);
                    }
                }

                //Alle dependencies
                for (var i in $scope.entity.dependencies) {
                    if ($scope.entity.dependencies[i].facet) {
                        var facet = {
                            'key': $scope.entity.dependencies[i].key,
                            'label': $scope.entity.dependencies[i].label,
                            'options': [],
                            'show': 5
                        };
                        for (var j in $scope.nodes) {
                            if ($scope.nodes[j].visible) {
                                var arr = $scope.nodes[j][$scope.entity.dependencies[i].key];
                                if (arr) {
                                    for (var k in arr) {
                                        var found = false;
                                        for (var l in facet.options) {
                                            if (facet.options[l].value == arr[k]) {
                                                found = true;
                                                facet.options[l].count += 1;
                                            }
                                        }
                                        if (!found) {
                                            facet.options.push({'label': arr[k], 'value': arr[k], 'count': 1});
                                        }
                                    }
                                }
                            }
                        }
                        $scope.facets.push(facet);
                    }
                }
            }

            self.facetsCreated = true;
        }

        $scope.setAllNodesVisible = function(){
            for(var i in $scope.nodes) {
                $scope.nodes[i].visible = true;
            }
        }

        $scope.filterNodes = function(){
            //if(!$scope.filters || $scope.filters.length == 0) return true;
            for(var i in $scope.nodes){
                $scope.nodes[i].visible = true;
                for(var j in $scope.filters){
                    switch($scope.filters[j].facet.key){
                        case "path":
                            var paths = $scope.nodes[i].path.split(";");
                            if(paths.length > 0) {
                                var pathsfirst = [];
                                for(var k in paths){
                                    pathsfirst.push(paths[k].split("\\")[0]);
                                }
                                if ((paths.indexOf($scope.filters[j].option.value) == -1 && pathsfirst.indexOf($scope.filters[j].option.value) == -1) || ($scope.filters[j].option.value.trim() == "" && paths.length > 1)) { //Tweede conditie: als value = "" (dus: '[geen]') en er zijn andere paths, dan niet laten zien
                                    $scope.nodes[i].visible = false;
                                    continue;
                                }
                            } else {
                                //Geen categorie
                                if($scope.filters[j].option.value.trim() != ""){
                                    //Option is niet [geen], of wel [geen] maar er zijn nog andere paths
                                    $scope.nodes[i].visible = false;
                                    continue;
                                }
                            }
                            break;
                        default:
                            if($scope.nodes[i][$scope.filters[j].facet.key] && Array.isArray($scope.nodes[i][$scope.filters[j].facet.key])){
                                //Relatie
                                if($scope.nodes[i][$scope.filters[j].facet.key].indexOf($scope.filters[j].option.value) == -1) {
                                    $scope.nodes[i].visible = false;
                                    continue;
                                }
                            } else if($scope.nodes[i].data[$scope.filters[j].facet.key]){
                                //Data
                                if($scope.nodes[i].data[$scope.filters[j].facet.key] != $scope.filters[j].option.value){
                                    $scope.nodes[i].visible = false;
                                    continue;
                                }
                            } else {
                                //Relatie of Data-element bestaat niet
                                if($scope.nodes[i][$scope.filters[j].facet.key]) {
                                    //Type
                                    if ($scope.nodes[i][$scope.filters[j].facet.key] != $scope.filters[j].option.value) {
                                        $scope.nodes[i].visible = false;
                                        continue;
                                    }
                                }else if($scope.filters[j].option && $scope.filters[j].option.value && $scope.filters[j].option.value.trim != ''){
                                    $scope.nodes[i].visible = false;
                                    continue;
                                }
                            }
                            break;
                    }
                }
            }
            self.createFacets();
        }

        $scope.addFilter = function(facet, option){
            if(!$scope.filters) $scope.filters = [];
            $scope.filters.push({'facet': facet, 'option': option});
            this.filterNodes();
        }

        $scope.deleteFilter = function(filter){
            var newFilters = [];
            for(var i in $scope.filters){
                if($scope.filters[i].facet.key == filter.facet.key && $scope.filters[i].option.value == filter.option.value){
                    //Deze eruit
                } else {
                    newFilters.push($scope.filters[i]);
                }
            }
            $scope.filters = newFilters;
            this.filterNodes();
        }

        $scope.addNode = function(){
            $state.go("node.new", {"type": $stateParams.type});
            /*
            Nodes.addNode({
                "type": $stateParams.type,
                "path": "",
                "title": "Nieuw "+ $scope.entity.single
            }, function(newId){
                console.log(newId);
                $state.go("node.tab",{"nodeId": newId, "tab": "edit"});
            });
             */
        }

          $scope.onSearch = function(){
              $state.go("nodes.query",{"type": "zoeken", "q": $scope.zoeken.q});
              self.doSearch($scope.zoeken.q);
          }

          $scope.prepareGeo = function() {
              $scope.paths = [];
              var latlngbounds = new google.maps.LatLngBounds();
              for(var i in $scope.nodes){
                  if($scope.nodes[i].data.geometry) {
                      //$scope.nodes[i].geo = {};
                      var json = JSON.parse($scope.nodes[i].data.geometry.replace(/&#34;/g, "\""));
                      for(var j in json.coordinates){
                          var paths = [];
                          for(var k in json.coordinates[j][0]){
                              paths.push([json.coordinates[j][0][k][1],json.coordinates[j][0][k][0]]); //Reverse Lat & Lon
                              latlngbounds.extend(new google.maps.LatLng(json.coordinates[j][0][k][1],json.coordinates[j][0][k][0]));
                          }
                          $scope.paths.push({"node": $scope.nodes[i],"nodeId": $scope.nodes[i].nodeId, "paths": paths});
                      }
                      //$scope.nodes[i].geo.paths = json.coordinates;
                  }
              }
              $scope.$on('mapInitialized', function(event, map) {
                  map.setCenter(latlngbounds.getCenter());
                  map.fitBounds(latlngbounds);
              });
          }

          $scope.geoSelect = function(event, node){
              $state.go("node",{"nodeId": node.nodeId});
          }

          $scope.geoOver = function(event, node) {
              $scope.node = node;
              $scope.tooltipX = event.ub.offsetX + 20;
              $scope.tooltipY = event.ub.offsetY + 20;
              console.log(event);
          }

          $scope.geoOut = function(event, node) {
              $scope.node = null;
          }

          $scope.setFacet = function(bool){
            self.faceted = bool;
            if(self.faceted && !self.facetsCreated){
                self.createFacets();
            }
            if(!self.faceted){
                $scope.setAllNodesVisible();
            }
            $scope.faceted = self.faceted;
          }

          $scope.toggleFacet = function(){
            $scope.setFacet(!self.faceted);
          }

          $scope.setView = function(view){
              $scope.view = view;
              if(view == "geo"){
                  $scope.prepareGeo();
              }
          }

          $scope.scrollTo = function(nodeId){
              {
                  $anchorScroll.yOffset = 150;
                  $timeout(function() {
                      $location.hash('node' + nodeId);
                      $anchorScroll();
                  });
              }
          }

        $scope.orderProp = ["path","title"];
        $scope.filterProp = [];
        $scope.nodesLoaded = false;
        $scope.user = $rootScope.setup.user;
        $scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=" + $rootScope.GoogleMapsKey;

        $scope.type = $stateParams.type;
        $scope.key = $stateParams.key;
        if($scope.type == "zoeken"){
            $rootScope.backgroundImgUrl = "app/images/zoeken.jpg";
            if($stateParams.q){
                $scope.zoeken.q = $stateParams.q;
                this.doSearch($stateParams.q);
            }
        } else if(!$scope.type && $scope.key){
            this.loadRelation($scope.key);
        } else  {
            this.loadNodes($scope.type);
        }
      }
    ]
  });