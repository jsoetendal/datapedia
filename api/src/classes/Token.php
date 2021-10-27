<?php
use \Firebase\JWT\JWT;

class Token{
    var $expired, $valid, $exception, $token, $key;
 
    public function __construct($requestOrString = null){
        $this->key = "[4`,uU@(Wt2L[+{8zNS7~u-UgCkuUPCi.vnRzx<gV?~0uB|,30SZT&*_vv7RYjT";
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
        if(!$this->expired) return false;
        return $this->expired;
    }

    function isLoggedIn($nodeId = null){
        if($this->token->data->id > 0) return true;
        if($nodeId && $nodeId == $this->token->data->nodeId && $this->token->data->single == "edit") return true;
        return false;
    }

    function hasSingleAccess($nodeId = null){
        if ($nodeId && $nodeId == $this->token->data->nodeId && $this->token->data->single == "edit") return true;
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
    
    function isEditor($nodeId = null){
        if($this->token->data->role == "editor") return true;
        if($nodeId && $nodeId == $this->token->data->nodeId && $this->token->data->single == "edit") return true;
        return false;
    }
    function isContributor($nodeId = null){
        if($this->token->data->role == "contributor") return true;
        if($nodeId && $nodeId == $this->token->data->nodeId && $this->token->data->single == "edit") return true;
        return false;
    }

    function isContributorOrUp($nodeId= null){
        return $this->isContributor($nodeId) || $this->isEditor($nodeId) || $this->isAdmin();
    }

    function isEditorOrUp($nodeId = null){
        return $this->isEditor($nodeId) || $this->isAdmin();
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

    function encodeSimpleData($data){
        unset($this->token->iss);
        unset($this->token->aud);
        unset($this->token->iat);
        $this->token->data = $data;
        return JWT::encode($this->token, $this->key);
    }
    
    function encode(){
        return JWT::encode($this->token, $this->key);
    }
}