'use strict';
angular.
  module('app').
  component('node', {
    templateUrl: 'app/components/nodes/node.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', '$timeout', 'Nodes', '$location', '$filter', '$sanitize', '$sce',
      function NodeController($http, $rootScope, $scope, $state, $stateParams, $window, $timeout, Nodes, $location, $filter, $sanitize, $sce) {
        var self = this;
        $scope.user = $rootScope.setup.user;
        $scope.history = null;

        this.loadNode = function(nodeId){
            $scope.node = null;
            $scope.loaded = false;
            Nodes.loadNode(nodeId, function(){
                $scope.node = Nodes.getNode();
                if(!$scope.node.data || $scope.node.data == []) $scope.node.data = {};
                for(var i in $rootScope.settings.content.entities){
                    if($rootScope.settings.content.entities[i].type == $scope.node.type){
                        $scope.entity = $rootScope.settings.content.entities[i];
                    }
                }
                $scope.loaded = true;
                //console.log($scope.entity);
                if($scope.view.tab == "edit") $scope.startEdit();
                if($scope.view.tab == "version") $scope.startVersion();
                if($scope.node.data.geometry) $scope.prepareGeo();

                if($scope.entity && ($scope.entity.views[0] == 'chapters' || $scope.entity.showNextPrev)){
                    self.loadTree(nodeId);
                    if($scope.entity.views[0] == 'chapters') {
                        $scope.showChapter = true;
                    } else {
                        $scope.showNextPrev = true;
                        $scope.showChapter = false;
                    }
                } else {
                    $scope.showChapter = false;
                }
                self.setDate();
                self.setAttachments();

                if($scope.module) $scope.simplelink = $rootScope.wwwBase + $scope.module.name +"/" + "node/" + $scope.node.getLinkTitle() + "/" + nodeId;
            });
        }

        this.emptyNode = function(type, relation){
            for(var i in $rootScope.settings.content.entities){
                if($rootScope.settings.content.entities[i].type == type){
                    $scope.entity = $rootScope.settings.content.entities[i];
                }
            }
            $scope.node = new Node({"type": type, "path": "", "title": "Nieuw "+ $scope.entity.single});
            if(relation){
                $scope.node.addRelation = {
                    "sourceId": $stateParams.nodeId,
                    "relation": relation
                }
            }
            if($rootScope.newNode){
                for(var i in $rootScope.newNode){
                    $scope.node[i] = $rootScope.newNode[i];
                }
                $rootScope.newNode = null
            }
        }

        this.setDate = function(){
            if($scope.entity){
                for(var i in $scope.entity.data){
                    if($scope.entity.data[i].type == "datetime"){
                        if($scope.node.data[$scope.entity.data[i].key]){
                            if($scope.node.data[$scope.entity.data[i].key] instanceof Date){
                                $scope.node.date = $scope.node.data[$scope.entity.data[i].key];
                            } else {
                                $scope.node.date = new Date($scope.node.data[$scope.entity.data[i].key]);
                            }
                            $scope.node.dateYear = $scope.node.date.getFullYear();
                            $scope.node.dateMonth = $scope.node.date.getMonth();
                            $scope.node.dateHistoric = $scope.node.date < new Date();
                        }
                        return null; //Only do this for first datetime
                    }
                }
            }
        }

        this.setAttachments = function(){
            if($scope.node.data.attachments){
                for(var i in $scope.node.data.attachments){
                    if($scope.node.data.attachments[i].hash){
                        $scope.node.data.attachments[i].url =  $rootScope.APIBase + "file/" + $scope.node.nodeId +"/" + $scope.node.data.attachments[i].hash;
                    }
                }
            }
        }

        this.loadTree = function(nodeId) {
            //Als de view 'chapters' is, dan ook de 'inhoudsopgave' downloaden

            Nodes.loadNodes($scope.entity.type, false, null, function (type) {
                $scope.nodes = Nodes.getNodes();
                //load Tree
                Nodes.createTree(function (tree) {
                    $scope.tree = tree;
                    $scope.tree.subs = $filter('orderBy')($scope.tree.subs, 'title', false); //Zelfde sorteervolgorde als in weergave

                    var treePos = null;
                    var subPos = null;
                    for(var i in $scope.tree.subs) {
                        if ($scope.node.path.split(";").indexOf($scope.tree.subs[i].title) >= 0) {
                            $scope.tree.subs[i].open = true;
                            treePos = parseInt(i);
                            for (var j in $scope.tree.subs[i].nodes) {
                                if ($scope.tree.subs[i].nodes[j].nodeId == $scope.node.nodeId) {
                                    subPos = parseInt(j);
                                }
                            }
                        }
                    }
                    //Vind volgende en vorige
                    if(treePos || treePos === 0) {
                        $scope.siblings = {'previous': null, 'next': null, 'nodes': tree.subs[treePos]}
                        //Vorige
                        if (subPos > 0) {
                            $scope.siblings.previous = $scope.tree.subs[treePos].nodes[subPos - 1];
                        } else if (treePos > 0) {
                            $scope.siblings.previous = $scope.tree.subs[treePos - 1].nodes[$scope.tree.subs[treePos - 1].nodes.length - 1];
                        }

                        if ($scope.tree.subs[treePos] && subPos < $scope.tree.subs[treePos].nodes.length - 1) {
                            $scope.siblings.next = $scope.tree.subs[treePos].nodes[subPos + 1];
                        } else if ($scope.tree.subs[treePos] && treePos < $scope.tree.subs.length - 1) {
                            $scope.siblings.next = $scope.tree.subs[treePos + 1].nodes[0];
                        }
                    } else {
                        //Geen subs, alles zit in de nodes
                        $scope.siblings = {'previous': null, 'next': null, 'nodes': tree.nodes}
                        for (var j in $scope.siblings.nodes) {
                            if ($scope.siblings.nodes[j].nodeId == $scope.node.nodeId) {
                                subPos = parseInt(j);
                            }
                        }
                        if (subPos > 0) $scope.siblings.previous = $scope.siblings.nodes[subPos - 1];
                        if ($scope.siblings.nodes[subPos + 1]) $scope.siblings.next = $scope.siblings.nodes[subPos + 1];
                    }
                });
            });
        }

        $scope.startEdit = function() {
            //Set options for text-editor
            $scope.wysiwyg = false;

            //convert date into date-object
            if($scope.entity && $scope.node && $scope.node.data){
                for(let i in $scope.entity.data){
                    switch($scope.entity.data[i].type){
                        case "datetime":
                            if($scope.node.data[$scope.entity.data[i].key]){
                                $scope.node.data[$scope.entity.data[i].key] = new Date($scope.node.data[$scope.entity.data[i].key]);
                            }
                            break;
                    }
                }
            }


            //Load all possible relations
            if (!$scope.relations || $scope.relations.length == 0) {
                $scope.relations = {};
                for (var i in $scope.entity.relations) {
                    if (!$scope.relations[$scope.entity.relations[i].type]) {
                        Nodes.loadNodes($scope.entity.relations[i].type, false, null, function (type) {
                            $scope.relations[type] = Nodes.getNodes();
                        });
                    }
                }

                //Load all possible dependencies (target relations)
                for (var i in $scope.entity.dependencies) {
                    if (!$scope.relations[$scope.entity.dependencies[i].type]) {
                        Nodes.loadNodes($scope.entity.dependencies[i].type, false, null, function (type) {
                            $scope.relations[type] = Nodes.getNodes();
                        });
                    }
                }
            }

            //Load all possible paths for this type
            Nodes.loadPaths($scope.node.type, function (paths) {
                $scope.paths = paths;
            });
        }

        $scope.startVersion = function(){
            if(!$scope.history){
                Nodes.loadNodeHistory(self.nodeId, function(nodes) {
                    $scope.history = {'nodes': []};
                    for(i in nodes){
                        $scope.history.nodes.push(nodes[i]);
                        if(nodes[i].status == 'current'){
                            $scope.history.currentNode = nodes[i];
                        }
                    }
                    $scope.historySelect(nodes[i]); //Select last node as selected one
                });
            }
        }

        $scope.historySelect = function(node) {
            $scope.history.selectedNode = node;

            for (var i in $scope.history.nodes) {
                if ($scope.history.nodes[i].nodeVersionId == node.nodeVersionId) {
                    $scope.historyCompare($scope.history.nodes[Math.max(0,i - 1)]);
                }
            }
        }

        $scope.historyCompare = function(node){
            $scope.history.selectedNode.diff = {
                'text' : ""
            }
            $scope.history.comparedNode = node;
            var dmp = new diff_match_patch();
            var diff = dmp.diff_main(""+node.text, ""+$scope.history.selectedNode.text);
            dmp.diff_cleanupSemantic(diff);
            $scope.history.selectedNode.diff = {
                'parts' : diff,
                'complete': ""
            }
            for(let i in diff){
                if(diff[i][0] == 0){
                    $scope.history.selectedNode.diff.complete += diff[i][1];
                } else {
                    $scope.history.selectedNode.diff.complete += "<span class='diff" + diff[i][0] +"'>" + diff[i][1] + "</span>";
                }
            }
        }

          $scope.historyApprove = function(node){
              Nodes.historyApprove(node, function(){
                  $window.location.reload();
              })
          }

          $scope.historyRevert = function(node){
              Nodes.historyRevert(node, function(){
                  $window.location.reload();
              })
          }

          $scope.historyDelete = function(node){
              Nodes.historyDelete(node, function(){
                  $window.location.reload();
              })
          }

          $scope.prepareGeo = function(){
              $scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=" + $rootScope.GoogleMapsKey;
              $scope.node.geo = {"center": "", "paths": []};
              var latlngbounds = new google.maps.LatLngBounds();

              var json = JSON.parse($scope.node.data.geometry.replace(/&#34;/g, "\""));
              for(var j in json.coordinates){
                  var paths = [];
                  for(var k in json.coordinates[j][0]){
                      paths.push([json.coordinates[j][0][k][1],json.coordinates[j][0][k][0]]); //Reverse Lat & Lon
                      latlngbounds.extend(new google.maps.LatLng(json.coordinates[j][0][k][1],json.coordinates[j][0][k][0]));
                  }
                  $scope.node.geo.paths.push(paths);
              }

              $scope.node.geo.center = ""+latlngbounds.getCenter().lat() + ","+latlngbounds.getCenter().lng();
              $scope.$on('mapInitialized', function(event, map) {
                map.setCenter(latlngbounds.getCenter());
                map.fitBounds(latlngbounds);
              });
          }

          /**
           * addRelatie voegt een nieuwe relatie toe aan de Node
           * @param relatie
           * @param formOrNodeId - Dit kan een nodeId zijn indien het een bestaande relatie is, of een volledig form-object bij een nieuwe relatie
           */
          $scope.addRelatie = function(relatie, formOrNodeId, reverse){
              if(Number.isInteger(formOrNodeId) || typeof(formOrNodeId) == "string"){
                  //Existing node
                  Nodes.addRelation(self.nodeId, relatie.key, formOrNodeId, function(relatedNode){
                      relatedNode.sourceId = self.nodeId;
                      relatedNode.targetId = relatedNode.nodeId;
                      relatedNode.key = relatie.key;
                      $scope.node.addRelatedNode(relatedNode, relatie.key);
                      $scope.searchText[relatie.key] = null; //Reset text input field
                  });
              } else {
                  //Adding a new node
                  Nodes.addNode({
                      "type": relatie.type,
                      "path": "",
                      "title": formOrNodeId.searchText[relatie.key]
                  }, function(newId){
                      Nodes.addRelation(self.nodeId, relatie.key, newId, function(relatedNode){
                          $scope.node.addRelatedNode(relatedNode, relatie.key);
                          $scope.searchText[relatie.key] = null; //Reset text input field
                      });
                  });
              }
              return false;
          }

          $scope.addRelatieAndData = function(relatie, option){
              Nodes.addRelation(self.nodeId, relatie.key, option.nodeId, function(relatedNode){
                  relatedNode.sourceId = self.nodeId;
                  relatedNode.targetId = relatedNode.nodeId;
                  relatedNode.key = relatie.key;
                  relatedNode.datarelation = option.datarelation;
                  $scope.node.addRelatedNode(relatedNode, relatie.key);
              });
          }

          $scope.addNewItemRelatieAndData = function(relatie,newItem){
              let newNode = {
                  type: relatie.type,
                  title: newItem.title,
              }
              newNode.type = relatie.type;
              Nodes.addNode(newNode, function(newId){
                  newNode.nodeId = newId;
                  newNode.datarelation = angular.copy(newItem.datarelation);
                  $scope.addRelatieAndData(relatie, newNode);
              })
          }

          /**
           * addDependency, doet hetzelfde als een relatie toevoegen, maar dan is de node de targetId en niet de sourceId
           * @param relatie
           * @param sourceId - De nodeId van de bestaande node die de sourceId van de relatie wordt
           */
          $scope.addDependency = function(relatie, sourceId){
              Nodes.addDependency(sourceId, relatie.key, self.nodeId, function(relatedNode){
                  relatedNode.sourceId = relatedNode.nodeId;
                  relatedNode.targetId = self.nodeId;
                  relatedNode.key = relatie.key;
                  $scope.node.addDependentNode(relatedNode, relatie.key);
                  $scope.searchText[relatie.key] = null; //Reset text input field
              });
          }

          $scope.addDependencyAndData = function(relatie, option){
              Nodes.addDependency(option.nodeId, relatie.key, self.nodeId, function(relatedNode){
                  relatedNode.sourceId = relatedNode.nodeId;
                  relatedNode.targetId = self.nodeId;
                  relatedNode.key = relatie.key;
                  relatedNode.datarelation = option.datarelation;
                  $scope.node.addDependentNode(relatedNode, relatie.key);
                  $scope.searchText[relatie.key] = null; //Reset text input field
              });
          }

          $scope.addNewItemDependencyAndData = function(relatie,newItem){
              let newNode = {
                  type: relatie.type,
                  title: newItem.title,
              }
              newNode.type = relatie.type;
              Nodes.addNode(newNode, function(newId){
                  newNode.nodeId = newId;
                  newNode.datarelation = angular.copy(newItem.datarelation);
                  $scope.addDependencyAndData(relatie, newNode);
              })
          }

          $scope.deleteRelatie = function(relatie){
              Nodes.deleteRelation(relatie, function(){
                  $scope.node.deleteRelatedNode(relatie);
              });
          }

          $scope.deleteDependency = function(relatie){
              Nodes.deleteRelation(relatie, function(){
                  $scope.node.deleteDependencyNode(relatie);
              });
          }


        $scope.save = function(data){
            if(Array.isArray($scope.node.data)){
                $scope.node.data = Object.assign({}, $scope.node.data);
            }
            if(!$scope.node.nodeId){
                //console.log($scope.node);
                if($scope.node.addRelation){
                    //AddNode & Terug naar de 'parent' waar deze node aan is toegevoegd
                    Nodes.addNode($scope.node, function (newId) {
                        $state.go("module.node.tab", {"nodeId": $scope.node.addRelation.sourceId, "tab": "details"},{"reload": true});
                    })
                } else {
                    //AddNode & Nieuwe node laten zien
                    Nodes.addNode($scope.node, function (newId) {
                        $state.go("module.node.tab", {"nodeId": newId, "tab": "edit"});
                    })
                }
            } else {
                //Node laten zien
                Nodes.saveNode($scope.node, function () {
                    $state.go("^.tab", {"tab": "details"});
                });
            }
        }


        $scope.deleteImage = function(){
            $scope.node.imgUrl = null;
        }

        $scope.deleteAttachment = function(num){
        $scope.node.data.attachments.splice(num,1);
    }

    $scope.deletePath = function(path){
            var paths = $scope.node.path.split(";");
            var newpaths = [];
            for(var i in paths){
                if(paths[i] != path){
                    newpaths.push(paths[i]);
                }
            }
            $scope.node.path = newpaths.join(";");
        }

        $scope.addPath = function(path){
            var paths = $scope.node.path.split(";");
            if(paths.indexOf(path) === -1){
                paths.push(path);
            }
            //console.log(path);
            //console.log(paths);
            $scope.searchPath = "";
            $scope.node.path = paths.join(";");
        }

        $scope.deleteNode = function(){
            var type = $scope.node.type;
            Nodes.deleteNode($scope.node.nodeId, function(){
                    $state.go("module.nodes", {"type": type});
                }
            );
        }

        $scope.addRelatedNode = function(type, relation){
            //TOD: ander type, ophalen uit entity.relations!
            $state.go("module.node.newrelated", {"type": type, "relation": relation}, {"reload": true});
        }

        $scope.getTokenLink = function(){
            Nodes.getTokenLink($scope.node.nodeId, function(tokenStr){
                $scope.token = tokenStr;
                $scope.tokenlink = $scope.simplelink + "?token=" + $scope.token;
            });
        }

        $scope.loadMap = function(div, nodes, force){
            if((force || !$scope.pdokMap) && document.getElementById(div)){
                // Achtergrond lagen
                var backgroundLayer = L.tileLayer('https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/grijs/EPSG:3857/{z}/{x}/{y}.png', {
                    attribution: '<a href="https://creativecommons.org/licenses/by/3.0/nl/">CC BY 3.0</a> Kadaster', // Attributie van kaartmateriaal
                    maxZoom: 19, // Maximale zoom niveau van deze getegelde kaart service
                    minZoom: 8, // Minimale zoom niveau van deze getegelde kaart service
                    tileSize: 256, // Grootte van de tegels die opgehaald worden
                    zoomOffset: 0 // Zoom offset (meestal 0)
                });

                // Kaart aanmaken
                if($scope.pdokMap) $scope.pdokMap.remove(); // Forced, so set-up again

                $scope.pdokMap = L.map('mapPDOK', {
                    center: [52.2, 5.3], // Coordinaten van het startpunt van de kaart
                    zoom: 8, // Zoomniveau van het startpunt van de kaart
                    layers: [backgroundLayer] // Ingeschakelde kaartlagen
                });

                // Voeg een schaal control toe aan kaart object
                L.control.scale().addTo($scope.pdokMap);
                $scope.pdokMap.invalidateSize(false);
            } else {
                if(!document.getElementById(div)){
                    $timeout(function(){
                        $scope.loadMap(div, nodes, force);
                    }, 500);
                }
            }
            if($scope.pdokMap) $scope.updateMap(nodes);
        }

        $scope.updateMap = function(nodes){
            if(!$scope.pdokMap){
                $timeout(function(){ $scope.updateMap();}, 500); //If no map, try again...
            } else {
                //Clear map, for filtering
                if($scope.maplayers && $scope.maplayers.length > 0)
                for(let i in $scope.maplayers){
                    $scope.pdokMap.removeLayer($scope.maplayers[i]);
                }
                $scope.maplayers = [];

                if(nodes && nodes.length > 0) {
                    let entity = {data: []};
                    for (var i in $rootScope.settings.content.entities) {
                        if ($rootScope.settings.content.entities[i].type == nodes[0].type) {
                            entity = $rootScope.settings.content.entities[i];
                        }
                    }

                    for (let i in nodes) {
                        if (nodes[i].data.geometry) {
                            let add = true;
                            var json = JSON.parse(nodes[i].data.geometry.replace(/&#34;/g, "\""));
                            let tooltip = " <div class=\"details\">\n" +
                                "<strong>" + nodes[i].title + "</strong>";
                            for (let j in entity.data) {
                                if (nodes[i].data[entity.data[j].key] && entity.data[j].type != "geometry") {
                                    tooltip += "<br/>" + entity.data[j].label + ": " + nodes[i].data[entity.data[j].key];
                                }
                                if ($scope.current[entity.data[j].key] && $scope.current[entity.data[j].key] != nodes[i].data[entity.data[j].key]) add = false;
                            }
                            let className = "nodegeo";
                            for (let j in nodes[i].datarelation) {
                                tooltip += "<br/>" + j + ": " + nodes[i].datarelation[j];
                                className += " "+ j + nodes[i].datarelation[j].substring(0,1); //Bijv. status0 om kleuren toe te voegen
                            }
                            tooltip += " </div>";
                            if (add) {
                                //nodes[i].layer = L.geoJSON(json).bindTooltip(tooltip, {
                                let layer = L.geoJSON(json, {
                                    style: function style(feature) {
                                        return {
                                            className: className,
                                            weight: 1,
                                            opacity: 1,
                                            color: '#777',
                                            stroke: true,
                                            fillOpacity: 0.7
                                        };
                                    }
                                }).bindTooltip(tooltip, {
                                    permanent: false,
                                    sticky: true,
                                    offset: [10, 0],
                                    opacity: 0.75,
                                    className: 'leaflet-tooltip-own'
                                }).addTo($scope.pdokMap);
                                layer.on("click", function (e) {
                                    $state.go("module.node", {"nodeId": nodes[i].nodeId});
                                });
                                $scope.maplayers.push(layer);
                            }
                        }
                    }
                }

                $timeout(function(){
                    $scope.pdokMap.invalidateSize(false);
                }, 0);

                //Set bounds:
                const allLayers = [];
                $scope.pdokMap.eachLayer(function (layer) {
                    if (layer.feature) { //If it is a feature
                        allLayers.push(layer);
                    }
                });
                if (allLayers.length > 0) {
                    var all = new L.featureGroup(allLayers);
                    $scope.pdokMap.fitBounds(all.getBounds());
                } else {
                    $scope.pdokMap.setView([52.2, 5.3], 8)
                }

            }
        }

        $scope.setTab = function(tab){
            if(!$scope.view) $scope.view = {"tab": "details"}
            $scope.view.tab = tab;
            if($scope.node && tab == "edit") $scope.startEdit();
            if(self.nodeId && tab == "version") $scope.startVersion();
        }

        $scope.searchText = {};
        $scope.module = $rootScope.module;

        this.nodeId = $stateParams.nodeId;
        //console.log($stateParams);
        if($stateParams.tab){
            $scope.setTab($stateParams.tab)
        } else {
            $scope.setTab("details");
        }

          $scope.trustAsHtml = function(string) {
              return $sce.trustAsHtml(string);
          };

          //https://www.tiny.cloud/docs/advanced/editor-control-identifiers/#toolbarcontrols
          $scope.tinymceOptions = {
              relative_urls : false,
              paste_as_text: true,
              height: 720,
              indent: false,
              inline: false,
              menubar: false,
              plugins : 'advlist autolink link image lists charmap print preview paste media code textcolor',
              toolbar: [
                  'pastetext | undo redo | styleselect | bold italic forecolor | link image media | bullist numlist | alignleft aligncenter alignright | code'
              ],
              skin: 'lightgray',
              theme : 'modern'
          };

          $scope.tinymceOptionsSmall = {
              relative_urls : false,
              paste_as_text: true,
              height: 240,
              indent: false,
              inline: false,
              menubar: false,
              plugins : 'advlist autolink link image lists charmap print preview paste media code textcolor',
              toolbar: [
                  'pastetext | undo redo | bold italic forecolor | link | bullist numlist'
              ],
              skin: 'lightgray',
              theme : 'modern'
          };

          $scope.saveCurrent = function(){
              window.localStorage.setItem("current", JSON.stringify($scope.current));
          }

          $scope.current = window.localStorage.getItem("current");
          if($scope.current){
              $scope.current = JSON.parse($scope.current);
          } else {
              $scope.current = {};
          }

        $scope.orderProp = ["path","title"];

        if(this.nodeId && $state.current.name != "module.node.newrelated") {
            this.loadNode(this.nodeId);
        } else {
            this.emptyNode($stateParams.type, $stateParams.relation);
            $scope.startEdit();
            $scope.setTab("edit");
        }
      }
    ]
  });