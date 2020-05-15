/**
 * @ngdoc overview
 * @name app
 * @description
 * # app
 *
 * Main module of the application.
 */
(function() {
    'use strict';
    angular
      .module('app', [
          'ngRoute',
          'ngSanitize',
          'ui.router',
          'core']);

})();