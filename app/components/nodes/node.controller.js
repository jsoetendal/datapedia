'use strict';
angular.
  module('app').
  component('node', {
    templateUrl: 'app/components/nodes/node.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Nodes', '$location', '$filter', '$sanitize', '$sce',
      function NodeController($http, $rootScope, $scope, $state, $stateParams, $window, Nodes, $location, $filter, $sanitize, $sce) {
        var self = this;
        $scope.user = $rootScope.setup.user;
        $scope.history = null;

        this.loadNode = function(nodeId){
            $scope.node = null;
            $scope.loaded = false;
            Nodes.loadNode(nodeId, function(){
                $scope.node = Nodes.getNode();
                if(!$scope.node.data || $scope.node.data == []) $scope.node.data = {};
                //console.log($scope.node);
                //console.log($rootScope.settings);
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

                if($scope.entity && $scope.entity.views[0] == 'chapters'){
                    self.loadTree(nodeId);
                    $scope.showChapter = true;
                } else {
                    $scope.showChapter = false;
                }
                self.setDate();
                self.setAttachments();

                $scope.simplelink = $rootScope.wwwBase +"node/" + $scope.node.getLinkTitle() + "/" + nodeId;
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
                    $scope.siblings = {'previous': null, 'next': null, 'nodes': tree.subs[treePos]}
                    //Vorige
                    if(subPos > 0){
                        $scope.siblings.previous = $scope.tree.subs[treePos].nodes[subPos - 1];
                    }else if(treePos > 0){
                        $scope.siblings.previous = $scope.tree.subs[treePos - 1].nodes[$scope.tree.subs[treePos - 1].nodes.length - 1];
                    }
                    //Volgende\
                    if(subPos < $scope.tree.subs[treePos].nodes.length - 1){
                        $scope.siblings.next = $scope.tree.subs[treePos].nodes[subPos + 1];
                    }else if(treePos < $scope.tree.subs.length - 1){
                        $scope.siblings.next = $scope.tree.subs[treePos + 1].nodes[0];
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
                        $state.go("node.tab", {"nodeId": $scope.node.addRelation.sourceId, "tab": "details"},{"reload": true});
                    })
                } else {
                    //AddNode & Nieuwe node laten zien
                    Nodes.addNode($scope.node, function (newId) {
                        $state.go("node.tab", {"nodeId": newId, "tab": "edit"});
                    })
                }
            } else {
                //Node laten zien
                Nodes.saveNode($scope.node, function () {
                    $state.go("^.tab", {"tab": "details"});
                });
            }
        }

          /**
           * Let op! Wordt niet gebruik. Upload gaat via directive in core.module.js
           * @param data
           */
        $scope.doUpload =  function(data){
            var fd = new FormData();
            var files = document.getElementById('file').files[0];
            fd.append('file',files);

            //console.log(fd);
            //console.log(files);

            Nodes.addImage(self.nodeId, fd, function(src){
                $scope.node.imgUrl = src;
            });
            // AJAX request
            // headers: {'Content-Type': undefined},
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
                    $state.go("nodes", {"type": type});
                }
            );
        }

        $scope.addRelatedNode = function(type, relation){
            //TOD: ander type, ophalen uit entity.relations!
            $state.go("node.newrelated", {"type": type, "relation": relation}, {"reload": true});
        }

        $scope.getTokenLink = function(){
            Nodes.getTokenLink($scope.node.nodeId, function(tokenStr){
                $scope.token = tokenStr;
                $scope.tokenlink = $scope.simplelink + "?token=" + $scope.token;
            });
        }

        $scope.setTab = function(tab){
            if(!$scope.view) $scope.view = {"tab": "details"}
            $scope.view.tab = tab;
            if($scope.node && tab == "edit") $scope.startEdit();
            if(self.nodeId && tab == "version") $scope.startVersion();
        }

        $scope.searchText = {};
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



          if(this.nodeId && $state.current.name != "node.newrelated") {
            this.loadNode(this.nodeId);
        } else {
            this.emptyNode($stateParams.type, $stateParams.relation);
            $scope.startEdit();
            $scope.setTab("edit");
        }
      }
    ]
  });