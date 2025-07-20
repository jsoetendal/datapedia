/**
 * @ngdoc function
 * @name app.controller:AppCtrl
 * @description
 * # MainCtrl
 * Controller of the app
 */

(function() {
    'use strict';

    angular
      .module('app')
      .controller('AppCtrl', AppCtrl);


      AppCtrl.$inject  = ['$scope', '$location', '$rootScope', '$timeout', '$window', '$http', '$state', 'Setup'];

      function AppCtrl($scope, $location, $rootScope, $timeout, $window, $http, $state, Setup) {

        $rootScope.environment = window.__env.environment;
        $rootScope.wwwBase = window.__env.wwwBase;
        $rootScope.APIBase = window.__env.APIBase;
        $rootScope.localfolder = window.__env.localfolder;
        $rootScope.GoogleMapsKey = window.__env.GoogleMapsKey;
        $rootScope.topHeader = "Smart Mobility";

        $rootScope.currentModule = parseInt(localStorage.getItem("currentModule"));
        $rootScope.backgroundImgUrl = $rootScope.localfolder + "background.jpg";
        $rootScope.setup = Setup;
        $rootScope.setup.initialize();

        $rootScope.regios = ['Noord', 'Noord-Holland & Flevoland', 'Oost', 'Utrecht', 'Zuid-Holland', 'Zeeland', 'Noord-Brabant', 'Limburg'];

        $scope.user = $rootScope.setup.user;


        $scope.doLogin = function(){
          $rootScope.setup.doLogin($scope);
        }


        $scope.goBack = function () {
          $window.history.back();
        };

        function getParams(name) {
          name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
          var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
              results = regex.exec(location.search);
          return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        $rootScope.$on('$stateChangeSuccess', function(event, state, params){
          $rootScope.state = {
            "name": state.name,
            "params": params
          }
          $('html,body').scrollTop(0); //Scroll to top of new page
        });

          //ui-nav.js:
        $(document).on('click', '[ui-nav] a', function (e) {
          var $this = $(e.target), $active, $li;
          $this.is('a') || ($this = $this.closest('a'));

          $li = $this.parent();
          $active = $li.siblings( ".active" );
          $li.toggleClass('active');
          $active.removeClass('active');
        });

        angular.element($window).bind("scroll", function() {
          $scope.$apply($scope.scrolledDown = this.pageYOffset > 10 ? true : false);
        });
      }
})();
