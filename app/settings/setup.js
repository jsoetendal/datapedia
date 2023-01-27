'use strict';
angular.
module('core.setup',['core.user']).
service('Setup', ['$rootScope', '$window', '$location', '$state', '$http', 'User', function($rootScope, $window, $location, $state, $http, User){

    this.doLogin = function(scope){
        var self = this;

        self.user.doLogin(scope, function(){
            var json = null;
            json = localStorage.getItem("returnToURL");
            if(json){
                localStorage.removeItem("returnToURL");
                var obj = JSON.parse(json);
                if(obj && obj.url && obj.time){
                    if((Date.now() - obj.time) / 1000 < 600){
                        //indien korter dan 10 min. geleden. Om te voorkomen dat URL blijft 'hangen' omdat de removeItem
                        $window.location.href = obj.url;
                    }
                }
            } else {
                if($state.current.name == "login"){
                    $state.go("start");
                } else {
                    $window.location.reload();
                }
            }
        });
    }

    this.doSignup = function(scope){
        var data = {
            email: scope.email,
            role: 'contributor',
            name: scope.name
        };

        $http({
            method: 'POST',
            url: $rootScope.APIBase + 'user/create/',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: data
        }).then(function(response) {
            if(response.status == 200){
                $("#melding").modal()
                $rootScope.melding = {"titel": "Account aangemaakt", "tekst": "Er is een account aangemaakt. Er is een e-mail gestuurd naar het opgegeven adres, waarmee je een wachtwoord kan aanmeken en inloggen."}
            }
        }).catch(function(fallback) {
            if(fallback.status == 406){
                $("#melding").modal()
                $rootScope.melding = {"titel": "E-mailadres al in gebruik", "tekst": "Er is al een account met dit e-mailadres. Gebruik 'Wachtwoord vergeten' om een nieuw wachtwoord aan te vragen."}
                return false;
            } else {
                log(fallback);
                $("#melding").modal()
                $rootScope.melding = {"titel": "Account aanmaken mislukt", "tekst": "Het is niet gelukt om een account aan te maken. Er is iets mis gegaan..."}
            }
        });

    }

    this.doChangePassword = function(scope, func, msg_element){
        this.user.changePassword(scope, func, msg_element);
    }

    this.doForgotPassword = function (scope, msg_element){
        this.user.forgotPassword(scope, msg_element);
    }

    this.doResetPassword = function (scope, msg_element){
        this.user.resetPassword(scope, msg_element);
    }

    this.setAccessToken = function(accesstoken){
        this.accesstoken = accesstoken;
    }

    this.initialize = function (regionTxt){
        var self = this;

        var fname = "local/settings.json";
        $http.get(fname).then(function(response) {
            if(response.data){
                $rootScope.settings = response.data;

                //Dependencies data vullen met data uit oorspronkelijke relation:
                for(let e in $rootScope.settings.content.entities){
                    for(let d in $rootScope.settings.content.entities[e].dependencies){
                        //
                        let relationkey = $rootScope.settings.content.entities[e].dependencies[d].key;
                        let type = $rootScope.settings.content.entities[e].dependencies[d].type;
                        for(let e2 in $rootScope.settings.content.entities){
                            if($rootScope.settings.content.entities[e2].type == type){
                                for(let r in $rootScope.settings.content.entities[e2].relations){
                                    if($rootScope.settings.content.entities[e2].relations[r].key == relationkey){
                                        $rootScope.settings.content.entities[e].dependencies[d].data = $rootScope.settings.content.entities[e2].relations[r].data;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        self.user = User;
        self.user.initialize();
    }

    this.signOut = function(){
        //Ook al gaat er ergens iets mis, bijv. met save, sowieso resetten
        try {
            this.user.signOut();
        } catch(err) {
            this.user.reset();
        }
    }

    this.reset = function(){
        this.user.reset();
    }

    this.getCurrentUser = function(){
        return this.user;
    }

    this.setDirty = function(type){
        this.user.setDirty(type);
    }

    this.saveDirty = function(){
        this.user.saveDirty();
    }

    this.refreshUser = function(func){
        this.user.refreshUser(func);
    }

    this.saveStateAfterRefresh = function(state, params){
        if(this.user && !this.user.authenticated){
            this.user.actionsAfterRefresh.push(function(){$state.go(state, params);})
        }
    }

    this.saveURLAfterLogin = function(url){
        var obj ={"url": url, "time": Date.now()};
        localStorage.setItem("returnToURL", JSON.stringify(obj));
    }
}]);