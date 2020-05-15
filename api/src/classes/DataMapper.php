<?php
class DataMapper extends Mapper
{
    public function __construct($db, $media = null)
    {
        $this->db = $db;
        $this->media = $media;
    }

    function getDataOverheidSearch($q){
        $json = json_decode(file_get_contents("https://data.overheid.nl/data/api/3/action/package_search?rows=50&q=" . urlencode($q)));
        $result = $json->result->results;

        return $result;
    }

    function getDataOverheidSet($id){
        $json = json_decode(file_get_contents("https://data.overheid.nl/data/api/3/action/package_show?id=" . $id));
        $result = $json->result;
        return $result;
    }
}