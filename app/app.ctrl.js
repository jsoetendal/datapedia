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
        $rootScope.GoogleMapsKey = window.__env.GoogleMapsKey;
        $rootScope.topHeader = "Smart Mobility";

        $rootScope.backgroundImgUrl = "https://smartmobilitymra.nl/wp-content/uploads/2019/07/Fietsfiles_Amsterdam_Centrum_3758.jpg";
        $rootScope.setup = Setup;
        $rootScope.setup.initialize();

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
        });


        //JS: hide modal-backdrop on click
        $(document).on('click', '#aside', function (e) {
          //console.log(e);
          hideOpenMenu();
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
