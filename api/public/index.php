<?php
if (PHP_SAPI == 'cli-server') {
    // To help the built-in PHP dev server, check if the request was actually for
    // something which should probably be served as a static file
    $url  = parse_url($_SERVER['REQUEST_URI']);
    $file = __DIR__ . $url['path'];
    if (is_file($file)) {
        return false;
    }
}

require __DIR__ . '/../vendor/autoload.php';

session_start();

// Instantiate the app
$settings = require __DIR__ . '/../src/settings.php';
$app = new \Slim\App($settings);

// Set up dependencies
require __DIR__ . '/../src/dependencies.php';
// Register middleware
require __DIR__ . '/../src/middleware.php';
// Register routes
require __DIR__ . '/../src/routes.php';


spl_autoload_register(function ($classname) {
    require ("../src/classes/" . $classname . ".php");
});

$container['db'] = function ($c) {
    $db = $c['settings']['db'];
    $database = new Database($db['host'], $db['dbname'], $db['user'], $db['pass']);
    return $database;
};

$container['media'] = function($c){
    $s = $c['settings']['media'];
    return $s;
};

error_reporting(E_ALL ^E_NOTICE ^E_WARNING);
error_reporting(E_ALL ^E_NOTICE);


function escape_string($txt){
    return filter_var($txt, FILTER_SANITIZE_STRING);
}

function escape_object($txt){
    return json_decode(json_encode($txt));
}

$app->get('/nodes/extended/{type}/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    $nodesMapper = new NodesMapper($this->db);
    $type = escape_string($request->getAttribute('type'));
    if(!$nodesMapper->hasAccess($type, $token->getRole())) return $response->withStatus(403); // Indien geen toegang tot dit type, geef 401 terug!

    $result = $nodesMapper->getNodesExtended($type);
    return $response->withStatus(200)->withJSON($result);
});

$app->get('/nodes/{type}/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    $nodesMapper = new NodesMapper($this->db);
    $type = escape_string($request->getAttribute('type'));
    if(!$nodesMapper->hasAccess($type, $token->getRole())) return $response->withStatus(403); // Indien geen toegang tot dit type, geef 401 terug!

    $result = $nodesMapper->getNodes($type);
    return $response->withStatus(200)->withJSON($result);
});

$app->get('/nodes/{type}/path/{path}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    $nodesMapper = new NodesMapper($this->db);
    $type = escape_string($request->getAttribute('type'));
    $path = escape_string($request->getAttribute('path'));
    if(!$nodesMapper->hasAccess($type, $token->getRole())) return $response->withStatus(403); // Indien geen toegang tot dit type, geef 401 terug!

    $result = $nodesMapper->getNodes($type, $path);
    return $response->withStatus(200)->withJSON($result);
});

$app->get('/nodes/relation/{key}/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    $nodesMapper = new NodesMapper($this->db);
    $key = escape_string($request->getAttribute('key'));

    $result = $nodesMapper->getRelationNodes($key);
    return $response->withStatus(200)->withJSON($result);
});

$app->get('/search/{text}/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    $nodesMapper = new NodesMapper($this->db);
    $text = escape_string($request->getAttribute('text'));

    $result = $nodesMapper->searchNodes($text);
    return $response->withStatus(200)->withJSON($result);
});

$app->get('/node/get/{id}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $id = intVal($request->getAttribute('id'));
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    $nodesMapper = new NodesMapper($this->db);
    $result = $nodesMapper->getNode($id);
    if(!$nodesMapper->hasAccess($result->type, $token->getRole()) && !$token->hasSingleAccess($id)) return $response->withStatus(403); // Indien geen toegang tot dit type, geef 401 terug!

    return $response->withStatus(200)->withJSON($result);
});

$app->get('/node/history/{id}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $id = intVal($request->getAttribute('id'));
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    if($token->isEditorOrUp()) {
        $nodesMapper = new NodesMapper($this->db);
        $result = $nodesMapper->getNodeHistory($id);
        if(!$nodesMapper->hasAccess($result[0]->type, $token->getRole())) return $response->withStatus(403); // Indien geen toegang tot dit type, geef 401 terug!
        return $response->withStatus(200)->withJSON($result);
    } else {
        return $response->withStatus(403);
    }
});

$app->get('/node/delete/{id}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $id = intVal($request->getAttribute('id'));
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    if($token->isContributorOrUp($id)) {
        $nodesMapper = new NodesMapper($this->db);
        if(!$nodesMapper->hasAccessNodeId($id, $token->getRole())) return $response->withStatus(403); // Indien geen toegang tot dit type, geef 401 terug!
        $result = $nodesMapper->deleteNode($id, $token);
        return $response->withStatus(200)->withJSON($result);
    } else {
        return $response->withStatus(403);
    }
});

$app->get('/node/token/{id}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $id = intVal($request->getAttribute('id'));
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    if($token->isContributorOrUp()) {
        $nodesMapper = new NodesMapper($this->db);
        if(!$nodesMapper->hasAccessNodeId($id, $token->getRole())) return $response->withStatus(403); // Indien geen toegang tot dit type, geef 401 terug!
        $auth = new Auth($this->db);
        $result = $auth->getEditToken($id);
        return $response->withStatus($result["code"])->withJSON($result["data"]);
    } else {
        return $response->withStatus(403);
    }
});

$app->post("/node/add/", function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    $nodesMapper = new NodesMapper($this->db, $this->media);
    if(!$nodesMapper->hasAccess($data["type"], $token->getRole())) return $response->withStatus(403); // Indien geen toegang tot dit type, geef 401 terug!
    $result = $nodesMapper->addNode($data, $token);
    return $response->withStatus(200)->withJSON($result);
});

$app->post("/nodes/add/", function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    if($token->isEditorOrUp()) {
        $nodesMapper = new NodesMapper($this->db);
        $result = $nodesMapper->addNodes($data, $token);
        if(!$nodesMapper->hasAccess($data[0]["type"], $token->getRole())) return $response->withStatus(403); // Indien geen toegang tot dit type, geef 401 terug!
        return $response->withStatus(200)->withJSON($result);
    } else {
        return $response->withStatus(403);
    }
});

$app->post("/node/save/", function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    $nodesMapper = new NodesMapper($this->db, $this->media);
    if(!$nodesMapper->hasAccess($data["type"], $token->getRole())  && !$token->hasSingleAccess($data["id"])) return $response->withStatus(403); // Indien geen toegang tot dit type, geef 401 terug!
    $result = $nodesMapper->saveNode($data, $token);
    return $response->withStatus(200)->withJSON($result);
});

$app->post("/relation/add/", function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    $nodesMapper = new NodesMapper($this->db);
    $result = $nodesMapper->addRelation($data, $token);
    return $response->withStatus(200)->withJSON($result);
});

$app->post("/dependency/add/", function (Slim\Http\Request $request, Slim\Http\Response $response) {
    //Does exactly the same as relation/add, only difference is the node it returns
    $data = $request->getParsedBody();
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    $nodesMapper = new NodesMapper($this->db);
    $result = $nodesMapper->addDependency($data, $token);
    return $response->withStatus(200)->withJSON($result);
});

$app->post("/relation/set/", function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    //if($token->isContributorOrUp($data["sourceId"])) { //setRelation handles role/permission
        $nodesMapper = new NodesMapper($this->db);
        $result = $nodesMapper->setRelation($data, $token);
        return $response->withStatus(200)->withJSON($result);
    //} else {
      //return $response->withStatus(403);
    //}
});

$app->post("/relation/delete/", function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    if($token->isContributorOrUp($data["sourceId"])) {
        $nodesMapper = new NodesMapper($this->db);
        $result = $nodesMapper->deleteRelation($data, $token);
        return $response->withStatus(200)->withJSON($result);
    } else {
        return $response->withStatus(403);
    }
});


$app->get('/paths/{type}/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $nodesMapper = new NodesMapper($this->db);
    $type = escape_string($request->getAttribute('type'));
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);
    if(!$nodesMapper->hasAccess($type, $token->getRole())) return $response->withStatus(403); // Indien geen toegang tot dit type, geef 401 terug!

    $result = $nodesMapper->getPaths($type);
    return $response->withStatus(200)->withJSON($result);
});

$app->get('/entities/count/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $nodesMapper = new NodesMapper($this->db);
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    $result = $nodesMapper->getEntityCount();
    return $response->withStatus(200)->withJSON($result);
});

$app->get('/users/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    if($token->isAdmin()){
        $auth = new Auth($this->db);
        $result = $auth->getUsers();
        if($result["code"] == 200){
            return $response->withStatus(200)->withJson($result["data"]);
        } else {
            return $response->withStatus($result["code"])->withJson($result["data"]);
        }
    } else {
        return $response->withStatus(403);
    }
});

$app->post('/user/auth/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $email = escape_string($data['email']);
    $password = escape_string($data['password']);
    $refresh = escape_string($data['refresh']);
    $auth = new Auth($this->db);

    $result = $auth->authenticate($email, $password, $refresh);
    if($result["code"] == 200){
        return $response->withStatus(200)->withJson($result["data"]);
    } else {
        return $response->withStatus($result["code"])->withJson($result["data"]);
    }
});

$app->get('/user/ispasswordset/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    $userid = $token->getUserId();
    if($userid > 0){
        $auth = new Auth($this->db);
        $result = $auth->isPasswordSet($userid);
        if($result["code"] == 200){
            return $response->withStatus(200)->withJson($result["data"]);
        } else {
            return $response->withStatus($result["code"])->withJson($result["data"]);
        }
    } else {
        return $response->withStatus(403);
    }
});

$app->post('/user/refresh/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $email = escape_string($data['email']);
    $refreshtoken = escape_string($data['refreshtoken']);
    $auth = new Auth($this->db);

    $result = $auth->refresh($email, $refreshtoken);
    if($result["code"] == 200){
        return $response->withStatus(200)->withJson($result["data"]);
    } else {
        return $response->withStatus($result["code"])->withJson($result["data"]);
    }
});

$app->post('/user/save/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);
    $userid = $token->getUserId();

    if($userid > 0){
        $auth = new Auth($this->db);
        $data = $request->getParsedBody();
        $email = escape_string($data['email']);
        $name = escape_string($data['name']);

        $result = $auth->saveToDB($userid, $name);
        if($result["code"] == 200){
            return $response->withStatus(200)->withJson($result["data"]);
        } else {
            return $response->withStatus($result["code"])->withJson($result["data"]);
        }
    } else {
        return $response->withStatus(403);
    }
});

$app->get('/user/load/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);
    $userid = $token->getUserId();

    if($userid > 0){
        $auth = new Auth($this->db);
        $result = $auth->loadFromDB($userid);
        if($result["code"] == 200){
            return $response->withStatus(200)->withJson($result["data"]);
        } else {
            return $response->withStatus($result["code"])->withJson($result["data"]);
        }
    } else {
        return $response->withStatus(403);
    }
});


$app->post('/user/create/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $email = escape_string($data['email']);
    $role = escape_string($data['role']);
    $name = escape_string($data['name']);

    if(trim($email) == ""){
        $result = new StdClass();
        $result->msg = "Email is empty";
        $response = ["code" => 406, "data" => $result];
        return $response;
    }

    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);
    if(!$token || ($token->isValid() && !$token->isAdmin())){
        $role = "contributor";
        //Iedereen kan een user aanmaken, alleen admin kan een user met andere rol dan contributor aanmaken
    }
    $auth = new Auth($this->db);

    $result = $auth->create_user($email, $role, $name);
    if($result["code"] == 200){
        return $response->withStatus(200)->withJson($result["data"]);
    } else {
        return $response->withStatus($result["code"])->withJson($result["data"]);
    }
});

$app->post('/user/edit/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $id = intVal($data['id']);
    $email = escape_string($data['email']);
    $password = escape_string($data['password']);
    $role = escape_string($data['name']);
    $name = escape_string($data['name']);

    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);
    if($token->isAdmin() || ($token->getUserId() == $id)){
        $auth = new Auth($this->db);

        if($token->isAdmin()){
            $result = $auth->edit_user($id, $email, $password, $name, $role);
        } elseif($token->getUserId() == $id){
            $result = $auth->edit_user($id, $email, $password, $name);
            //Non-admin can't change their own role
        }
    } else {
        return $response->withStatus(403);
    }

        if($result["code"] == 200){
            return $response->withStatus(200)->withJson($result["data"]);
        } else {
            return $response->withStatus($result["code"])->withJson($result["data"]);
        }
    //} else {
        return $response->withStatus(403);
    //}
});

$app->post('/user/delete/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $id = intVal($data['id']);

    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);
    if($token->isAdmin() || $token->getUserId() == $id){
        $auth = new Auth($this->db);

        $result = $auth->delete_user($id);
        if($result["code"] == 200){
            return $response->withStatus(200)->withJson($result["data"]);
        } else {
            return $response->withStatus($result["code"])->withJson($result["data"]);
        }
    } else {
        return $response->withStatus(403);
    }
});

$app->post('/user/password/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $id = intVal($data['id']);
    $current_password = escape_string($data['current_password']);
    $new_password = escape_string($data['new_password']);

    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);
    if($token->isAdmin() || $token->getUserId() == $id){
        $auth = new Auth($this->db);
        $result = $auth->changePassword($id, $current_password, $new_password);
        if($result["code"] == 200){
            return $response->withStatus(200)->withJson($result["data"]);
        } else {
            return $response->withStatus($result["code"])->withJson($result["data"]);
        }
    } else {
        return $response->withStatus(403);
    }
});

$app->post('/user/passwordreset/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $new_password = escape_string($data['new_password']);
    $token = new Token($request);

    if($token->isExpired()) return $response->withStatus(401);
    if($token->isValid() && $token->isTemp()){
        $auth = new Auth($this->db);
        $result = $auth->doChangePassword($token->getUserId(), $new_password);
        if($result["code"] == 200){
            return $response->withStatus(200)->withJson($result["data"]);
        } else {
            return $response->withStatus($result["code"])->withJson($result["data"]);
        }
    } else {
        return $response->withStatus(403);
    }
});

$app->post('/user/forgot/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $email = escape_string($data['email']);

    $auth = new Auth($this->db);
    $result = $auth->forgotPassword($email);
    return $response->withStatus(200);
});

$app->get('/suggestions/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    if($token->isEditorOrUp()){
        $nodesMapper = new NodesMapper($this->db);
        $result = $nodesMapper->getSuggestions();
        return $response->withStatus(200)->withJSON($result);
    } else {
        return $response->withStatus(403);
    }
});

$app->get('/updates/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    if($token->isEditorOrUp()){
        $nodesMapper = new NodesMapper($this->db);
        $result = $nodesMapper->getUpdates();
        return $response->withStatus(200)->withJSON($result);
    } else {
        return $response->withStatus(403);
    }
});

$app->get('/deleted/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    if($token->isExpired()) return $response->withStatus(401);

    if($token->isEditorOrUp()){
        $nodesMapper = new NodesMapper($this->db);
        $result = $nodesMapper->getDeleted();
        return $response->withStatus(200)->withJSON($result);
    } else {
        return $response->withStatus(403);
    }
});

$app->get('/history/approve/{nodeVersionId}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    $nodeVersionId = intval($request->getAttribute('nodeVersionId'));

    if($token->isExpired()) return $response->withStatus(401);
    if($token->isEditorOrUp()){
        $nodesMapper = new NodesMapper($this->db);
        $result = $nodesMapper->historyApprove($nodeVersionId);
        return $response->withStatus(200)->withJSON($result);
    } else {
        return $response->withStatus(403);
    }
});

$app->get('/history/revert/{nodeVersionId}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    $nodeVersionId = intval($request->getAttribute('nodeVersionId'));

    if($token->isExpired()) return $response->withStatus(401);
    if($token->isEditorOrUp()){
        $nodesMapper = new NodesMapper($this->db);
        $result = $nodesMapper->historyRevert($nodeVersionId);
        return $response->withStatus(200)->withJSON($result);
    } else {
        return $response->withStatus(403);
    }
});

$app->get('/history/delete/{nodeVersionId}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);
    $nodeVersionId = intval($request->getAttribute('nodeVersionId'));

    if($token->isExpired()) return $response->withStatus(401);
    if($token->isEditorOrUp()){
        $nodesMapper = new NodesMapper($this->db);
        $result = $nodesMapper->historyDelete($nodeVersionId);
        return $response->withStatus(200)->withJSON($result);
    } else {
        return $response->withStatus(403);
    }
});

$app->get('/settings/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $token = new Token($request);

    if($token->isExpired()) return $response->withStatus(401);
    if($token->isAdmin()) {
        $settingsMapper = new SettingsMapper($this->db);
        $result = $settingsMapper->getSettings();
        return $response->withStatus(200)->withJSON($result);
    } else {
        return $response->withStatus(403);

    }
});

$app->post('/settings/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();
    $token = new Token($request);

    if($token->isExpired()) return $response->withStatus(401);
    if($token->isAdmin()) {
        $settingsMapper = new SettingsMapper($this->db);
        $result = $settingsMapper->saveSettings($data);
        return $response->withStatus(200)->withJSON($result);
    } else {
        return $response->withStatus(403);
    }
});

$app->get('/file/{nodeId}/{url}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $nodeId = intval($request->getAttribute('nodeId'));
    $url = escape_string($request->getAttribute('url'));

    $nodesMapper = new NodesMapper($this->db, $this->media);
    $nodesMapper->outputAttachment($nodeId, $url);
    return $response->withStatus(404); //previous command will exit if file is found
});

$app->get('/data/overheid/{q}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $dataMapper = new DataMapper($this->db);
    $q = escape_string($request->getAttribute('q'));

    $result = $dataMapper->getDataOverheidSearch($q);
    return $response->withStatus(200)->withJSON($result);
});
$app->get('/data/overheidset/{id}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $dataMapper = new DataMapper($this->db);
    $id = escape_string($request->getAttribute('id'));

    $result = $dataMapper->getDataOverheidSet($id);
    return $response->withStatus(200)->withJSON($result);
});

// Run app
$app->run();
