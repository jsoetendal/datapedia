<?php
use \Firebase\JWT\JWT;

class Token{
 
    public function __construct($requestOrString = null){
        $this->key = "ThA{fKPLSZbu\"&]Ur#Mv/'D2@Nz[]D7@Il`1Im6X#Y}Tw<%:9[|D+?$X@w!%wZ^q";
        if(is_object($requestOrString)){
            //load from Request
            if($requestOrString->getHeader('HTTP_X_Authorization')){
                $tokenString = escape_string(str_replace("Bearer ","", $requestOrString->getHeader('HTTP_X_Authorization')[0]));
            } else {
                $tokenString = escape_string(str_replace("Bearer ","", $requestOrString->getHeader('Authorization')[0]));
            }
            
            $this->loadTokenString($tokenString);
        }elseif(is_string($requestOrString)){
            //load from String
            $this->loadTokenString($requestOrString);
        }else{
            //Create new
            $this->token = new StdClass;
            $this->token->iss = "http://www.datapedia.nl";
            $this->token->aud = "http://www.datapedia.nl";
            $this->token->iat = time();
        }
    }
    
    function loadTokenString($tokenStr){
        $this->tokenStr = $tokenStr;
        //$this->tokenStr = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC93d3cud2VldG1lZXIubmwiLCJpYXQiOjE0NzQ2Mzg5ODUsImV4cCI6MTQ3NDY0MDc4NSwic2NvcGUiOlsiYWNjZXNzIl0sImRhdGEiOnsiaWQiOiIxIiwiZW1haWwiOiJqYXNwZXJAc29ldGVuZGFsLm5sIiwicm9sZSI6ImFkbWluIiwicmVnaW9uIjoiMCJ9fQ._mMVfCgemh6_DSey6xpMKcCV47ARUbNGHuEYf8QNVdk";
        try{
            $this->token = JWT::decode($this->tokenStr, $this->key, array('HS256'));
            $this->expired = false;
            $this->valid = true;
        } catch (Exception $e) {
            if(get_class($e) == "Firebase\\JWT\\ExpiredException"){
                $this->expired = true;
            }
            $this->valid = false;
            $this->exception = $e;
            $this->token = null;
        }
    }
    
    function isValid(){
        if($this->token){
            return true;
        } else {
            return false;
        }
    }
    
    function isExpired(){
        return $this->expired;
    }
    
    function isLoggedIn(){
        if($this->token->data->id > 0) return true;
        return false;
    }
    
    function getUserId(){
        return $this->token->data->id;        
    }
    
    function getRole(){
        return $this->token->data->role;
    }
    
    function getRegion(){
        return $this->token->data->region;        
    }
    
    function isAdmin(){
        if($this->token->data->role == "admin") return true;
        return false;
    }
    
    function isEditor(){
        if($this->token->data->role == "editor") return true;
        return false;
    }
    function isContributor(){
        if($this->token->data->role == "contributor") return true;
        return false;
    }

    function isContributorOrUp(){
        return $this->isContributor() || $this->isEditor() || $this->isAdmin();
    }

    function isEditorOrUp(){
        return $this->isEditor() || $this->isAdmin();
    }

    function isTemp(){
        if($this->token->data->role == "temp") return true;
        return false;
    }
    
    function getExpired(){
        return $this->token->exp;
    }

    function getIssued(){
        return $this->token->iat;
    }
    
    function setExpired($exp){
        $this->token->exp = $exp;
    }
    
    function setData($data){
        $this->token->data = $data;
    }
    
    function encode(){
        return JWT::encode($this->token, $this->key);
    }
}