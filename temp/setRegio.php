<?php

require_once("../api/src/classes/Database.php");

$regioMapping = [
    "PV20" => "Noord", //Groningen
    "PV21" => "Noord", //Friesland
    "PV22" => "Noord", //Drenthe
    "PV23" => "Oost", //Overijssel
    "PV24" => "Noord-Holland & Flevoland", //Flevoland
    "PV25" => "Oost", //Gelderland
    "PV26" => "Utrecht", //Utrecht
    "PV27" => "Noord-Holland & Flevoland", //Noord-Holland
    "PV28" => "Zuid-Holland", //Zuid-Holland
    "PV29" => "Zeeland", //Zeeland
    "PV30" => "Noord-Brabant", //Noord-Brabant
    "PV31" => "Limburg" //Limburg
];

$db = new Database(getenv('DB_HOST'), getenv('DB_DATABASE'), getenv('DB_USER'), getenv('DB_PASS'));

$gemeentes = json_decode(file_get_contents('landsdelen.json'));
foreach($gemeentes as $gemeente){
    $node = $db->returnFirst("SELECT * FROM nodes WHERE type = 'gemeente' AND (title LIKE '". $db->escape($gemeente->gemeente) ."' OR imgUrl = 'uploads/". $gemeente->GM .".gif')");
    if($node) {
        $data = json_decode(str_replace(["\n", "\r"], "", $node->data));
        $data->regio = $regioMapping[$gemeente->code];
        $data = json_encode($data);
        $db->doUpdate("nodes", ["data" => $data], ["nodeId" => $node->nodeId]);
    }
}
?>