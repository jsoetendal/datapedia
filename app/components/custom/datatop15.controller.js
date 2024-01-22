'use strict';
angular.
  module('app').
  component('datatop15', {
    templateUrl: 'app/components/custom/datatop15.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', '$timeout','Nodes', '$location',
      function NodesController($http, $rootScope, $scope, $state, $stateParams, $window, $timeout, Nodes, $location) {
        var self = this;
        this.facetsCreated = false;

        $scope.regios = $rootScope.regios;

          $scope.geoShow =  function(node){
              //node is hier een gemeente. vertalen naar de desbetreffende node
              for(let i in $scope.nodes){
                  if($scope.nodes[i].nodeId == node.nodeId) $scope.$parent.$parent.geoShow($scope.nodes[i]);
              }
          }

          $scope.geoHide =  function(node){
              //node is hier een gemeente. vertalen naar de desbetreffende node
              for(let i in $scope.nodes){
                  if($scope.nodes[i].nodeId == node.nodeId) $scope.$parent.$parent.geoHide($scope.nodes[i]);
              }
          }

          this.loadDataTop15 = function() {
              $scope.nodes = $scope.$parent.$parent.nodes;
              $scope.loaded = false;
              $scope.multipleTypes = false;

              Nodes.loadNodes('gemeente', true, null, function () {
                  $scope.gemeentes = Nodes.getNodes();
                  Nodes.loadNodes('datatop15', false, null, function () {
                      $scope.dataitems = Nodes.getNodes();
                      self.prepareView();
                      $scope.updateMap();
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
                                      'label': $scope.gemeentes[i].gemeente_datatop15[j].datarelation.status,
                                      'toelichting': $scope.gemeentes[i].gemeente_datatop15[j].datarelation.toelichting
                                  }
                          }
                      }
                  }
              }
          }

          this.getScore = function (status) {
              switch (status) {
                  case "Compleet":
                  case "5 - Compleet":
                      return 5;
                  case "Goed bezig":
                  case "4 - Goed bezig":
                      return 4
                  case "Aan de slag":
                  case "3 - Aan de slag":
                      return 3;
                  case "Orienterend":
                  case "2 - Orienterend":
                      return 2;
                  case "Nog niet gestart":
                  case "1 - Nog niet gestart":
                      return 1;
                  case "0 - Onbekend":
                  case "Onbekend":
                  default:
                      return 0;
              }
              return 0;
          }

          $scope.setRegio = function(regio){
              $scope.current.regio = regio;
              $scope.$parent.$parent.saveCurrent();
              $scope.updateMap();
          }

          $scope.setItem = function(item){
              $scope.current.item = {title: item.title, nodeId: item.nodeId};
              $scope.$parent.$parent.saveCurrent();
              $scope.showItems = false;
              $scope.updateMap();
          }

          $scope.updateMap = function(force){
              $scope.pdokMap = $scope.$parent.$parent.pdokMap
              if(!$scope.pdokMap){
                  $timeout(function(){ $scope.updateMap();}, 500); //If no map, try again...
              } else {
                  for(let i in $scope.nodes){
                      if($scope.nodes[i].data.geometry) {
                          if (!$scope.current.regio || $scope.current.regio == $scope.nodes[i].data["regio"]) {
                              //Node should be shown
                              if(!$scope.nodes[i].layer){
                                  //Layer is not present yet, create it
                                  var json = JSON.parse($scope.nodes[i].data.geometry.replace(/&#34;/g, "\""));
                                  let tooltip =" <div class=\"details\">\n" +
                                      "<strong>" + $scope.nodes[i].title + "</strong>";
                                  if($scope.matrix[$scope.nodes[i].nodeId] && $scope.matrix[$scope.nodes[i].nodeId][$scope.current.item.nodeId]) {
                                      tooltip += "<br/>" + $scope.current.item.title + ":<br/>" + $scope.matrix[$scope.nodes[i].nodeId][$scope.current.item.nodeId].label;
                                  }
                                  tooltip += " </div>";
                                  $scope.nodes[i].layer = L.geoJSON(json).bindTooltip(tooltip,{
                                      permanent: false,
                                      sticky: true,
                                      offset: [10, 0],
                                      opacity: 0.75,
                                      className: 'leaflet-tooltip-own'
                                  }).addTo($scope.pdokMap);
                                  $scope.nodes[i].layer.on("click", function (e) {
                                      $state.go("module.node",{"nodeId": $scope.nodes[i].nodeId});
                                  });
                                  $scope.nodes[i].layer.setStyle({
                                      'fillColor': "#FFFFFF",
                                      'fillOpacity': '0.7', 'stroke': true, 'color': '#777', 'weight': 1, 'opacity': 1
                                  });
                              }
                              if($scope.nodes[i].layer){
                                  //If layer available now, set right color
                                  let fillColor = "#FFFFFF";
                                  let currentScore = 0;
                                  if($scope.matrix[$scope.nodes[i].nodeId] && $scope.matrix[$scope.nodes[i].nodeId][$scope.current.item.nodeId]) {
                                      switch(parseInt($scope.matrix[$scope.nodes[i].nodeId][$scope.current.item.nodeId].score)){
                                          case 5:
                                              fillColor = "rgb(37,52,148)";
                                              break;
                                          case 4:
                                              fillColor = "rgb(44,127,184)";
                                              break;
                                          case 3:
                                              fillColor = "rgb(65,182,196)";
                                              break;
                                          case 2:
                                              fillColor = "rgb(161,218,180)";
                                              break;
                                          case 1:
                                              fillColor = "rgb(255,255,204)";
                                              break;
                                          default:
                                              fillColor = "rgb(244,244,244)";
                                              break;
                                      }
                                  }
                                  $scope.nodes[i].layer.setStyle({
                                      'fillColor': fillColor,
                                      'fillOpacity': '0.7', 'stroke': true, 'color': '#777', 'weight': 1, 'opacity': 1
                                  });
                                  let tooltip =" <div class=\"details\">\n<small>" +$scope.current.item.title + "<br/></small>"+
                                      "<strong style='font-size: 140%'>" + $scope.nodes[i].title + "</strong>";
                                  if($scope.matrix[$scope.nodes[i].nodeId] && $scope.matrix[$scope.nodes[i].nodeId][$scope.current.item.nodeId]) {
                                      tooltip += "<br/><strong>" + $scope.matrix[$scope.nodes[i].nodeId][$scope.current.item.nodeId].label + "</strong>";
                                  } else {
                                      tooltip += "<br/>Onbekend";
                                  }
                                  tooltip += " </div>";
                                  $scope.nodes[i].layer.unbindTooltip();
                                  $scope.nodes[i].layer.bindTooltip(tooltip,{
                                      permanent: false,
                                      sticky: true,
                                      offset: [10, 0],
                                      opacity: 0.75,
                                      className: 'leaflet-tooltip-own'
                                  });
                              }
                          } else {
                              //Node should not be shown
                              if($scope.nodes[i].layer){
                                  $scope.nodes[i].layer.remove();
                                  delete $scope.nodes[i].layer;
                              }
                          }

                      }
                  }

                  //Update currentScore for gemeentes
                  for(let i in $scope.gemeentes){
                      if($scope.matrix[$scope.gemeentes[i].nodeId] && $scope.matrix[$scope.gemeentes[i].nodeId][$scope.current.item.nodeId]){
                          $scope.gemeentes[i].currentScore = parseInt($scope.matrix[$scope.gemeentes[i].nodeId][$scope.current.item.nodeId].score);
                      } else {
                          $scope.gemeentes[i].currentScore = 0;
                      }
                  }

                  //Set bounds:
                  const allLayers = [];
                  $scope.pdokMap.eachLayer(function (layer) {
                      if(layer.feature) { //If it is a feature
                          allLayers.push(layer);
                      }
                  });

                  if(allLayers.length > 0) {
                      var all = new L.featureGroup(allLayers);
                      $scope.pdokMap.fitBounds(all.getBounds());
                  }
                  $timeout(function(){
                      $scope.pdokMap.invalidateSize(false);
                  }, 500);
              }
          }

          this.outputDownload = function(blobData, filename, type){
              var blob = new Blob([blobData], { type: type });
              if (navigator.msSaveBlob) { // IE 10+
                  navigator.msSaveBlob(blob, filename);
              } else {
                  var link = document.createElement("a");
                  if (link.download !== undefined) { // feature detection
                      // Browsers that support HTML5 download attribute
                      var url = URL.createObjectURL(blob);
                      link.setAttribute("href", url);
                      link.setAttribute("download", filename);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                  }
              }
          }

          $scope.downloadGeoJSON = function(){
            let geoJSON =
                {
                    "type": "FeatureCollection",
                    "features": []
                };
            for(let i in $scope.gemeentes){
                if($scope.gemeentes[i].data && $scope.gemeentes[i].data.geometry) {
                    console.log($scope.gemeentes[i].data.geometry);
                    let feature = {
                        "type": "Feature",
                        "geometry": JSON.parse($scope.gemeentes[i].data.geometry.replace(/&#34;/g, "\"")),
                        "properties": {
                            "title": $scope.gemeentes[i].title,
                            "regio": $scope.gemeentes[i].data.regio
                        }
                    }
                    if($scope.gemeentes[i].gemeente_datatop15){
                        for(let j in $scope.gemeentes[i].gemeente_datatop15){
                            if($scope.gemeentes[i].gemeente_datatop15[j].title && $scope.gemeentes[i].gemeente_datatop15[j].datarelation && $scope.gemeentes[i].gemeente_datatop15[j].datarelation.status) {
                                feature.properties[$scope.gemeentes[i].gemeente_datatop15[j].title] = $scope.gemeentes[i].gemeente_datatop15[j].datarelation.status;
                            }
                        }
                    }
                    geoJSON.features.push(feature);
                }
            }
            var utc = new Date().toJSON();
            var filename = "Datapedia Wegbeheerders Statusoverzicht " + utc + ".json";
            self.outputDownload(JSON.stringify(geoJSON), filename,"text/json;charset=utf-8;'");
          }


          $scope.downloadCSV = function(){
              let data = [];

              for(let i in $scope.gemeentes){
                  if($scope.gemeentes[i].data) {
                      let item = {
                          "Wegbeheerder": $scope.gemeentes[i].title,
                          "Regio": $scope.gemeentes[i].data.regio
                      }

                      for(let j in $scope.dataitems){
                          item[$scope.dataitems[j].title] = 0;
                          if($scope.gemeentes[i].gemeente_datatop15){
                              for(let k in $scope.gemeentes[i].gemeente_datatop15){
                                  if($scope.gemeentes[i].gemeente_datatop15[k].nodeId == $scope.dataitems[j].nodeId && $scope.gemeentes[i].gemeente_datatop15[k].datarelation){
                                      item[$scope.dataitems[j].title] = $scope.gemeentes[i].gemeente_datatop15[k].datarelation.status;
                                  }
                              }
                          }
                      }
                      data.push(item);
                  }
              }

              const titleKeys = Object.keys(data[0])
              const refinedData = []
              refinedData.push(titleKeys)
              data.forEach(item => {
                  refinedData.push(Object.values(item))
              });
              let csvContent = ''
              refinedData.forEach(row => {
                  csvContent += row.join(';') + '\n'
              });

              var utc = new Date().toJSON();
              var filename = "Datapedia Wegbeheerders Statusoverzicht " + utc + ".csv";
              self.outputDownload(csvContent, filename,"text/csv;charset=utf-8;'");
          }

          $scope.module = $rootScope.module;
          $scope.zoeken = $scope.$parent.$parent.zoeken;
          $scope.current = $scope.$parent.$parent.current;
          $scope.loadPDOK = $scope.$parent.$parent.loadPDOK;

          if(!$scope.current.item){
              $scope.current.item = {title: '01. Geplande wegwerkzaamheden', nodeId: 555}
          }

          if(!$scope.current.regio) {
              $scope.setRegio("Noord-Holland & Flevoland");
          }

        $scope.orderProp = ['-currentScore', 'title'];
        $scope.filterProp = [];
        $scope.nodesLoaded = false;
        $scope.user = $rootScope.setup.user;

        this.loadDataTop15();
      }
    ]
  });