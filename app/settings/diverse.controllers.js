angular.
module('app').
component('passwordforgot', {
    templateUrl: 'app/components/main/forgot.template.html',
    controller: ['$rootScope', '$scope', '$location',
        function ForgotController($rootScope, $scope, $location) {
            var self = this;

            $scope.doForgotPassword = function(form){
                $rootScope.setup.doForgotPassword({email: form.email}, $scope.forgot_msg);
            }

            $scope.forgot_msg = {text: ""};
        }]
});

angular.
module('app').
component('passwordreset', {
    templateUrl: 'app/components/main/reset.template.html',
    controller: ['$rootScope', '$scope', '$http', '$location', '$stateParams',
        function ResetController($rootScope, $scope, $http, $location, $stateParams) {
            var self = this;

            $scope.doReset = function(form){
                form.token = $stateParams.tokenStr;
                $rootScope.setup.doResetPassword(form, $scope.reset_msg);
            }

            $scope.user = $rootScope.setup.user;

            if($stateParams.newPassword == "1"){
                $scope.newPassword = true;
            } else {
                $scope.newPassword = false;
            }

            if($scope.user.auth.authenticated && $scope.newPassword){
                $("#melding").modal();
                console.log($scope.user);
                $rootScope.melding = {"titel": "Al ingelogd", "tekst": "Je bent al ingelogd als " + $scope.user.auth.email +". Het is niet nodig om een wachtwoord op te geven of te resetten. Wilde je een wachtwoord voor een andere gebruiker instellen of resetten? Log dan eerst uit!"};
                //Is al ingelogd. Waarschijnlijk link uit email gebruikt om opnieuw naar website te gaan.
            } else {
                $scope.reset_msg = {text: ""};
                $scope.show_form = true;
                try {
                    var decoded = jwt_decode($stateParams.tokenStr);
                }
                catch(err) {
                    $scope.show_form = false;
                    $scope.reset_msg.text = "De link die je hebt gebruikt is niet correct overgenomen. Knip en plak indien nodig de gehele link uit je e-mail.";
                }
                if(!decoded || decoded.data.role != "temp"){
                    $scope.show_form = false;
                    $scope.reset_msg.text = "De link die je hebt gebruikt is niet correct overgenomen. Knip en plak indien nodig de gehele link uit je e-mail.";
                } else {
                    if($scope.newPassword){
                        //Als het wachtwoord al is ingevoerd, is het waarschijnlijk een nieuwe gebruiker die de link gebruikt om gewoon opnieuw naar Copaan te gaan. In dat geval doorverwijzen naar Copaan.
                        $http({
                            method: 'GET',
                            url: $rootScope.APIBase + 'user/ispasswordset/',
                            headers: {
                                'X-Authorization': 'Bearer ' + $stateParams.tokenStr
                            }
                        }).then(function(response) {
                            if(response.status == 200){
                                if(response.data){
                                    //true, dus wachtwoord is al ingesteld, doorverwijzen naar login
                                    //console.log(response);
                                    window.location.href = $rootScope.wwwBase + "/login";
                                }
                            } else {
                            }
                        });
                    }
                    if(Date.now()/1000 > decoded.exp){
                        $scope.show_form = false;
                        $scope.reset_msg.text = "De link uit je e-mail is inmiddels verlopen. Je dient opnieuw een wachtwoordherstel aan te vragen door links op 'Inloggen' en daarna op 'Wachtwoord vergeten' te klikken";
                    }

                    $scope.email = decoded.data.email;
                }
            }
        }]
});