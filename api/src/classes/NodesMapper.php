<?php
class NodesMapper extends Mapper
{
    public function __construct($db, $media = null) {
        $this->db = $db;
        $this->media = $media;
    }

    function getNodes($type, $path = null){
        return $this->getNodesExtendedWithLabels($type, $path);

        $rows = $this->db->getArray("SELECT * FROM nodes WHERE type = '". $type ."'");
        return $rows;
    }

    function getNodesExtendedWithLabels($type, $path = null){
        $SQL = "SELECT * FROM nodes WHERE type = '". $type ."'";
        if($path) $SQL .= " AND path LIKE '%". $path ."%'";
        $rows = $this->db->getArray($SQL); //" ORDER BY `path`,`title`");

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
        $rows = $this->db->getArray("SELECT * FROM nodes WHERE type = '". $type ."'"); //" ORDER BY `path`,`title`");

        //Relaties toevoegen
        $relations = $this->db->getArray("SELECT relations.sourceId, relations.key, relations.data as datarelation, target.nodeId, target.path, target.title, target.text, target.imgUrl, target.data FROM relations JOIN nodes as source ON (relations.sourceId = source.nodeId AND source.type = '". $type ."') JOIN nodes as target ON (relations.targetId = target.nodeId) ORDER BY sourceId, `key`, title");
        foreach($relations as $relation) {
            foreach ($rows as $key => $value) {
                if ($value->nodeId == $relation->sourceId) {
                    $currentKey = $relation->key;
                    if (!$rows[$key]->$currentKey) $rows[$key]->$currentKey = [];
                    if(trim($relation->datarelation) != "") $relation->datarelation = json_decode($relation->datarelation);
                    array_push($rows[$key]->$currentKey, $relation);
                }
            }
        }


        //Idem, dependencies toevoegen
        $dependencies = $this->db->getArray("SELECT relations.targetId, relations.key, relations.data as datarelation, source.nodeId, source.path, source.title, source.text, source.imgUrl, source.data FROM relations JOIN nodes as target ON (relations.targetId = target.nodeId AND target.type = '". $type ."') JOIN nodes as source ON (relations.sourceId = source.nodeId) ORDER BY targetId, `key`, title");
        foreach($dependencies as $relation){
            foreach ($rows as $key => $value) {
                if ($value->nodeId == $relation->targetId) {
                    $currentKey = $relation->key;
                    if (!$rows[$key]->$currentKey) $rows[$key]->$currentKey = [];
                    if(trim($relation->datarelation) != "") $relation->datarelation = json_decode($relation->datarelation);
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
        if(!$node || ($node && trim($node->type == ""))){
            //Dit is een suggested node die hier niet gevuld is. Data uit node_versions halen
            $node = $this->db->returnFirst("SELECT * FROM nodes_versions WHERE nodeId = '". $nodeId ."' ORDER BY nodeVersionId DESC");
        }
        if($node) {
            $node->relations = new stdClass();
            $relatedNodes = $this->db->getArray("SELECT *, nodes.data as data, relations.data as datarelation FROM relations JOIN nodes ON (relations.targetId = nodes.nodeId) WHERE sourceId = '" . $nodeId . "'");
            foreach ($relatedNodes as $relatedNode) {
                $key = $relatedNode->key;
                if (!$node->relations->$key) $node->relations->$key = [];
                $relatedNode->data = json_decode($relatedNode->data);
                $relatedNode->datarelation = json_decode($relatedNode->datarelation);
                $relatedNode->visible = true;
                array_push($node->relations->$key, $relatedNode);
            }
            $node->dependencies = new stdClass();
            $dependentNodes = $this->db->getArray("SELECT *, nodes.data as data, relations.data as datarelation FROM relations JOIN nodes ON (relations.sourceId = nodes.nodeId) WHERE targetId = '" . $nodeId . "'");
            foreach ($dependentNodes as $dependentNode) {
                $key = $dependentNode->key;
                if (!$node->dependencies->$key) $node->dependencies->$key = [];
                $dependentNode->data = json_decode($dependentNode->data);
                $dependentNode->datarelation = json_decode($dependentNode->datarelation);
                $dependentNode->visible = true;
                array_push($node->dependencies->$key, $dependentNode);
            }
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

    function getNodeHistory($nodeId){
        $rows = $this->db->getArray("SELECT nodes_versions.*, creator.name as creatorName, creator.role as creatorRole, updater.name as updaterName, updater.role as updaterRole FROM nodes_versions LEFT JOIN users as creator ON (nodes_versions.creatorId = creator.id) LEFT JOIN users as updater ON(nodes_versions.updaterId = updater.id) WHERE nodes_versions.nodeId = '". $nodeId ."' ORDER BY nodes_versions.updated");
        foreach($rows as $key => $row){
            $rows[$key]->userData = json_decode($row->userData);
        }
        return $rows;
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

    function addNodes($data, $token){
        $results = [];
        foreach($data as $node){
            $results[] = $this->addNode($node, $token);
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
        $relations = $arr["relations"];
        $dependencies = $arr["dependencies"];
        unset($arr["relations"]);
        unset($arr["dependencies"]);
        unset($arr["geo"]);
        unset($arr["visible"]);

        $arr["updated"] = date("Y-m-d H:i:s");
        $arr["updaterId"] = max(0, $token->getUserId());

        if($token->isLoggedIn($data["nodeId"]) && ($arr["status"] != "suggested" || $token->isEditorOrUp($data["nodeId"]))) {
            $status = $arr["status"];
            unset($arr["status"]);
            $this->db->doUpdate("nodes", $arr, ["nodeId" => $data["nodeId"]]);
            $this->db->doSQL("UPDATE nodes_versions SET status='previous' WHERE nodeId = '". $data["nodeId"]. "' AND (status = 'current' OR status = '". $status."')"); //Laatste indien huidige status suggested is
            $arr["status"] = "current";
            $this->db->doInsert("nodes_versions", $arr);
            foreach($relations as $key => $rels){
                foreach($rels as $relation){
                    if($relation["datarelation"]){
                        $json = json_encode($relation["datarelation"]);
                        $this->db->doSQL("UPDATE relations SET data = '". $json ."' WHERE sourceId = ". $relation["sourceId"] ." AND targetId = ". $relation["targetId"] ." AND `key` = '". $key ."'");
                    }
                }
            }
            foreach($dependencies as $key => $rels){
                foreach($rels as $relation){
                    if($relation["datarelation"]){
                        $json = json_encode($relation["datarelation"]);
                        $this->db->doSQL("UPDATE relations SET data = '". $json ."' WHERE sourceId = ". $relation["sourceId"] ." AND targetId = ". $relation["targetId"] ." AND `key` = '". $key ."'");
                    }
                }
            }
        } else {
            $arr["status"] = "suggested";
            $record["userData"] = json_encode($this->getUserData());
            $this->db->doInsert("nodes_versions", $arr);
        }
    }


    function addRelationOrDependency($data, $token){
        $sourceId = intval($data["sourceId"]);
        $targetId = intval($data["targetId"]);
        $key = escape_string($data["key"]);

        $creatorId = max(0, $token->getUserId()); //Wordt 0 als er geen userId is.

        if($token->isContributorOrUp($sourceId)) {
            $this->db->doInsert("relations", ["sourceId" => $sourceId, "targetId" => $targetId, "key" => $key, "datetime" => date("Y-m-d H:i:s")]);
            $this->db->doInsert("relations_versions", ["sourceId" => $sourceId, "targetId" => $targetId, "key" => $key, "datetime" => date("Y-m-d H:i:s"), "creatorId" => $creatorId, "status" => "current"]);
        } else {
            $this->db->doInsert("relations_versions", ["sourceId" => $sourceId, "targetId" => $targetId, "key" => $key, "datetime" => date("Y-m-d H:i:s"), "creatorId" => $creatorId, "status" => "suggested"]);
        }
    }


    /**
     * adding a relation from $data[sourceId] to $data[targetId] with $data[key]
     * @param $data
     * @return mixed getNodeSimple($data[targetId])
     */

    function addRelation($data, $token){
        $this->addRelationOrDependency($data, $token);

        $targetId = intval($data["targetId"]);
        return $this->getNodeSimple($targetId);
    }

    /**
     * adding a relation from $data[sourceId] to $data[targetId] with $data[key]
     * @param $data
     * @return mixed getNodeSimple($data[sourceId])
     */

    function addDependency($data, $token){
        $this->addRelationOrDependency($data, $token);

        $sourceId = intval($data["sourceId"]);
        return $this->getNodeSimple($sourceId);
    }

    function setRelation($data, $token){
        $sourceId = intval($data["sourceId"]);
        $targetId = intval($data["targetId"]);
        $key = escape_string($data["key"]);
        $data = json_encode($data["data"]);

        $creatorId = max(0, $token->getUserId()); //Wordt 0 als er geen userId is.

        if($token->isContributorOrUp($sourceId)) {
            $this->db->doUpsert("relations", ["data" => $data, "sourceId" => $sourceId, "targetId" => $targetId, "key" => $key]);
            $this->db->doInsert("relations_versions", ["sourceId" => $sourceId, "targetId" => $targetId, "key" => $key, "data" => $data, "datetime" => date("Y-m-d H:i:s"), "creatorId" => $creatorId, "status" => "current"]);
        } else {
            $this->db->doInsert("relations_versions", ["sourceId" => $sourceId, "targetId" => $targetId, "key" => $key, "data" => $data, "datetime" => date("Y-m-d H:i:s"), "creatorId" => $creatorId, "status" => "suggested"]);
        }
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
        $this->db->doSQL("UPDATE nodes_versions SET status='deleted', updated=NOW() WHERE nodeId = ". $nodeId ." AND status = 'current'");
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


    function getSuggestions(){
        $rows = $this->db->getArray("SELECT * FROM nodes_versions WHERE status = 'suggested' ORDER BY GREATEST(COALESCE(created,0), COALESCE(updated,0)) DESC LIMIT 0,50");
        return $rows;
    }

    function getUpdates(){
        $rows = $this->db->getArray("SELECT * FROM nodes_versions WHERE status = 'current' ORDER BY GREATEST(COALESCE(created,0), COALESCE(updated,0)) DESC LIMIT 0,100");
        return $rows;
    }

    function getDeleted(){
        $rows = $this->db->getArray("SELECT * FROM nodes_versions WHERE status = 'deleted' AND updated > '". date("Y-m-d h:i:s", strtotime("-30days")) ."' ORDER BY updated DESC LIMIT 0,50");
        return $rows;
    }

    function historyApprove($nodeVersionId){
        $nodeVersion = $this->db->returnFirst("SELECT * FROM nodes_versions WHERE nodeVersionId = ". $nodeVersionId);
        if($nodeVersion){
            $arr = (array) $nodeVersion;
            unset($arr["nodeVersionId"]);
            unset($arr["status"]);
            if(trim($arr["updated"]) == "") $arr["updated"] = date("Y-m-d H:i:s");
            if(trim($arr["updaterId"]) == "") $arr["updaterId"] = 0;

            $arr["path"] = $this->db->escape($arr["path"]);
            $arr["title"] = $this->db->escape($arr["title"]);
            $arr["text"] = $this->db->escape($arr["text"]);

            $this->db->doUpsert("nodes", $arr);

            $this->db->doSQL("UPDATE nodes_versions SET status = 'previous' WHERE nodeId = ". $nodeVersion->nodeId ." AND status = 'current'");
            $this->db->doSQL("UPDATE nodes_versions SET status = 'current' WHERE nodeVersionId = ". $nodeVersionId);

            $relations = $this->db->getArray("SELECT * FROM relations_versions WHERE (targetId = ". $nodeVersion->nodeId ." OR sourceId = ". $nodeVersion->nodeId .") AND status = 'suggested'");
            foreach($relations as $relation){
                $arr = (array) $relation;
                unset($arr["status"]);
                unset($arr["creatorId"]);
                $this->db->doUpsert("relations", $arr);
            }
            $this->db->doSQL("UPDATE relations_versions SET status = 'current' WHERE (targetId = ". $nodeVersion->nodeId ." OR sourceId = ". $nodeVersion->nodeId .") AND status = 'suggested'");
        }
    }

    function historyRevert($nodeVersionId){
        $this->historyApprove($nodeVersionId);
    }

    function historyDelete($nodeVersionId){
        $this->db->doSQL("DELETE FROM nodes_versions WHERE nodeVersionId = ". $nodeVersionId ." AND status != 'current'");
    }

}
?>
