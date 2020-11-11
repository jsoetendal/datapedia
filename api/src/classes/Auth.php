<?php
class Auth{

    function __construct($db){
        $this->db = $db;
        $this->sec_access = 30 * 60; //30 minutes;
        $this->sec_refresh = 0.5 * 365 * 24 * 60 * 60; //half year
    }


    function authenticate($email, $password, $refresh){
        $row = $this->db->returnFirst("SELECT id, salt, attempts FROM users WHERE email = '". $email . "' AND password IS NOT NULL");
        $salt = $row->salt;
        if($row->attempts > 1){
            usleep($row->attempts * 0.5 * 1000000); //Delay for .5 sec for each attempt
        }
        if(!$salt){
            return Array("code" => 403, "data" => ["msg" => "De opgegeven gebruikersnaam en/of wachtwoord zijn niet correct."]);
        }

        $saltedPW = $salt. $password;
        $hashedPW = hash('sha256', $saltedPW);

        $user = $this->db->returnFirst("SELECT id, email, role, name FROM users WHERE id = ". $row->id ." AND email = '". $email ."' AND password = '". $hashedPW ."' AND password IS NOT NULL");

        if(!$user){
            $this->db->doSQL("UPDATE users SET attempts = attempts + 1 WHERE email = '". $email ."'");
            return Array("code" => 403, "data" => ["msg" => "De opgegeven gebruikersnaam en/of wachtwoord zijn niet correct."]);
        } else {
            $this->db->doSQL("UPDATE users SET attempts = 0 WHERE email = '". $email ."'");
            //if($user->status == "actief"){
                return $this->getAuthData($user, $refresh);
            //} else {
            //    return Array("code" => 403, "data" => ["msg" => "U heeft geen actief account meer."]);
            //}
        }
    }

    function refresh($email, $refreshtoken){
        $token = new Token($refreshtoken);

        if(!$token->isValid()) return Array("code" => 403, "data" => ["msg" => "Unable to refresh"]);
        if($token->isExpired()) return Array("code" => 403, "data" => ["msg" => "Unable to refresh"]);

        $user = $this->db->returnFirst("SELECT id, email, role, lastsave FROM users WHERE email = '". $email ."' AND id = '". $token->getUserId() ."' AND (refresh IS NULL OR refresh < '". date("Y-m-d H:i:s", $token->getIssued())."')");

        if(!$user) return Array("code" => 403, "data" => ["msg" => "Unable to refresh"]);

        $refresh = $token->getExpired() - $token->getIssued() > 24.5 * 60 * 60; //Short access(2 * $this->sec_access) and 24-hour (24 * 60 * 60) temp tokens should not provide long-term refresh keys
        return $this->getAuthData($user, $refresh);
    }

    function isPasswordSet($userId){
        $arr = $this->db->getArray("SELECT id FROM users WHERE id = ". $userId ." AND password IS NOT NULL");
        return Array("code" => 200, "data" => count($arr) > 0);
    }

    function getAuthData($user, $refresh){
        $now = time();
        unset($user->wensen); //Zijn alleen voor de update nodig

        $accessToken = new Token();
        $accessToken->setData($user);
        $accessToken->setExpired($now + $this->sec_access);

        $refreshToken = new Token();
        $refreshToken->setData($user);
        if($refresh){
            $refreshToken->setExpired($now + $this->sec_refresh);
        } else {
            $refreshToken->setExpired($now + (2 * $this->sec_access));
        }

        $aT = $accessToken->encode();
        $rT = $refreshToken->encode();

        return Array(
            "code" => 200,
            "data" => [
                "user" => $user,
                "accesstoken" => $aT,
                "refreshtoken" => $rT
            ]
        );
    }
    function saveToDB($userid, $name){
        $arr = Array();
        $arr["name"] = $name;
        $lastsave = date("Y-m-d H:i:s");
        $arr["lastsave"] = $lastsave;

        $this->db->doUpdate("users", $arr , ["id" => $userid]);
        return Array("code" => 200, "data" => ["msg" => "Data saved", "lastsave" => $lastsave]);
    }

    function loadFromDB($userid, $agentOrAdmin = false){
        $user = $this->db->returnFirst("SELECT id, email, role, lastlogin, name FROM users WHERE id = '". $userid ."'");
        if(!$user) return Array("code" => 403, "data" => ["msg" => "No such user"]);

        return Array(
            "code" => 200,
            "data" =>
                [
                    "user" => $user
                ]
        );
    }

    function create_user($email, $role, $name){

        $email = strtolower($email);
        $aantal = $this->db->returnQuery("SELECT COUNT(*) as result FROM users WHERE email = '". $email ."'");
        if($aantal > 0){
            $result = new StdClass();
            $result->msg = "Er is al een account met dit emailadres";
            return ["code" => 406, "data" => $result];
        }

        /*
        $salt      = bin2hex(mcrypt_create_iv(32, MCRYPT_DEV_URANDOM));
        $saltedPW = $salt. $password;
        $hashedPW = hash('sha256', $saltedPW);
        */
        $user = Array();
        $user["email"] = $email;
        $user["role"] = $role;
        $user["name"] = $name;
        $user["created"] = date("Y-m-d H:i:s");

        $userid = $this->db->doInsert("users", $user);

        $tmpUser = new stdClass();
        $tmpUser->id = $userid;
        $tmpUser->email = $email;
        $tmpUser->role = "temp";

        $accessToken = new Token();
        $accessToken->setData($tmpUser);
        $accessToken->setExpired(time() + (14 * 24 * 60 * 60));

        $tokenStr = $accessToken->encode();

        $url = "https://test.datapedia.nl/passwordreset/1/" . $tokenStr;
        $link = "<a href='". $url ."'>Inloggen en wachtwoord bedenken</a>";

        if(trim($email) <> ""){
            $mail = "Hallo ". $name .",\n\nWelkom bij de Datapedia Smart Mobility!\n\nEr is een account aangemaakt voor Datapedia voor dit e-mailadres. \n\n Je kunt nu een wachtwoord instellen op deze link: ". $link;
            $mail .= "\n\nBovenstaande link is beperkt geldig.\nHeb je geen verzoek gedaan? Je kan deze mail dan negeren, of bij herhaaldelijke mails contact opnemen met info@datapedia.nl";



            $html = "<html>";
            $html = "<style>body {background-color: white; font-family: Calibri, Arial, Verdana, Sans}</style>";
            $html .= "<body>";
            $html .= "<div style=\"width: 500px; margin: 0px auto; padding: 30px; background-color: white;\">";
            $html .= str_replace(["\n","\r",chr(10),chr(13)],"<BR/>",$mail);
            $html .= "<br/><br/><br/><p><small>Werkt bovenstaande link niet goed? Knip en plak dan onderstaande volledige link in je browser:<br/>".$url."</p>";
            $html .= "</div></body></html>";

            $m = new Mail([
                    "email" => $email,
                    "subject" => "Inloggegevens Datapedia Smart Mobility",
                    "text" => $mail,
                    "html" => $html,
                    "reply_to" => "info@datapedia.nl"
                ]
            );
            $m->send();

        }

        if($userid > 0){
            return Array(
                "code" => 200,
                "data" =>
                    [
                        "userid" => $userid
                    ]
            );
        }
    }

    function edit_user($id, $email, $password, $name, $role = null){
        $user = Array();

        $lastsave = date("Y-m-d H:i:s");

        if(trim($password) <> ""){
            //$salt      = bin2hex(mcrypt_create_iv(32, MCRYPT_DEV_URANDOM));
            $salt      = bin2hex(random_bytes(32));
            $saltedPW = $salt. $password;
            $hashedPW = hash('sha256', $saltedPW);
            $user["password"] = $hashedPW;
            $user["salt"] = $salt;
            $user["refresh"] = $lastsave;
        }

        $user["email"] = $email;
        $user["name"] = $name;
        $user["lastsave"] = $lastsave;
        if($role) $user[$role] = $role;

        $this->db->doUpdate("users", $user, ["id" => $id]);

        return Array("code" => 200, "data" => ["msg" => "Data saved"]);
    }


    function delete_user($id){
        $this->db->doSQL("DELETE FROM users WHERE id = '". $id ."'");
        return Array("code" => 200, "data" => ["msg" => "User deleted"]);
    }

    function changePassword($id, $current_password,$new_password){
        $salt = $this->db->returnQuery("SELECT salt as result FROM users WHERE id = '". $id . "'");
        if(!$salt){
            return Array("code" => 403, "data" => ["msg" => "Unable to authenticate"]);
        }

        $saltedPW = $salt. $current_password;
        $hashedPW = hash('sha256', $saltedPW);

        $user = $this->db->returnFirst("SELECT id FROM users WHERE id = '". $id ."' AND password = '". $hashedPW ."'");

        if(!$user){
            return Array("code" => 403, "data" => ["msg" => "Unable to authenticate"]);
        } else {
            return $this->doChangePassword($id, $new_password);
        }
    }

    function doChangePassword($id, $new_password){
        $user = Array();

        $salt = bin2hex(random_bytes(32));
        $saltedPW = $salt. $new_password;
        $hashedPW = hash('sha256', $saltedPW);
        $user["password"] = $hashedPW;
        $user["salt"] = $salt;
        $user["refresh"] = date("Y-m-d H:i:s");

        $this->db->doUpdate("users", $user, ["id" => $id]);

        return Array("code" => 200, "data" => ["msg" => "Password changed"]);
    }

    function forgotPassword($email){
        $users = $this->db->getArray("SELECT id, email, role, FROM users WHERE email = '". $email ."'");
        foreach($users as $user){
            $user->role = "temp";

            $accessToken = new Token();
            $accessToken->setData($user);
            $accessToken->setExpired(time() + (24 * 60 * 60));

            $tokenStr = $accessToken->encode();

            $url = "https://localhost/datapedia.nl/passwordreset/0/" . $tokenStr;
            $link = "<a href='". $url ."'>Wachtwoord opnieuw instellen</a>";


            $mail = "Er is een verzoek gedaan om je Datapedia-wachtwoord opnieuw in te stellen. Je kunt dit doen door op deze link te klikken:\n\n ". $link;
            $mail .= "\n\nBovenstaande link is slechts 24 uur geldig.\nHeb je geen verzoek gedaan? Je kan deze mail dan negeren, of bij herhaaldelijke mails contact opnemen met info@datapedia.nl";


            $html = "<html>";
            $html = "<style>body {background-color: white; font-family: Calibri, Arial, Verdana, Sans}</style>";
            $html .= "<body>";
            $html .= "<div style=\"width: 500px; margin: 0px auto; padding: 30px; background-color: white;\">";
            $html .= "<center><img src=\"https://". $regio->slug .".copaan.nl/kantoor/logo.png\" style=\"margin: 10px 0px 40px 0px\"></center>";
            $html .= str_replace("\n","<BR/>", $mail);
            $html .= "<br/><br/><br/><p><small>Werkt bovenstaande link niet goed? Knip en plak dan onderstaande volledige link in je browser:<br/>".$url."</p>";
            $html .= "</div></body></html>";


            $m = new Mail([
                "email" => $email,
                "subject" => $regio->title . " - Wachtwoord Copaan opnieuw instellen",
                "text" => $mail,
                "html" => $html
            ]);
            $m->send();
        }
    }

    function getUsers(){
        $clients = $this->db->getArray("SELECT id, email, role, name FROM users");
        return Array("code" => 200, "data" => $clients);
    }

    function clientDetails($userid, $agentOrAdmin){
        $result = $this->loadFromDB($userid, $agentOrAdmin);
        $data = $result["data"];
        $client = $data["user"];

        return Array(
            "code" => 200,
            "data" =>
                [
                    "user" => $client
                ]
        );
    }

    function getEditToken($nodeId){
        $token = new Token();
        return Array("code" => 200, "data" => $token->encodeSimpleData(["nodeId" => $nodeId, "single" => "edit"]));
    }
}
?>