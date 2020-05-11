'use strict';
angular.
  module('app').
  component('import', {
    templateUrl: 'app/components/import/import.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Nodes', '$location',
      function ImportController($http, $rootScope, $scope, $state, $stateParams, $window, Nodes, $location) {
        var self = this;
        this.type = $stateParams.type;
        $scope.import = {"data": null};

        this.prepareImport = function(){
            $scope.import = {'mapping': {}, 'data': [], 'header': []};
            for(var i in $rootScope.settings.content.entities){
                if($rootScope.settings.content.entities[i].type == this.type){
                    $scope.entity = $rootScope.settings.content.entities[i];
                }
            }
        }

        $scope.onPasteData = function(){
            var text = $scope.import.text.replace(/\r/g, '').trim('\n');
            var rowsOfText = text.split('\n');
            var header = [];
            var rows = [];
            rowsOfText.forEach(function(rowAsText) {
                // Remove wrapping double quotes
                var row = rowAsText.split('\t').map(function(colAsText) {
                    return colAsText.trim().replace(/^"(.*)"$/, '$1');
                });
                // The first row containing data is assumed to be the header
                if (header.length == 0) {
                    // Remove empty columns
                    while (row.length && !row[row.length-1].trim()) row.pop();
                    if (row.length == 0) return;
                    header = row;
                } else {
                    rows.push(row.slice(0, header.length));
                }
            });
            $scope.import.header = header;
            $scope.import.data = rows;
        }

        $scope.doImport = function(){
            var data = [];
            for(var i in $scope.import.data){
                var node = {'type': $scope.entity.type};
                if($scope.import.mapping['path']){ node.path = $scope.import.data[i][$scope.import.mapping['path']];}
                if($scope.import.mapping['title']){ node.title = $scope.import.data[i][$scope.import.mapping['title']];}
                if($scope.import.mapping['text']){ node.text = $scope.import.data[i][$scope.import.mapping['text']];}
                if($scope.import.mapping['imgUrl']){ node.imgUrl = $scope.import.data[i][$scope.import.mapping['imgUrl']];}
                for(var j in $scope.entity.data){
                    if($scope.import.mapping[$scope.entity.data[j].key]){
                        switch($scope.entity.data[j].type){
                            case "bool":
                                if(!$scope.import.data[i][$scope.import.mapping[$scope.entity.data[j].key]] || $scope.import.data[i][$scope.import.mapping[$scope.entity.data[j].key]].trim() == ""){
                                    node[$scope.entity.data[j].key] = false;
                                } else {
                                    node[$scope.entity.data[j].key] = true;
                                }
                            break;
                            case "enum":
                                for(var k in $scope.entity.data[j].options){
                                    if($scope.import.data[i][$scope.import.mapping[$scope.entity.data[j].key]].toLowerCase() == $scope.entity.data[j].options[k].toLowerCase()){
                                        node[$scope.entity.data[j].key] = $scope.entity.data[j].options[k];
                                    }
                                }
                                break;
                            default:
                                if($scope.import.data[i][$scope.import.mapping[$scope.entity.data[j].key]] && $scope.import.data[i][$scope.import.mapping[$scope.entity.data[j].key]].trim() != "") {
                                    node[$scope.entity.data[j].key] = $scope.import.data[i][$scope.import.mapping[$scope.entity.data[j].key]];
                                }
                        }

                    }
                }
                data.push(node);
            }
            console.log(data);
            Nodes.addNodes(data, function(result){
                $scope.import.result = result;
            });
        }

        $scope.resetData = function(){
            $scope.import.data = null;
        }

        this.prepareImport();

      }
    ]
  });