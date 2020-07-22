'use strict';
angular.
module('core.setup',['core.user']).
service('Setup', ['$rootScope', '$window', '$location', '$state', '$http', 'User', function($rootScope, $window, $location, $state, $http, User){

    this.doLogin = function(scope, currentRegionId){
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
                //$state.go("main");
                $window.location.reload();
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

        var fname = "app/settings/settings.json";
        $http.get(fname).then(function(response) {
            if(response.data){
                $rootScope.settings = response.data;
                console.log($rootScope.settings)
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

    this.setDirty = function(type, userOrClient){
        if(userOrClient == "user"){
            this.user.setDirty(type);
        } else {
            this.client.setDirty(type);
        }
    }

    this.saveDirty = function(){
        if(this.user) this.user.saveDirty();
        if(this.client) this.client.saveDirty();
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