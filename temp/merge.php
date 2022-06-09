<?php


$geojson = json_decode(file_get_contents("gemeentes-2021-vers1.json"));
$landsdelen = json_decode(file_get_contents("landsdelen.json"));

$arr = [];
foreach($landsdelen as $landsdeel){
    if($landsdeel->regio) $arr[$landsdeel->GM] = $landsdeel->regio;
}

$features = [];
foreach($geojson->features as $key => $feature){
    if($arr[$feature->properties->GM_CODE]){
        $feature->properties->regio = $arr[$feature->properties->GM_CODE];

        $ftxt = file_get_contents("http://www.flagchart.net/f/p/gemeentevlaggen/". substr(str_replace([" ","-",], "", strtolower($feature->properties->GM_NAAM)),0,8) .".gif");
        if($ftxt) {
            $img = fopen($feature->properties->GM_CODE . ".gif", "w");
            fwrite($img, $ftxt);
            fclose($img);
            $feature->properties->imgUrl = "uploads/".$feature->properties->GM_CODE . ".gif";
        }
        $features[] = $feature;
    } else {
    }
}

$f = fopen("regios.json", "w");
fwrite($f, '{"type":"FeatureCollection", "features": '. json_encode($features) ."}");
fclose($f);