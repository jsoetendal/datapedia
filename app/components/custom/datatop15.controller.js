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

              Nodes.loadNodes('gemeente', true, null, function () {
                  $scope.gemeentes = Nodes.getNodes();
                  Nodes.loadNodes('datatop15', false, null, function () {
                      $scope.dataitems = Nodes.getNodes();
                      self.prepareView();
                  });
              });
          }

          this.prepareView = function() {
              $scope.nodesLoaded = true;
              $rootScope.backgroundImgUrl = "app/images/cs.jpg";

              $scope.matrix = {};
              for(var i in $scope.gemeentes) {
                  if($scope.gemeentes[i].gemeente_datatop15) {
                      for (var j in $scope.gemeentes[i].gemeente_datatop15) {
                          if(!$scope.matrix[$scope.gemeentes[i].nodeId]) $scope.matrix[$scope.gemeentes[i].nodeId] = {};
                          if($scope.gemeentes[i].gemeente_datatop15[j].datarelation) {
                              $scope.matrix[$scope.gemeentes[i].nodeId][$scope.gemeentes[i].gemeente_datatop15[j].nodeId] =
                                  {
                                      'score': self.getScore($scope.gemeentes[i].gemeente_datatop15[j].datarelation.status),
                                      'label': $scope.gemeentes[i].gemeente_datatop15[j].datarelation.status
                                  }
                          }
                      }
                  }
              }
          }

          this.getScore = function (status) {
              switch (status) {
                  case "Compleet":
                      return 5;
                  case "Goed bezig":
                      return 4
                  case "Aan de slag":
                      return 3;
                  case "Orienterend":
                      return 2;
                  case "Nog niet gestart":
                      return 1;
                  case "Onbekend":
                  default:
                      return 0;
              }
              return 0;
          }

        $scope.orderProp = ["title"];
        $scope.filterProp = [];
        $scope.nodesLoaded = false;
        $scope.user = $rootScope.setup.user;

        this.loadDataTop15();
      }
    ]
  });