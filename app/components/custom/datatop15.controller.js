'use strict';
angular.
  module('app').
  component('datatop15', {
    templateUrl: 'app/components/custom/datatop15.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Nodes', '$location',
      function NodesController($http, $rootScope, $scope, $state, $stateParams, $window, Nodes, $location) {
        var self = this;
        $scope.zoeken = {};
        this.facetsCreated = false;

          this.loadDataTop15 = function() {
              $scope.nodes = [];
              $scope.loaded = false;
              $scope.multipleTypes = false;


              Nodes.loadNodes('onderwerp', false, function () {
                  $scope.onderwerpen = Nodes.getNodes();
                  Nodes.loadNodes('dataset', false, function() {
                      $scope.datasets = Nodes.getNodes();

                      $scope.entity = {
                          "key": "dataset",
                          "single": "Dataset",
                          "plural": "Onderwerp & Datasets",
                          "image": false,
                          "background": "app/images/cs.jpg",
                          "custom": "app/components/custom/relation.dataset.html",
                          "views": ["custom", "list"],
                          "facet": {
                              "optional": false,
                              "default": false
                          },
                          "path": {
                              "label": "Categorie",
                              "multilevel": true,
                              "multiple": true
                          },
                          "data": [
                              {
                                  "key": "mogelijke_bron",
                                  "label": "Mogelijke bron",
                                  "facet": true
                              },
                              {
                                  "key": "bronhouder",
                                  "label": "Bronhouder(s)",
                                  "facet": true
                              },
                              {
                                  "key": "publiekprivaat",
                                  "label": "Overheid of private partij(en)",
                                  "facet": true
                              },
                              {
                                  "key": "datatop15",
                                  "label": "In Data Top 15",
                                  "facet": true
                              }
                          ]
                      };

                      $rootScope.backgroundImgUrl = $scope.entity.background;

                      self.setNodes();
                  });
              });
          }

          this.setNodes = function(){
              $scope.loaded = true;

              $scope.categorieen = [
                  {
                      "key": "1. Geplande wegwerkzaamheden",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "2. Actuele wegwerkzaamheden",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "3. Incidenten",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "4. Restduur incidenten",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "5. Maximumsnelheden",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "6. Borden",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "7. Regelscenario's verkeerscentrales",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "8. Beeldstanden rijkswegen",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "9. Brugopeningen",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "10. Statische parkeerdata",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "11. Dynamische parkeerdata",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "12. Evenementen",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "13. VRI-data",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "14. Data voor logistiek",
                      "onderwerpen": [],
                      "datasets": []
                  },
                  {
                      "key": "15. Fietsdata",
                      "onderwerpen": [],
                      "datasets": []
                  }
          ];


              //Add onderwerpen to categorie
              for(var i in $scope.onderwerpen){
                  if($scope.onderwerpen[i].data && $scope.onderwerpen[i].data.datatop15 && $scope.onderwerpen[i].data.datatop15.length > 0){
                      for(var j in $scope.categorieen){
                          if($scope.onderwerpen[i].data.datatop15 == $scope.categorieen[j].key){
                              $scope.categorieen[j].onderwerpen.push($scope.onderwerpen[i]);
                              for(var k in $scope.onderwerpen[i].dataset){
                                  if($scope.categorieen[j].datasets.indexOf($scope.onderwerpen[i].dataset[k]) == -1){
                                      $scope.categorieen[j].datasets.push($scope.onderwerpen[i].dataset[k]);
                                  }
                              }
                          }
                      }
                  }
              }

              //Replace all datasets in categorie (which are string of the title) by the actual node
              for(var i in $scope.datasets){
                  for(var j in $scope.categorieen){
                      var pos = $scope.categorieen[j].datasets.indexOf($scope.datasets[i].title);
                      if(pos > -1){
                          $scope.categorieen[j].datasets[pos] = $scope.datasets[i];
                      }
                  }
              }

              $scope.nodesLoaded = true;
          }


        $scope.orderProp = ["path","title"];
        $scope.filterProp = [];
        $scope.nodesLoaded = false;
        $scope.user = $rootScope.setup.user;

        this.loadDataTop15();
      }
    ]
  });