<?php
    error_reporting(E_ALL ^E_NOTICE ^E_WARNING);
    $url = $_SERVER['REQUEST_URI'];
    if($_SERVER["SERVER_NAME"] == "localhost") {
        $parts = explode("/", strtolower($url));
        array_splice($parts, 0,1);
    } else {
        $parts = explode("/", strtolower($url));
    }
    $settings = json_decode(file_get_contents("app/settings/settings.json"));
    $module = null;
    $node = null;
    $nodes = null;

    $modules = [];
    foreach($settings->modules as $m){
        $modules[] = $m->name;
    }

    //print_r($parts); exit();


    if(strtolower($parts[1] == "nodes")){
        $type = $parts[2];
        foreach($settings->content->entities as $e) {
            if (strtolower(trim($e->type)) == strtolower(trim($type))) {
                header("Location: https://www.datapedia.nl/". $e->module . $url, true, 301); exit();
            }
        }
    }elseif(strtolower($parts[1] == "node")){
        $nodeId = $parts[3];
        $node = json_decode(file_get_contents("https://www.datapedia.nl/api/public/node/get/" . $nodeId));
        $type = $node->type;
        foreach($settings->content->entities as $e) {
            if (strtolower(trim($e->type)) == strtolower(trim($type))) {
                header("Location: https://www.datapedia.nl/". $e->module . $url, true, 301); exit();
            }
        }
    } else if(in_array($parts[1], $modules)){
        header("Location: https://www.datapedia.nl/". $url, true); exit();
    } else {
        header("Location: https://www.datapedia.nl/"); exit();
    }
?>