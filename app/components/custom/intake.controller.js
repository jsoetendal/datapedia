'use strict';
angular.
  module('app').
  component('intake', {
    templateUrl: 'app/components/custom/intake.view.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Nodes', '$location', '$sce',
      function IntakeController($http, $rootScope, $scope, $state, $stateParams, $window, Nodes, $location, $sce) {
        var self = this;

        this.laadData = function() {
          $scope.node = $scope.$parent.$parent.node;

          Nodes.loadNodes("datatop15", true, null, function () {
            //De Datatop-15 items ophalen
            $scope.items = Nodes.getNodes();

            //Ze één voor één doorlopen en a) de huidige status ophalen uit de relatie en b) uit de gekoppelde 'artikelen'-items de status ophalen.
            for (var i in $scope.items) {

              var currentstatus = '';
              var currentData = null;
              //a) uit de relaties van de gemeente-node de huidige status ophalen van dit item
              for (var j in $scope.node.relations.gemeente_datatop15) {
                if ($scope.node.relations.gemeente_datatop15[j].targetId == $scope.items[i].nodeId) {
                  if ($scope.node.relations.gemeente_datatop15[j].datarelation) {
                    currentstatus = $scope.node.relations.gemeente_datatop15[j].datarelation.status;
                    currentData =  $scope.node.relations.gemeente_datatop15[j].datarelation;
                  }
                }
              }

              $scope.items[i].status = {"intro": null, "inventarisatie": null, "img": null, "stappen": [], "data": currentData, "currentScore": 0,"currentText": currentstatus};
              if(currentstatus) {
                switch (currentstatus.toLowerCase().trim()) {
                  case "orienterend":
                    $scope.items[i].status.currentScore = 1;
                    break;
                  case "aan de slag":
                    $scope.items[i].status.currentScore = 2;
                    break;
                  case "goed bezig":
                    $scope.items[i].status.currentScore = 3;
                    break;
                  case "compleet":
                    $scope.items[i].status.currentScore = 4;
                    break;
                }
              }

              //b) uit de geextende aanpak-node de mogelijke status ophalen
              for (var j in $scope.items[i].datatop15_handboek) {
                var html = $sce.trustAsHtml($scope.items[i].datatop15_handboek[j].text);
                var elem = document.createElement("DIV");   // Create a <button> element
                elem.innerHTML = html.toString();
                var statuses = elem.querySelectorAll("div.status-handboek");
                for (var k in statuses) {
                  if (statuses[k].className) {
                    var s = {
                      "text": statuses[k].innerHTML,
                      "score": 0,
                    };
                    if (statuses[k].className.indexOf("q1-5") > -1) {
                      s.value = "Orienterend"
                      s.score = 1;
                    }
                    if (statuses[k].className.indexOf("q2-5") > -1) {
                      s.value = "Aan de slag"
                      s.score = 2;
                    }
                    if (statuses[k].className.indexOf("q3-5") > -1) {
                      s.value = "Goed bezig"
                      s.score = 3;
                    }
                    if (statuses[k].className.indexOf("q4-5") > -1) {
                      s.value = "Compleet"
                      s.score = 4;
                    }
                    $scope.items[i].status.stappen.push(s);
                  }
                }

                var intro = elem.querySelectorAll("div.intro");
                if(intro && intro[0] && intro[0].innerHTML) $scope.items[i].status.intro = intro[0].innerHTML;

                var inventarisatie = elem.querySelectorAll("div.inventarisatie");
                if(inventarisatie && inventarisatie[0] && inventarisatie[0].innerHTML) $scope.items[i].status.inventarisatie = inventarisatie[0].innerHTML;

                $scope.items[i].status.img = $scope.items[i].datatop15_handboek[j].imgUrl;
              }
            }

            $scope.currentNum = 0;
            $scope.item = $scope.items[$scope.currentNum];
          });
        }

        $scope.nextItem = function(){
          $scope.saveItem();
          $scope.currentNum += 1;
          $scope.item = $scope.items[$scope.currentNum];
          $('html, body').animate({scrollTop: 0}, 'fast');
        }

        $scope.prevItem = function(){
          $scope.saveItem();
          $scope.currentNum -= 1;
          $scope.item = $scope.items[$scope.currentNum];
          $('html, body').animate({scrollTop: 0}, 'fast');
        }

        $scope.lastItem = function(){
          $scope.saveItem();
          $state.go("node.tab",{nodeId: $scope.node.nodeId, tab: "details"});
        }

        $scope.saveItem = function(){
          //console.log($scope.item);
          Nodes.setRelationData($scope.node.nodeId, "gemeente_datatop15", $scope.item.nodeId, $scope.item.status.data);
        }

        $scope.user = $rootScope.setup.user;
        this.laadData();

      }
    ]
  });