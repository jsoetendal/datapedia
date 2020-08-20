'use strict';
angular.
module('app').
component('users', {
    templateUrl: 'app/components/users/users.template.html',
    controller: ['$http', '$rootScope', '$scope', '$state', '$stateParams', '$window', 'Users', '$location',
        function UsersController($http, $rootScope, $scope, $state, $stateParams, $window, Users, $location) {
            var self = this;
            $scope.zoeken = {};
            this.user = $rootScope.setup.user;

            this.loadUsers = function() {
                $scope.users = [];
                $scope.loaded = false;

                Users.loadUsers(function () {
                    $scope.users =Users.getUsers();
                });

            }

            this.reloadUsers = function(){
                this.loadUsers();
            }

            this.createUser = function(email, role, name, func){
                var self = this;

                if(!email || typeof email == "undefined"){
                    $scope.errormsg = "Er is iets mis gegaan. Geen gegevens ontvangen.";
                    return false;
                } else {
                    $scope.errormsg = null;
                    $scope.infomsg = "De aanvraag wordt verzonden... (even geduld aub)"

                    var data = {
                        email: email,
                        role: role,
                        name: name
                    };

                    $http({
                        method: 'POST',
                        url: $rootScope.APIBase + 'user/create/',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Authorization': 'Bearer ' + self.user.auth.accesstoken
                        },
                        data: data
                    }).then(function(response) {
                        if(response.status == 200){
                            $scope.errormsg = "";
                            $scope.infomsg = "";
                            self.reloadUsers();
                            if(func) func();
                            return true;
                        }
                    }).catch(function(fallback) {
                        if(fallback.status == 401){
                            //Refresh needed
                            self.user.refreshUser(function(){
                                self.createUser(email, role, name, func);
                            });
                        } else if(fallback.status == 406){
                            $scope.errormsg = fallback.data.msg;
                            $scope.infomsg = "Pas de gegevens aan en probeer opnieuw."
                            return false;
                        } else {
                            log(fallback);
                            $("#melding").modal()
                            $rootScope.melding = {"titel": "Aanmaken mislukt", "tekst": "Het is niet gelukt om de gebruiker aan te maken."}
                        }
                    });
                }
            }

            $scope.createUser = function(){
                console.log($scope);
                self.createUser($scope.new_user.email, $scope.new_user.role, $scope.new_user.name, function(){
                    $scope.new_user.email = "";
                    $scope.new_user.name = "";
                    $scope.new_user.role = "contributor";
                });
            }

            this.editUser = function(user, password1, password2){
                var self = this;

                $scope.errormsg = "";
                $scope.infomsg = "";

                if(password1 != password2 && (password1 || password2)){
                    $scope.errormsg = "De ingevulde wachtwoorden komen niet overeen.";
                    return false;
                } else {
                    $scope.errormsg = null;
                    $scope.infomsg = "De wijzigingen zijn verzonden...";

                    var data = {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        name: user.name
                    }
                    if(password1 != ""){
                        data.password = password1;
                    }
                    $http({
                        method: 'POST',
                        url: $rootScope.APIBase + 'user/edit/',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Authorization': 'Bearer ' + self.user.auth.accesstoken
                        },
                        data: data
                    }).then(function(response) {
                        if(response.status == 200){
                            $scope.errormsg = "";
                            $scope.infomsg = "Wijzigingen opgeslagen!";
                            $window.location.reload();
                            return true;
                        }
                    }).catch(function(fallback) {
                        if(fallback.status == 401){
                            //Refresh needed
                            self.user.refreshUser(function(){
                                self.editUser(client, password1, password2);
                            });
                        } else if(fallback.status == 406){
                            $scope.infomsg = "";
                            scope.errormsg = fallback.data.msg;
                            return false;
                        } else {
                            log(fallback);
                            $scope.infomsg = "Er is iets misgegaan...";
                            $scope.errormsg = fallback.data.message;
                            //alert("Wijzigen user mislukt... [TODO: Nette weergave]");
                            $("#melding").modal()
                            $rootScope.melding = {"titel": "Wijzigen gebruiker mislukt", "tekst": "Het is niet gelukt om de gebruiker te wijzigen."}

                        }
                    });
                }
            }

            $scope.editUser = function(user, password1, password2){
                self.editUser(user, password1, password2);
            }

            $scope.selectUser = function(user){
                $scope.currentUser = user;
            }

            $scope.new_user = {"role": "contributor"};
            this.loadUsers();

        }
    ]
});