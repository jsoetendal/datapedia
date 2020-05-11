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


      AppCtrl.$inject  = ['$scope', '$location', '$rootScope', '$timeout', '$window', '$http'];

      function AppCtrl($scope, $location, $rootScope, $timeout, $window, $http) {

        $rootScope.APIBase = "http://localhost/datapedia/api/public/";
        $rootScope.topHeader = "Smart Mobility";

        var fname = "app/settings.json";
        $http.get(fname).then(function(response) {
          if(response.data){
            $rootScope.settings = response.data;
            console.log($rootScope.settings)
          }
        });

        $scope.goBack = function () {
          $window.history.back();
        };

        function getParams(name) {
          name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
          var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
              results = regex.exec(location.search);
          return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        $rootScope.$on('$stateChangeSuccess', hideOpenMenu);

        function hideOpenMenu() {
          // hide open menu
          //$('#aside').modal('hide');
          //$('body').removeClass('modal-open').find('.modal-backdrop').remove();
          //$('.navbar-toggleable-sm').collapse('hide');
        };

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
      }
})();
