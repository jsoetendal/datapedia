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

$app->get('/nodes/{type}/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $nodesMapper = new NodesMapper($this->db);
    $type = escape_string($request->getAttribute('type'));

    $result = $nodesMapper->getNodes($type);
    return $response->withStatus(200)->withJSON($result);
});

$app->get('/search/{text}/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $nodesMapper = new NodesMapper($this->db);
    $text = escape_string($request->getAttribute('text'));

    $result = $nodesMapper->searchNodes($text);
    return $response->withStatus(200)->withJSON($result);
});

$app->get('/node/get/{id}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $id = intVal($request->getAttribute('id'));

    $nodesMapper = new NodesMapper($this->db);
    $result = $nodesMapper->getNode($id);
    return $response->withStatus(200)->withJSON($result);
});

$app->get('/node/delete/{id}', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $id = intVal($request->getAttribute('id'));

    $nodesMapper = new NodesMapper($this->db);
    $result = $nodesMapper->deleteNode($id);
    return $response->withStatus(200)->withJSON($result);
});

$app->post("/node/add/", function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();

    $nodesMapper = new NodesMapper($this->db, $this->media);
    $result = $nodesMapper->addNode($data);
    return $response->withStatus(200)->withJSON($result);
});

$app->post("/nodes/add/", function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();

    $nodesMapper = new NodesMapper($this->db);
    $result = $nodesMapper->addNodes($data);
    return $response->withStatus(200)->withJSON($result);
});

$app->post("/node/save/", function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();

    $nodesMapper = new NodesMapper($this->db, $this->media);
    $result = $nodesMapper->saveNode($data);
    return $response->withStatus(200)->withJSON($result);
});

$app->post("/relation/add/", function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();

    $nodesMapper = new NodesMapper($this->db);
    $result = $nodesMapper->addRelation($data);
    return $response->withStatus(200)->withJSON($result);
});

$app->post("/relation/delete/", function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $data = $request->getParsedBody();

    $nodesMapper = new NodesMapper($this->db);
    $result = $nodesMapper->deleteRelation($data);
    return $response->withStatus(200)->withJSON($result);
});


$app->get('/paths/{type}/', function (Slim\Http\Request $request, Slim\Http\Response $response) {
    $nodesMapper = new NodesMapper($this->db);
    $type = escape_string($request->getAttribute('type'));

    $result = $nodesMapper->getPaths($type);
    return $response->withStatus(200)->withJSON($result);
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
