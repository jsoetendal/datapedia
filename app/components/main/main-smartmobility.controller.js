'use strict';
angular.
  module('app').
  component('main', {
    templateUrl: 'app/components/main/main.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Nodes', '$location',
      function ImportController($http, $rootScope, $scope, $state, $stateParams, $window, Nodes, $location) {
        var self = this;

        this.start = function() {
          $rootScope.backgroundImgUrl = "app/images/fietsfile.jpg";

          if (window.localStorage.getItem("visited")) {
            $scope.meerinfo = false;
          } else {
            window.localStorage.setItem("visited", "true");
            $scope.meerinfo = true;
          }
          this.laadVoorbeelden();
          this.laadData();
        }

        this.laadVoorbeelden = function(){
          Nodes.loadNodes("project", false, null, function () {
            var nodes = Nodes.getNodes();
            $scope.voorbeelden = [];
            while($scope.voorbeelden.length < 3){
              var i = Math.round(Math.random() * nodes.length);
              var slice = nodes.slice(i,i+1);
              $scope.voorbeelden.push(slice[0]); // Add a random element from nodes
              nodes.splice(i,1); //Remove selected element from origing
            }
          });
        }

        this.laadData = function(){
          Nodes.loadNodes("onderwerp", false, null, function () {
            $scope.nodes = Nodes.getNodes();
            Nodes.createTree(function(tree){
              $scope.tree = tree;
            });
            $scope.nodesLoaded = true;
          });
          $scope.view = "tree";
        }


        $scope.naarZoeken = function(q){
          $state.go("module.nodes.query",{"type": "zoeken", "q": q});
        }






        this.start();
      }
    ]
  });