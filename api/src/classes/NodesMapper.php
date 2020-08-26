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

        //Relaties toevoegen
        $relations = $this->db->getArray("SELECT relations.sourceId, relations.key, target.nodeId, target.title FROM relations JOIN nodes as source ON (relations.sourceId = source.nodeId AND source.type = '". $type ."') JOIN nodes as target ON (relations.targetId = target.nodeId) ORDER BY sourceId, `key`, title");
        foreach($relations as $relation) {
            foreach ($rows as $key => $value) {
                if ($value->nodeId == $relation->sourceId) {
                    $currentKey = $relation->key;
                    if (!$rows[$key]->$currentKey) $rows[$key]->$currentKey = [];
                    array_push($rows[$key]->$currentKey, $relation->title);
                }
            }
        }


        //Idem, dependencies toevoegen
        $dependencies = $this->db->getArray("SELECT relations.targetId, relations.key, source.nodeId, source.title FROM relations JOIN nodes as target ON (relations.targetId = target.nodeId AND target.type = '". $type ."') JOIN nodes as source ON (relations.sourceId = source.nodeId) ORDER BY targetId, `key`, title");
        foreach($dependencies as $relation){
            foreach ($rows as $key => $value) {
                if ($value->nodeId == $relation->targetId) {
                    $currentKey = $relation->key;
                    if (!$rows[$key]->$currentKey) $rows[$key]->$currentKey = [];
                    array_push($rows[$key]->$currentKey, $relation->title);
                }
            }
        }


        return $rows;
    }

    /**
     * Returns extended Node: each node has an extra field for each relation and dependency, named after the key and consisting of an array with all related nodes (including path, title, text, imgUrl and data)
     * @param $type
     * @return mixed
     */
    function getNodesExtended($type){
        $rows = $this->db->getArray("SELECT * FROM nodes WHERE type = '". $type ."'");

        //Relaties toevoegen
        $relations = $this->db->getArray("SELECT relations.sourceId, relations.key, target.nodeId, target.path, target.title, target.text, target.imgUrl, target.data FROM relations JOIN nodes as source ON (relations.sourceId = source.nodeId AND source.type = '". $type ."') JOIN nodes as target ON (relations.targetId = target.nodeId) ORDER BY sourceId, `key`, title");
        foreach($relations as $relation) {
            foreach ($rows as $key => $value) {
                if ($value->nodeId == $relation->sourceId) {
                    $currentKey = $relation->key;
                    if (!$rows[$key]->$currentKey) $rows[$key]->$currentKey = [];
                    array_push($rows[$key]->$currentKey, $relation);
                }
            }
        }


        //Idem, dependencies toevoegen
        $dependencies = $this->db->getArray("SELECT relations.targetId, relations.key, source.nodeId, source.path, source.title, source.text, source.imgUrl, source.data FROM relations JOIN nodes as target ON (relations.targetId = target.nodeId AND target.type = '". $type ."') JOIN nodes as source ON (relations.sourceId = source.nodeId) ORDER BY targetId, `key`, title");
        foreach($dependencies as $relation){
            foreach ($rows as $key => $value) {
                if ($value->nodeId == $relation->targetId) {
                    $currentKey = $relation->key;
                    if (!$rows[$key]->$currentKey) $rows[$key]->$currentKey = [];
                    array_push($rows[$key]->$currentKey, $relation);
                }
            }
        }
        return $rows;
    }


    /**
     * Returns for a specific relation (defined by $key), all Nodes that are 'source' for this relation, including a '<$key>' field including al target Nodes for this relation.
     * N.b: It only returns nodes if they have one or more '<$key>' target Nodes
     * @param $key
     */
    function getRelationNodes($key){
        $nodes = $this->db->getArray("SELECT DISTINCT nodes.* FROM nodes JOIN relations ON (relations.sourceId = nodes.nodeId) WHERE relations.key = '". $key ."'");
        foreach($nodes as $nodeKey => $node){
            $nodes[$nodeKey]->$key = [];
        }

        $subs = $this->db->getArray("SELECT nodes.*, relations.sourceId FROM nodes JOIN relations ON (relations.targetId = nodes.nodeId) WHERE relations.key = '". $key ."'");
        foreach($subs as $sub){
            foreach($nodes as $nodeKey => $node){
                if($node->nodeId == $sub->sourceId){
                    unset($sub->sourceId);
                    array_push($nodes[$nodeKey]->$key, $sub);
                }
            }
        }

        return $nodes;
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
        if($node && trim($node->type == "")){
            //Dit is een suggested node die hier niet gevuld is. Data uit node_versions halen
            $node = $this->db->returnFirst("SELECT * FROM nodes_versions WHERE nodeId = '". $nodeId ."' ORDER BY nodeVersionId DESC");
        }
        $node->relations = new stdClass();
        $relatedNodes = $this->db->getArray("SELECT * FROM relations JOIN nodes ON (relations.targetId = nodes.nodeId) WHERE sourceId = '". $nodeId ."'");
        foreach($relatedNodes as $relatedNode){
            $key = $relatedNode->key;
            if(!$node->relations->$key) $node->relations->$key = [];
            $relatedNode->data = json_decode($relatedNode->data);
            $relatedNode->visible = true;
            array_push($node->relations->$key, $relatedNode);
        }
        $node->dependencies = new stdClass();
        $dependentNodes = $this->db->getArray("SELECT * FROM relations JOIN nodes ON (relations.sourceId = nodes.nodeId) WHERE targetId = '". $nodeId ."'");
        foreach($dependentNodes as $dependentNode){
            $key = $dependentNode->key;
            if(!$node->dependencies->$key) $node->dependencies->$key = [];
            $dependentNode->data = json_decode($dependentNode->data);
            $dependentNode->visible = true;
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
        if($node && trim($node->type == "")){
            //Dit is een suggested node die hier niet gevuld is. Data uit node_versions halen
            $node = $this->db->returnFirst("SELECT * FROM nodes_versions WHERE nodeId = '". $nodeId ."' ORDER BY nodeVersionId DESC");
        }
        return $node;
    }

    function addNode($data, $token){
        $jsonData = new stdClass();
        $record = [];
        $imgAvailable = false;
        $addRelation = false;
        foreach($data as $key => $val){
            if(in_array($key, ['type','path','title','text','created','updated'])) {
                // in node zelf toevoegen
                //$record[$key] = escape_string($val);
                $record[$key] = $this->db->escape($val);
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
            }elseif(in_array($key, ['relations','dependencies','nodeVersionId'])){
                //Ignore
            } else {
                //in JSON van data zetten
                $jsonData->$key = escape_string($val);
            }
        }
        $record["created"] = date("Y-m-d H:i:s");
        $record["creatorId"] = max(0, $token->getUserId()); //Wordt 0 als er geen userId is.
        $record["data"] = json_encode($jsonData);

        if($token->isLoggedIn()) {
            // Ingelogde user: meteen opnemen in nodes
            $newId = $this->db->doInsert("nodes", $record);
            $record["status"] = "current";
            $record["nodeId"] = $newId;
            $this->db->doInsert("nodes_versions", $record);
            if ($imgAvailable) {
                $imgUrl = $this->uploadImgData($newId, (array)$data["imgUrl"]);
                $this->db->doUpdate("nodes", ["imgUrl" => $imgUrl], ["nodeId" => $newId]);
                $this->db->doUpdate("nodes_versions", ["imgUrl" => $imgUrl], ["nodeId" => $newId]);
            }
            if ($addRelation) {
                $addRelation["targetId"] = $newId;
                $this->addRelation($addRelation, $token);
            }
            return ["nodeId" => $newId];
        } else {
            // Geen ingelogde user: alleen als suggestie opnemen in nodes_versions
            //Een lege node maken om de plaats vast te reserveren in de database:
            $newId = $this->db->doInsert("nodes", []);
            $record["nodeId"] = $newId;
            $record["status"] = "suggested";
            $record["userData"] = json_encode($this->getUserData());
            $this->db->doInsert("nodes_versions", $record);
            if ($imgAvailable) {
                $imgUrl = $this->uploadImgData($newId, (array)$data["imgUrl"]);
                $this->db->doUpdate("nodes_versions", ["imgUrl" => $imgUrl], ["nodeId" => $newId]);
            }
            if ($addRelation) {
                $addRelation["targetId"] = $newId;
                $this->addRelation($addRelation, $token);
            }
            return ["nodeId" => $newId];
        }
    }

    function addNodes($data){
        $results = [];
        foreach($data as $node){
            $results[] = $this->addNode($node);
        }
        return $results;
    }

    function saveNode($data, $token){
        $data["data"] = json_encode($data["data"]);
        $arr = (array) $data;

        //find elements with files that need to be uploaded
        foreach($arr as $key => $value){
            if(is_array($value) && array_key_exists("src", $value)){
                $arr[$key] = $this->uploadImgData($data["nodeId"], $value);
            }
        }

        //Ignore elements that do not need to be saved:
        unset($arr["nodeVersionId"]);
        unset($arr["relations"]);
        unset($arr["dependencies"]);
        unset($arr["visible"]);

        $arr["updated"] = date("Y-m-d H:i:s");
        $arr["updaterId"] = max(0, $token->getUserId());

        if($token->isLoggedIn() && ($arr["status"] != "suggested" || $token->isEditorOrUp())) {
            $status = $arr["status"];
            unset($arr["status"]);
            $this->db->doUpdate("nodes", $arr, ["nodeId" => $data["nodeId"]]);
            $this->db->doSQL("UPDATE nodes_versions SET status='previous' WHERE nodeId = '". $data["nodeId"]. "' AND (status = 'current' OR status = '". $status."')"); //Laatste indien huidige status suggested is
            $arr["status"] = "current";
            $this->db->doInsert("nodes_versions", $arr);
        } else {
            $arr["status"] = "suggested";
            $record["userData"] = json_encode($this->getUserData());
            $this->db->doInsert("nodes_versions", $arr);
        }
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
        $this->db->doSQL("UPDATE nodes_versions SET status='deleted' WHERE nodeId = ". $nodeId ." AND status = 'current'");
    }

    function getUserData(){
        $result = new StdClass();

        foreach (array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR') as $key){
            if (array_key_exists($key, $_SERVER) === true){
                foreach (explode(',', $_SERVER[$key]) as $ip){
                    $ip = trim($ip); // just to be safe

                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false){
                        $result->ip = $ip;
                        break;
                    }
                }
            }
        }

        if(isset($_SERVER['HTTP_USER_AGENT'])) {
            $result->useragent = $_SERVER['HTTP_USER_AGENT'];
        }
        return $result;
    }
}
?>
