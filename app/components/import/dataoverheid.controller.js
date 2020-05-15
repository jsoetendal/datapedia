'use strict';
angular.
  module('app').
  component('dataoverheid', {
    templateUrl: 'app/components/import/dataoverheid.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Nodes', '$location',
      function DataoverheidController($http, $rootScope, $scope, $state, $stateParams, $window, Nodes, $location) {
        var self = this;

          this.loadDatasets = function(text, func){

              var url = $rootScope.APIBase + "data/overheid/" + text;
              $http({
                  method: 'GET',
                  url: url
              }).then(function(response) {
                  console.log(response);
                  if(response.status == 200){
                      if(response.data){
                          $scope.data = response.data;
                      }
                      if(func) func();
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                  } else {
                      alert("Mislukt om data op te halen bij data.overheid.nl");
                  }
              });
          }

          this.loadDataset = function(id, func){

              var url = $rootScope.APIBase + "data/overheidset/" + id;
              $http({
                  method: 'GET',
                  url: url
              }).then(function(response) {
                  console.log(response);
                  if(response.status == 200){
                      if(response.data){
                          $scope.set = response.data;
                      }
                      if(func) func();
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                  } else {
                      alert("Mislukt om data op te halen bij data.overheid.nl");
                  }
              });
          }

        $scope.searchOverheid = function(text){
            self.loadDatasets(text);
        }

        $scope.getSet = function(id){
            self.loadDataset(id);
        }

        $scope.clearSet = function(){
              $scope.set = null;
        }

          /**
           * Use dataset as a source to create a new node
           * @param dataset
           */
        $scope.copySet = function(dataset){
              var node = new Node({"type": "dataset"});
              node.title = dataset.title;
              node.text = dataset.notes;
              node.data = {
                  "details": {
                      "beschikbaar": 'true',
                      "online": {"waarde": 'true'},
                      "bron": {
                          "url": 'https://data.overheid.nl/data/api/3/action/package_show?id=' + dataset.id,
                          "update": 'true'
                      },
                      "licentie":
                          {
                              "type": dataset.license_title
                          },
                      "resources": []
                  }
              }
            if(dataset.identifier && dataset.identifier != ""){
                node.data.details.resources.push({'url': dataset.identifier});
            }
            if(dataset.url && dataset.url != ""){
                node.data.details.resources.push({'url': dataset.url});
            }
            for(var i in dataset.resources){
                node.data.details.resources.push({'url': dataset.resources[i].url, 'description': dataset.resources[i].name});
            }
            $rootScope.newNode = node;
              $state.go('node.new',{'type':'dataset'});
        }
      }
    ]
  });