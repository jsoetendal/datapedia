<?php
class NodesMapper extends Mapper
{
    public function __construct($db, $media = null) {
        $this->db = $db;
        $this->media = $media;
    }

    function getNodes($type){
        return $this->getNodesExtendedWithLabels($type);

        $rows = $this->db->getArray("SELECT * FROM nodes WHERE type = '". $type ."'");
        return $rows;
    }

    function getNodesExtendedWithLabels($type){
        $rows = $this->db->getArray("SELECT * FROM nodes WHERE type = '". $type ."'");
        $relations = $this->db->getArray("SELECT relations.sourceId, relations.key, target.nodeId, target.title FROM relations JOIN nodes as source ON (relations.sourceId = source.nodeId AND source.type = '". $type ."') JOIN nodes as target ON (relations.targetId = target.nodeId) ORDER BY sourceId, `key`, title");
        $currentId = null;
        $currentKey = null;
        $currentPos = null;
        $arr = null;
        foreach($relations as $relation){
            if($relation->key != $currentKey || $relation->sourceId != $currentId){
                if($arr && $currentPos !== null && $currentKey){
                    $rows[$currentPos]->$currentKey = $arr;
                }
                $arr = [];
                $currentKey = $relation->key;
            }
            if($relation->sourceId != $currentId){
                $currentPos = null;
                foreach($rows as $key => $value){
                    if($value->nodeId == $relation->sourceId){
                        $currentPos = $key;
                        break;
                    }
                }
                $currentId = $relation->sourceId;
            }
            $arr[] = $relation->title;
        }

        //Laatste nog toevoegen:
        if($arr && $currentPos !== null && $currentKey){
            $rows[$currentPos]->$currentKey = $arr;
        }

        return $rows;
    }

    function searchNodes($text){
        $rows = $this->db->getArray("SELECT * FROM nodes WHERE title LIKE '%". $text ."%' OR text LIKE '%". $text ."%' OR path LIKE '%". $text ."%'  OR data LIKE '%". $text ."%'");
        return $rows;
    }

    /**
     * This function will return a node and all its relations
     * @param $nodeId
     * @return mixed
     */
    function getNode($nodeId){
        $node = $this->db->returnFirst("SELECT * FROM nodes WHERE nodeId = '". $nodeId ."'");
        $node->relations = new stdClass();
        $relatedNodes = $this->db->getArray("SELECT * FROM relations JOIN nodes ON (relations.targetId = nodes.nodeId) WHERE sourceId = '". $nodeId ."'");
        foreach($relatedNodes as $relatedNode){
            $key = $relatedNode->key;
            if(!$node->relations->$key) $node->relations->$key = [];
            $relatedNode->data = json_decode($relatedNode->data);
            array_push($node->relations->$key, $relatedNode);
        }
        $node->dependencies = new stdClass();
        $dependentNodes = $this->db->getArray("SELECT * FROM relations JOIN nodes ON (relations.sourceId = nodes.nodeId) WHERE targetId = '". $nodeId ."'");
        foreach($dependentNodes as $dependentNode){
            $key = $dependentNode->key;
            if(!$node->dependencies->$key) $node->dependencies->$key = [];
            $dependentNode->data = json_decode($dependentNode->data);
            array_push($node->dependencies->$key, $dependentNode);
        }
        return $node;
    }

    /**
     * This function will return a node without its relations
     * @param $nodeId
     * @return mixed
     */
    function getNodeSimple($nodeId){
        $node = $this->db->returnFirst("SELECT * FROM nodes WHERE nodeId = '". $nodeId ."'");
        return $node;
    }

    function addNode($data){
        $jsonData = new stdClass();
        $record = [];
        $imgAvailable = false;
        $addRelation = false;
        foreach($data as $key => $val){
            if(in_array($key, ['type','path','title','text','datetime'])) {
                // in node zelf toevoegen
                $record[$key] = escape_string($val);
            }elseif($key == "data"){
                $jsonData = $data[$key];
            }elseif($key == "imgUrl") {
                if (is_array($data["imgUrl"]) || is_object($data["imgUrl"])) {
                    //Object uploaden nadat newId bekend is
                    $imgAvailable = true;
                } else {
                    // gewoon String, in node zelf toevoegen
                    $record[$key] = escape_string($val);
                }
            }elseif($key == "addRelation"){
                //Relatie toevoegen na aanmaken nieuwe node
                $addRelation = ["sourceId" => $val["sourceId"], "key" => $val["relation"]];
            }elseif(in_array($key, ['relations','dependencies'])){
                //Ignore
            } else {
                //in JSON van data zetten
                $jsonData->$key = escape_string($val);
            }
        }
        $record["datetime"] = date("Y-m-d H:i:s");
        $record["data"] = json_encode($jsonData);
        $newId = $this->db->doInsert("nodes", $record);
        if($imgAvailable){
            $imgUrl = $this->uploadImgData($newId, (array)$data["imgUrl"]);
            $this->db->doUpdate("nodes", ["imgUrl" => $imgUrl], ["nodeId" => $newId]);
        }
        if($addRelation){
            $addRelation["targetId"] = $newId;
            $this->addRelation($addRelation);
        }
        return ["nodeId" => $newId];
    }

    function addNodes($data){
        $results = [];
        foreach($data as $node){
            $results[] = $this->addNode($node);
        }
        return $results;
    }

    function saveNode($data){
        $data["data"] = json_encode($data["data"]);
        $arr = (array) $data;

        //find elements with files that need to be uploaded
        foreach($arr as $key => $value){
            if(is_array($value) && array_key_exists("src", $value)){
                $arr[$key] = $this->uploadImgData($data["nodeId"], $value);
            }
        }

        //Ignore elements that do not need to be saved:
        unset($arr["relations"]);
        unset($arr["dependencies"]);
        unset($arr["visible"]);

        $this->db->doUpdate("nodes", $arr, ["nodeId" => $data["nodeId"]]);
    }

    /**
     * adding a relation from $data[sourceId] to $data[targetId] with $data[key]
     * @param $data
     * @return mixed getNodeSimple($data[targetId])
     */

    function addRelation($data){
        $sourceId = intval($data["sourceId"]);
        $targetId = intval($data["targetId"]);
        $key = escape_string($data["key"]);

        $this->db->doInsert("relations",["sourceId" => $sourceId, "targetId" => $targetId, "key" => $key, "datetime" => date("Y-m-d H:i:s")]);

        return $this->getNodeSimple($targetId);
    }

    function deleteRelation($data){
        $sourceId = intval($data["sourceId"]);
        $targetId = intval($data["targetId"]);
        $key = escape_string($data["key"]);

        $this->db->doSQL("DELETE FROM relations WHERE sourceId = ". $sourceId ." AND targetId = ". $targetId ." AND `key` = '". $key ."'");
    }

    /**
     * Data.src as received by browser is uploaded and the url of the uploaded file is returned
     * @param $data
     * @return mixed
     */
    function uploadImgData($nodeId, $data){
        $image_string = str_replace(["data:image/png;base64,","data:image/jpeg;base64,","data:image/jpg;base64,","data:image/gif;base64,"],"",$data["src"]);
        $image_string = base64_decode($image_string);
        $img = imagecreatefromstring($image_string);
        if($img) {
            $directory = $this->media['path'];
            $www = $this->media['www'];

            $filename = $nodeId . "-" . hash('sha256', $nodeId . $data["name"] . $data["size"] . "x!m!6N8g7~KO^X3");

            imagepng($img, $directory . $filename);
            imagedestroy($img);
            return $www . $filename;
        } else {

            return "";
        }
    }


    function getPaths($type){
        $paths = [];
        $rows = $this->db->getArray("SELECT DISTINCT path FROM nodes WHERE type = '". $type ."'");
        foreach($rows as $row){
            foreach(explode(";", $row->path) as $part){
                if(!in_array($part, $paths) && trim($part) != "") $paths[] = $part;
            }
        }
        return $paths;
    }

    function deleteNode($nodeId){
        $this->db->doSQL("DELETE FROM nodes WHERE nodeId = ". $nodeId);
        $this->db->doSQL("DELETE FROM relations WHERE sourceId = ". $nodeId ." OR targetId = ". $nodeId);
    }
}
?>
