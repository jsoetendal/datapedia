'use strict';
angular.
  module('app').
  component('node', {
    templateUrl: 'app/components/nodes/node.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Nodes', '$location', '$sanitize',
      function NodeController($http, $rootScope, $scope, $state, $stateParams, $window, Nodes, $location, $sanitize) {
        var self = this;

        this.loadNode = function(nodeId){
            $scope.node = null;
            $scope.loaded = false;
            Nodes.loadNode(nodeId, function(){
                $scope.node = Nodes.getNode();
                if(!$scope.node.data || $scope.node.data == []) $scope.node.data = {};
                console.log($scope.node);
                console.log($rootScope.settings);
                for(var i in $rootScope.settings.content.entities){
                    if($rootScope.settings.content.entities[i].type == $scope.node.type){
                        $scope.entity = $rootScope.settings.content.entities[i];
                    }
                }
                $scope.loaded = true;
                console.log($scope.entity);
                if($scope.view.tab == "edit") $scope.startEdit();
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

        $scope.startEdit = function() {
            //Load all possible relations
            if (!$scope.relations || $scope.relations.length == 0) {
                $scope.relations = {};
                for (var i in $scope.entity.relations) {
                    if (!$scope.relations[$scope.entity.relations[i].type]) {
                        Nodes.loadNodes($scope.entity.relations[i].type, function (type) {
                            $scope.relations[type] = Nodes.getNodes();
                        });
                    }
                }

                //Load all possible dependencies (target relations)
                for (var i in $scope.entity.dependencies) {
                    if (!$scope.relations[$scope.entity.dependencies[i].type]) {
                        Nodes.loadNodes($scope.entity.dependencies[i].type, function (type) {
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
          /**
           * addRelatie voegt een nieuwe relatie toe aan de Node
           * @param relatie
           * @param formOrNodeId - Dit kan een nodeId zijn indien het een bestaande relatie is, of een volledig form-object bij een nieuwe relatie
           */
          $scope.addRelatie = function(relatie, formOrNodeId, reverse){
              if(Number.isInteger(formOrNodeId) || typeof(formOrNodeId) == "string"){
                  //Existing node
                  Nodes.addRelation(self.nodeId, relatie.key, formOrNodeId, function(relatedNode){
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
          }

          /**
           * addDependency, doet hetzelfde als een relatie toevoegen, maar dan is de node de targetId en niet de sourceId
           * @param relatie
           * @param sourceId - De nodeId van de bestaande node die de sourceId van de relatie wordt
           */
          $scope.addDependency = function(relatie, sourceId){
              Nodes.addRelation(sourceId, relatie.key, self.nodeId, function(relatedNode){
                  $state.reload();
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
                console.log($scope.node);
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

            console.log(fd);
            console.log(files);

            Nodes.addImage(self.nodeId, fd, function(src){
                $scope.node.imgUrl = src;
            });
            // AJAX request
            // headers: {'Content-Type': undefined},
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
            console.log(path);
            console.log(paths);
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

        $scope.setTab = function(tab){
            if(!$scope.view) $scope.view = {"tab": "details"}
            $scope.view.tab = tab;
            if($scope.node && tab == "edit") $scope.startEdit();
        }

        $scope.searchText = {};
        this.nodeId = $stateParams.nodeId;
        if($stateParams.tab){
            $scope.setTab($stateParams.tab)
        } else {
            $scope.setTab("details");
        }

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