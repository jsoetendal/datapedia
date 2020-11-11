'use strict';
angular.
module('core.user',[]).
service('User', ['$rootScope', '$http', '$timeout', '$window', '$location','$state', function($rootScope, $http, $timeout, $window, $location, $state){

        this.doLogin = function(scope, func){
            var self = this;
            $http({
                method: 'POST',
                url: $rootScope.APIBase + 'user/auth/',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                data: {
                    email: scope.email,
                    password: scope.password,
                    refresh: scope.refresh
                }
            }).then(function(response) {
                log(response);
                if(response.status == 200){
                    self.setUser(response.data, func);
                }
            }).catch(function(fallback) {
                log(fallback);
                self.reset();
                $window.location.href = $rootScope.wwwBase + "/login";
                $("#melding").modal()
                if(fallback.data && fallback.data.msg){
                    var msg = fallback.data.msg;
                } else {
                    var msg = "Er ging iets mis bij het inloggen";
                }
                $rootScope.melding = {"titel": "Inloggen mislukt", "tekst": msg}
            });
        }

        this.setUser = function(userdata, func){
            log(userdata);
            this.auth = {
                authenticated: true,
                accesstoken: userdata.accesstoken,
                id: userdata.user.id,
                email: userdata.user.email,
                role: userdata.user.role
            }
            this.name = userdata.name;
            if(userdata.refreshtoken){
                this.auth.refreshtoken = userdata.refreshtoken;
            }

            this.setRoles();
            $rootScope.setup.setAccessToken(this.auth.accesstoken);

            this.saveLS('userAuth', this.auth);
            log("Load userdata from database...")
            this.loadUserFromDB(func);
        }

        this.refreshUser = function(func){
            var self = this;
            log("Refreshing user");
            log(self.auth);
            if(self.auth.refreshtoken && !self.waitingForRefresh){
                var decoded = jwt_decode(self.auth.refreshtoken);
                if(Date.now()/1000 <= decoded.exp){
                    self.waitingForRefresh = true;
                    $http({
                        method: 'POST',
                        url: $rootScope.APIBase + 'user/refresh/',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        data: {
                            email: self.auth.email,
                            refreshtoken: self.auth.refreshtoken
                        }
                    }).then(function(response) {
                        self.waitingForRefresh = false;
                        if(response.status == 200){
                            self.setUser(response.data, func);
                            self.doActionsAfterRefresh();
                        }
                    }).catch(function(fallback) {
                        self.waitingForRefresh = false;
                        $rootScope.setup.reset();
                        log(fallback);
                        log("Logging out...");
                        $window.location.href = $rootScope.wwwBase;
                    });
                } else {
                    //Refreshtoken expired
                    $rootScope.setup.reset();
                }
            } else if(self.waitingForRefresh){
                //Awaiting previously refresh
                self.actionsAfterRefresh.push(func);
                log("Waiting for first refresh to finish")
            } else {
                $rootScope.setup.reset();
                //No token available for refresh. Logging out...
                log(self.auth);
                log("Logging out...");
                log($rootScope.wwwBase);
                $window.location.href = $rootScope.wwwBase;
            }
        }

        this.setRoles = function(){
            this.isAdmin = false;
            this.isEditor = false;
            this.isEditorOrUp = false;
            this.isContributor = false;
            this.isContributorOrUp = false;
            switch(this.auth.role){
                case "admin":
                    this.isAdmin = true;
                    this.isEditorOrUp = true;
                    this.isContributorOrUp = true;
                    break;
                case "editor":
                    this.isEditor = true;
                    this.isEditorOrUp = true;
                    this.isContributorOrUp = true;
                    break;
                case "contributor":
                    this.isContributor = true;
                    this.isContributorOrUp = true;
                    break;
            }
        }

        this.doActionsAfterRefresh = function(){
            for(var i in this.actionsAfterRefresh){
                this.actionsAfterRefresh[i]();
            }
            this.actionsAfterRefresh = [];
        }

        this.hasActionsAfterRefresh = function(){
            if(!this.actionsAfterRefresh) return false;
            return this.actionsAfterRefresh.length > 0;
        }

        this.removeUserFromLS = function(){
            localStorage.removeItem("userAuth");
        }

        this.reset = function(){
            log("Reset user");
            this.removeUserFromLS();
            this.auth = {};
            this.view = {};
        }

        this.signOut = function(){
            this.saveAll();
            this.reset();
        }

        this.setDirty = function(key){
            var self = this;
            self.dirty[key] = true;
        }

        this.saveDirty = function(){
            var self = this;
            this.saveUser(self.dirty);
        }

        this.clearDirty = function(){
            this.dirty = {
                //personalia: false,
                view: false
            }
        }

        this.saveAll = function(){
            this.saveUser({
                //personalia: true,
                view: true
            })
        }

        this.saveUser = function(dirty, func){
            return null;
            var self = this;
            var data = {};
            var doSave = false;

            if(dirty && this.auth && this.auth.authenticated){
                if(dirty.view && self.view){
                    var viewJSON = JSON.stringify(self.view);
                    if(viewJSON){
                        data.view = viewJSON;
                        localStorage.setItem('userView', viewJSON);
                        doSave = true;
                    }
                }

                if(doSave){
                    log("Saving User:");
                    log(data);
                    $http({
                        method: 'POST',
                        url: $rootScope.APIBase + 'user/save/',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Authorization': 'Bearer ' + self.auth.accesstoken
                        },
                        data: data
                    }).then(function(response) {
                        if(response.status == 200){
                            self.lastsave = response.data.lastsave;
                            log("Saved User:");
                            log(response);
                            if(func){ func()};
                        }
                    }).catch(function(fallback) {
                        log(fallback);
                        if(fallback.status == 401){
                            //Refresh needed
                            self.refreshUser(function(){
                                self.saveUser(dirty, func);
                            }, true);
                        } else {
                            //alert("Mislukt om te schrijven naar de database... [TODO: Nette weergave]");
                        }
                    });
                } else {
                    if(func){ func()};
                }

            }
            self.clearDirty();
        }


        this.loadUserFromDB = function(func){
            var self = this;

            $http({
                method: 'GET',
                url: $rootScope.APIBase + 'user/load/',
                headers: {
                    'X-Authorization': 'Bearer ' + self.auth.accesstoken
                }
            }).then(function(response) {
                log(response);
                if(response.status == 200){
                    self.name = response.data.user.name;
                    //Save other data for later reference or for loading client
                    self.userdata = response.data.user;

                    self.saveLS('userName', self.name)

                    self.clearDirty();

                    if(func){ func(); }
                } else {
                    log(response);
                }
            }).catch(function(fallback) {
                log(fallback);
                if(fallback.status == 401){
                    //Refresh needed
                    self.refreshUser(function(){
                        log("User succesfully refreshed to load Userdata");
                        self.loadUserFromDB(func);
                    });
                } else {
                    //alert("Mislukt om usergegevens op te halen uit database");
                }
            });
        }


        this.changePassword = function(values, func, msg_element){
            var self = this;
            //console.log(self);
            if(values.new_password1 != values.new_password2){
                msg_element.text = "De twee nieuwe wachtwoorden komen niet overeen.";
            } else if(values.new_password1.toString() == ""){
                msg_element.text = "Je dient een nieuw wachtwoord in te vullen.";
            } else {
                msg_element.text = "Aanvraag wachtwoord wijzigen verzonden...";
                var data = {
                    id: self.auth.id,
                    current_password: values.current_password,
                    new_password: values.new_password1
                }

                $http({
                    method: 'POST',
                    url: $rootScope.APIBase + 'user/password/',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Authorization': 'Bearer ' + self.auth.accesstoken
                    },
                    data: data
                }).then(function(response) {
                    if(response.status == 200){
                        msg_element.text = "Wachtwoord succesvol gewijzigd";
                        if(func){ func(); };
                    }
                }).catch(function(fallback) {
                    if(fallback.status == 401){
                        //Refresh needed
                        self.refreshUser(function(){
                            self.changePassword(values, func, msg_element);
                        }, true);
                    } else {
                        log(fallback);
                        msg_element.text = "Het is niet gelukt je wachtwoord te wijzigen.";
                    }
                });
            }
        }

        this.forgotPassword = function (values, msg_element){
            $http({
                method: 'POST',
                url: $rootScope.APIBase + 'user/forgot/',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                data: {
                    email: values.email
                }
            }).then(function(response){
                if(values.agent){
                    msg_element.text = "Er is een mail verstuurd met een link om het wachtwoord te wijzigen naar de gebruiker. Voor de ontvanger is het aan te raden ook voor de zekerheid de spamfolder te checken.";
                } else {
                    msg_element.text = "Indien dit mailadres bekend is, is er zojuist een mail met een link om het wachtwoord te wijzigen naar verstuurd. Check hierbij voor de zekerheid ook uw spamfolder.";
                }
            })
        }

        this.resetPassword = function(values, msg_element){
            var self = this;

            if(values.new_password1 != values.new_password2){
                msg_element.text = "De twee nieuwe wachtwoorden komen niet overeen.";
            } else if(values.new_password1.toString() == ""){
                msg_element.text = "Je dient een nieuw wachtwoord in te vullen.";
            } else {
                var decoded = jwt_decode(values.token);
                if(decoded.data.role != "temp"){
                    msg_element.text = "De link die je hebt gebruikt is niet correct overgenomen. Knip en plak indien nodig de gehele link uit de e-mail.";
                } else if(Date.now()/1000 > decoded.exp){
                    msg_element.text = "De link uit je e-mail is inmiddels verlopen. Je kunt opnieuw een wachtwoordherstel aan te vragen.";
                } else {
                    msg_element.text = "Aanvraag wachtwoord wijzigen verzonden...";
                    var data = {
                        new_password: values.new_password1
                    }

                    $http({
                        method: 'POST',
                        url: $rootScope.APIBase + 'user/passwordreset/',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Authorization': 'Bearer ' + values.token
                        },
                        data: data
                    }).then(function(response) {
                        if(response.status == 200){
                            msg_element.text = "Wachtwoord succesvol gewijzigd! Je wordt nu automatisch ingelogd.";
                            //console.log({email: values.email, password: values.new_password1, region: $rootScope.settings.getCurrentRegion().kantoorId});
                            $state.go("main");
                            $rootScope.setup.doLogin({email: values.email, password: values.new_password1});
                        }
                    }).catch(function(fallback) {
                        msg_element.text = "Het is niet gelukt je wachtwoord te wijzigen.";
                    });
                }
            }
        }

        this.getUserData = function(){
            return this.userdata;
        }

        this.saveLS = function(name, values){
            if(values){
                var value = JSON.stringify(values);
                if(typeof value != 'undefined'){
                    localStorage.setItem(name, value);
                }
            }
        }

        this.retrieve = function(name, currentValues){
            var retrievedValues = localStorage.getItem(name);
            return JSON.parse(retrievedValues);
        }

        this.initialize = function (){
            var self = this;

            this.auth = this.retrieve('userAuth');
            if(this.auth && this.auth.authenticated){
                var decoded = jwt_decode(this.auth.accesstoken);
                if(decoded.data.role != this.auth.role || decoded.data.email != this.auth.email || decoded.data.region != this.auth.region){
                    //Alert! Er is geknoeid!
                    log(decoded);
                    log(this.auth);
                    this.signOut();
                } else if(Date.now()/1000 > decoded.exp){
                    //Verlopen
                    this.auth.authenticated = false;
                    this.refreshUser(function(){
                        $rootScope.setup.refreshUser(self, function(){
                            $window.location.reload();
                        });
                    });
                } else {
                    //Alles OK!
                    this.name = this.retrieve('userName');
                }
            } else if($location.search().token){
                var token = $location.search().token;
                var decoded = jwt_decode(token);
                this.auth = {
                    authenticated: false,
                    accesstoken: token,
                    nodeId: decoded.data.nodeId,
                    single: decoded.data.single
                }
            } else {
                this.auth = {"accesstoken": null};
            }
            this.setRoles();
        }

        this.auth = {"accesstoken": null};
        this.clearDirty();
        this.waitingForRefresh = false;
        this.actionsAfterRefresh = [];
    }]
);
