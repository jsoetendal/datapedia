'use strict';
angular.
module('core.users',[]).
service('Users',  ['$http', '$rootScope',
    function Users($http, $rootScope){
        var self = this;
        var users = [];
        var user = null;

        this.loadUsers = function(func){
            var self = this;

            var url = $rootScope.APIBase + "users/";
            $http({
                method: 'GET',
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                }
            }).then(function(response) {
                log(response);
                if(response.status == 200){
                    self.users = [];
                    if(response.data){
                        var data = response.data;
                        for(var i in data){
                            self.users.push(new User(data[i]));
                        }
                    }
                    if(func) func();
                } else {
                    log(response);
                }
            }).catch(function(fallback) {
                log(fallback);
                if(fallback.status == 401){
                    //Refresh needed
                    $rootScope.setup.user.refreshUser(function(){
                        self.loadUsers(func);
                    });
                } else {
                    alert("Mislukt om users op te halen");
                }
            });
        }

        this.getUsers = function(){
            return this.users;
        }

        /*
        this.loadUser = function(userId, func){
            var self = this;

            var url = $rootScope.APIBase + "user/" + userId;
            $http({
                method: 'GET',
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                },
            }).then(function(response) {
                log(response);
                if(response.status == 200){
                    if(response.data){
                        self.user = new User(response.data);
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
                    alert("Mislukt om user "+ userId +" op te halen");
                }
            });
        }
         */

        this.getUser = function(){
            return this.user;
        }

        this.addUser = function(data, func){
            var url = $rootScope.APIBase + "user/add/";
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
                    if(response.data){
                        var newId = response.data.id;
                        console.log(newId);
                        if(func) func(newId);
                    }
                } else {
                    log(response);
                }
            }).catch(function(fallback) {
                log(fallback);
                if(fallback.status == 401){
                    //Refresh needed
                    $rootScope.setup.user.refreshUser(function(){
                        self.addUser(data,func);
                    });
                } else {
                    alert("Mislukt om user toe te voegen");
                }
            });
        }

        this.editUser = function(data, func){
            var url = $rootScope.APIBase + "user/edit/";
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
                        self.editUser(data,func);
                    });
                } else {
                    alert("Mislukt om user te wijzigen");
                }
            });
        }

        this.deleteUser = function(userId, func){
            var url = $rootScope.APIBase + "user/delete/" + userId;
            $http({
                method: 'GET',
                url: url,
                headers: {
                    'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                },
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
                        self.deleteUser(userId, func);
                    });
                } else {
                    alert("Mislukt om user te verwijderen");
                }
            });
        }
    }]
);
