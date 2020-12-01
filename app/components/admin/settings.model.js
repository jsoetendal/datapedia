'use strict';
angular.
  module('core.settings',[]).
  service('Settings',  ['$http', '$rootScope',
      function Settings($http, $rootScope){
      var self = this;
      var nodes = [];
      var node = null;

          this.loadSettings = function(func){
              var self = this;
              var url = $rootScope.APIBase + "settings/";
              $http({
                  method: 'GET',
                  url: url,
                  headers: {
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  }
              }).then(function(response) {
                  log(response);
                  if(response.status == 200){
                      func(response.data);
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.loadSettings(func);
                      });
                  } else {
                      alert("Mislukt om settings op te halen");
                  }
              });
          }

          this.processSettings = function(data){
              for(var i in data.content.entities){
                  //Remove empty path
                  if(data.content.entities[i].path && data.content.entities[i].path.label && data.content.entities[i].path.label.trim() == ""){
                      data.content.entities[i].path = false;
                  }
              }
              return data;
          }


          this.saveSettings = function(data, func){
              var url = $rootScope.APIBase + "settings/";
              data = this.processSettings(data);

              $http({
                  method: 'POST',
                  url: url,
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  },
                  data: data
              }).then(function(response) {
                  if(response.status == 200){
                      if(func) func();
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.saveSettings(data, func);
                      });
                  } else {
                      alert("Mislukt om settings op te slaan");
                  }
              });
          }

          this.getEntityCount = function(func){
              var self = this;
              var url = $rootScope.APIBase + "entities/count/";
              $http({
                  method: 'GET',
                  url: url,
                  headers: {
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  }
              }).then(function(response) {
                  log(response);
                  if(response.status == 200){
                      func(response.data);
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.getEntityCount(func);
                      });
                  } else {
                      alert("Mislukt om entity count op te halen");
                  }
              });
          }


      }]
);
