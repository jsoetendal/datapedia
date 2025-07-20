<?php
class NodesMapper extends Mapper
{
    public function __construct($db, $media = null) {
        $this->db = $db;
        $this->media = $media;
    }

    function hasAccess($type, $role){
        $settings = json_decode(file_get_contents( getenv('CONFIG_SETTINGS_PATH')));
        foreach($settings->content->entities as $entity){
            if($entity->type === $type){
                if(!$entity->restricted){
                    return true;
                } else {
                    return in_array($role, $entity->restricted);
                }
            }
        }
        return false;
    }

    function canCreate($type, $role){
        $settings = json_decode(file_get_contents( getenv('CONFIG_SETTINGS_PATH')));
        foreach($settings->content->entities as $entity){
            if($entity->type === $type){
                if(!$entity->creation){
                    return true;
                } else {
                    return in_array($role, $entity->creation);
                }
            }
        }
        return false;
    }

    function hasAccessNodeId($nodeId, $role){
        return $this->hasAccess($this->db->returnQuery("SELECT type as result FROM nodes WHERE nodeId = ". $nodeId), $role);
    }

    function getNodes($type, $path = null, $parentkey = null){
        return $this->getNodesExtendedWithLabels($type, $path, $parentkey);
    }

    function getNodesExtendedWithLabels($type, $path = null, $parentkey = null){
        $SQL = "SELECT nodeId, type, `key`, parentkey, path, title, text, imgUrl, data, created, creatorId, updated, updaterId FROM nodes WHERE type = '". $type ."'"; //All columns except userData
        if($path) $SQL .= " AND path LIKE '%". $path ."%'";
        if($parentkey){
            $SQL .= " AND parentkey = '". $parentkey ."'";
        } else {
            $SQL .= " AND (parentkey IS NULL OR parentkey = '')";
        }
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
                    if(trim($relation->datarelation) != "") $relation->datarelation = json_decode(str_replace(["\n","\r"],"",$relation->datarelation));
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
                    if(trim($relation->datarelation) != "") $relation->datarelation = json_decode(str_replace(["\n","\r"],"",$relation->datarelation));
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
            $relatedNodes = $this->db->getArray("SELECT *, relations.key as `key`, nodes.data as data, relations.data as datarelation FROM relations JOIN nodes ON (relations.targetId = nodes.nodeId) WHERE sourceId = '" . $nodeId . "'");
            foreach ($relatedNodes as $relatedNode) {
                $key = $relatedNode->key;
                if (!$node->relations->$key) $node->relations->$key = [];
                $relatedNode->data = json_decode(str_replace(["\n","\r"],"",$relatedNode->data));
                $relatedNode->datarelation = json_decode(str_replace(["\n","\r"],"",$relatedNode->datarelation));
                $relatedNode->visible = true;
                array_push($node->relations->$key, $relatedNode);
            }
            $node->dependencies = new stdClass();
            $dependentNodes = $this->db->getArray("SELECT *, relations.key as `key`, nodes.data as data, relations.data as datarelation FROM relations JOIN nodes ON (relations.sourceId = nodes.nodeId) WHERE targetId = '" . $nodeId . "'");
            foreach ($dependentNodes as $dependentNode) {
                $key = $dependentNode->key;
                if (!$node->dependencies->$key) $node->dependencies->$key = [];
                $dependentNode->data = json_decode(str_replace(["\n","\r"],"",$dependentNode->data));
                $dependentNode->datarelation = json_decode(str_replace(["\n","\r"],"",$dependentNode->datarelation));
                $dependentNode->visible = true;
                array_push($node->dependencies->$key, $dependentNode);
            }
        }
        return $node;
    }

    function getNodeByKey($key){
        $nodeId = $this->db->returnQuery("SELECT nodeId as result FROM nodes WHERE `key` = '". $key ."'");
        return $this->getNode($nodeId);
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
        $result = new stdClass();
        $result->nodes = $rows;

        $result->relations = $this->db->getArray("SELECT relations_versions.*, nodes.title as title, creator.name as creatorName, creator.role as creatorRole FROM relations_versions LEFT JOIN nodes ON (nodes.nodeId = relations_versions.targetId) LEFT JOIN users as creator ON (relations_versions.creatorId = creator.id) WHERE relations_versions.sourceId = '". $nodeId ."' ORDER BY relations_versions.targetId, relations_versions.datetime");
        $result->dependencies = $this->db->getArray("SELECT relations_versions.*, nodes.title as title, creator.name as creatorName, creator.role as creatorRole FROM relations_versions LEFT JOIN nodes ON (nodes.nodeId = relations_versions.sourceId) LEFT JOIN users as creator ON (relations_versions.creatorId = creator.id) WHERE relations_versions.targetId = '". $nodeId ."' ORDER BY relations_versions.sourceId, relations_versions.datetime");

        return $result;
    }


    function addNode($data, $token){
        $jsonData = new stdClass();
        $record = [];
        $imgAvailable = false;
        $addRelation = false;
        foreach($data as $key => $val){
            if(in_array($key, ['type','path','title','text','created','updated','parentkey','key'])) {
                // in node zelf toevoegen
                //$record[$key] = escape_string($val);
                //$record[$key] = $this->db->escape($val);
                $record[$key] = $val;
            }elseif($key == "data"){
                $jsonData = $data[$key];
                if($jsonData["attachments"]){
                    $attachments = $jsonData["attachments"];
                    unset($jsonData["attachments"]); //Should not be added to record, should be uploaded first
                }
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
                if(is_array($val) || is_object($val)){
                    $jsonData->$key = escape_string(json_encode($val));
                } else {
                    $jsonData->$key = escape_string($val);
                }
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
            //Upload new attachments
            if($attachments && count($attachments) > 0){
                $jsonData["attachments"] = $attachments; //Add to jsonData again
                foreach($jsonData["attachments"] as $key => $att){
                    if($att["src"]) {
                        $jsonData["attachments"][$key]["hash"] = $this->uploadFileData($newId, $att);
                        //in node.controller->setAttachments() wordt de url automatisch gezet
                        unset($jsonData["attachments"][$key]["src"]);
                    }
                }
                $this->db->doUpdate("nodes", ["data" => json_encode($jsonData)],["nodeId" => $newId]);
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
        //Upload new attachments
        if($data["data"]["attachments"] && count($data["data"]["attachments"]) > 0){
            foreach($data["data"]["attachments"] as $key => $att){
                if($att["src"]) {
                    $data["data"]["attachments"][$key]["hash"] = $this->uploadFileData($data["nodeId"], $att);
                    unset($data["data"]["attachments"][$key]["src"]);
                }
            }
        }

        if($data["modules"]){
            if(!$data["data"]) $data["data"] = new stdClass();
            $data["data"]["modules"] = $data["modules"];
            unset($data["modules"]);
        }
        $data["data"] = json_encode($data["data"]);
        $arr = (array) $data;
        //print_r($arr); exit();

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
        unset($arr["date"]);
        unset($arr["dateYear"]);
        unset($arr["dateMonth"]);
        unset($arr["dateHistoric"]);
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
        } else {
            $arr["status"] = "suggested";
            $arr["userData"] = json_encode($this->getUserData());
            $this->db->doInsert("nodes_versions", $arr);
        }
        $current_relations = $this->db->getArray("SELECT * FROM relations WHERE sourceId = '". $data["nodeId"] ."' OR targetId = '". $data["nodeId"]. "'");
        foreach($relations as $key => $rels){
            foreach($rels as $relation){
                $this->updateRelation($key, $relation, $current_relations, $token);
            }
        }
        foreach($dependencies as $key => $rels){
            foreach($rels as $relation){
                $this->updateRelation($key, $relation, $current_relations, $token);
            }
        }
    }


    function addRelationOrDependency($data, $token){
        $sourceId = intval($data["sourceId"]);
        $targetId = intval($data["targetId"]);
        $key = escape_string($data["key"]);

        $creatorId = max(0, $token->getUserId()); //Wordt 0 als er geen userId is.

        $relations_versions_arr = ["sourceId" => $sourceId, "targetId" => $targetId, "key" => $key, "datetime" => date("Y-m-d H:i:s"), "creatorId" => $creatorId];
        if($data["data"]) $relations_versions_arr["data"] = json_encode($data["data"]);

        if($token->isContributorOrUp($sourceId)) {
            $relations_arr = ["sourceId" => $sourceId, "targetId" => $targetId, "key" => $key, "datetime" => date("Y-m-d H:i:s")];
            if($data["data"]) $relations_arr["data"] = json_encode($data["data"]);
            $this->db->doInsert("relations", $relations_arr);
            $relations_versions_arr["status"] = "current";
        } else {
            $relations_versions_arr["status"] = "suggested";
        }
        $this->db->doInsert("relations_versions", $relations_versions_arr);
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

    function updateRelation($key, $relation, $current_relations, $token){
        $current_relation = null;
        foreach($current_relations as $r){
            if($r->sourceId == $relation["sourceId"] && $r->targetId == $relation["targetId"] && $r->key == $key){
                $current_relation = $r;
            }
        }
        if(!$current_relation){
            //Should not happen since relation is added first before saved. But does happen if not logged in/for suggestions:
            $relation["data"] = $relation["datarelation"];
            $this->addRelationOrDependency($relation, $token);
        } else {
            $current_data = $current_relation->data; //= json encoded
            if($relation["datarelation"] && $current_data != json_encode($relation["datarelation"])){
                $json = json_encode($relation["datarelation"]);

                if($token->isContributorOrUp($relation["sourceId"])) {
                    $this->db->doSQL("UPDATE relations SET data = '" . $this->db->escape($json) . "' WHERE sourceId = " . $relation["sourceId"] . " AND targetId = " . $relation["targetId"] . " AND `key` = '" . $key . "'");
                    //Set current relations_version to previous
                    $this->db->doSQL("UPDATE relations_versions SET status = 'previous' WHERE sourceId = ". $relation["sourceId"] ." AND targetId = ". $relation["targetId"] ." AND `key` = '". $key ."' AND status = 'current'");
                    $status = "current";
                } else {
                    $status = "suggested";
                }

                //Insert new current relations_version
                $arr = ["sourceId" => $relation["sourceId"], "targetId" => $relation["targetId"], "key" => $key, "data" => $json, "status" => $status, "datetime" => date("Y-m-d H:i:s"), "creatorId" => max(0, $token->getUserId())];
                $this->db->doInsert("relations_versions", $arr);
            }
        }
    }

    function setRelation($data, $token){
        $sourceId = intval($data["sourceId"]);
        $targetId = intval($data["targetId"]);
        $key = escape_string($data["key"]);
        $data = json_encode($data["data"]);

        $creatorId = max(0, $token->getUserId()); //Wordt 0 als er geen userId is.

        if($token->isContributorOrUp($sourceId)) {
            $this->db->doUpsert("relations", ["data" => $data, "sourceId" => $sourceId, "targetId" => $targetId, "key" => $key, "datetime" => date("Y-m-d H:i:s")]);
            $this->db->doSQL("UPDATE relations_versions SET status = 'previous' WHERE sourceId = ". $sourceId ." AND targetId = ". $targetId ." AND `key` = '". $key ."' AND status = 'current'");
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
        $this->db->doSQL("UPDATE relations_versions SET status = 'deleted' WHERE sourceId = ". $sourceId ." AND targetId = ". $targetId ." AND `key` = '". $key ."' AND status = 'current'");
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

    /**
     * Data.src as received by browser is uploaded and the url of the uploaded file is returned
     * @param $data
     * @return mixed
     */
    function uploadFileData($nodeId, $data){
        $directory = $this->media['path'];
        $www = $this->media['www'];

        $filename = $nodeId . "-" . hash('sha256', $nodeId . $data["name"] . $data["size"] . "x!m!6N8g7~KO^X3");
        // open the output file for writing
        $ifp = fopen($directory . $filename, 'wb');

        // split the string on commas
        // $data[ 0 ] == "data:image/png;base64"
        // $data[ 1 ] == <actual base64 string>
        $src = explode( ',', $data["src"]);

        // we could add validation here with ensuring count( $data ) > 1
        fwrite($ifp, base64_decode($src[1]));

        // clean up the file resource
        fclose($ifp);
        return $filename;
    }

    function outputAttachment($nodeId, $url){
        $node = $this->db->returnFirst("SELECT * FROM nodes WHERE nodeId = '". $nodeId ."'");
        $data = json_decode(str_replace(["\n","\r"],"",$node->data));
        if($data && $data->attachments){
            foreach($data->attachments as $att){
                if($att->hash == $url){
                    header("Content-Disposition: attachment; filename=\"". $att->name . "\"");
                    header("Content-Type: ". $att->type);
                    header("Content-Length: ". $att->size);
                    $fname = $this->media['path'] . $att->hash;
                    $f = fopen($fname,"rb");
                    $contents = fread($f, filesize($fname));
                    fclose($f);
                    echo $contents;
                    exit();
                }
            }
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
        $this->db->doSQL("DELETE FROM relations_versions WHERE (sourceId = ". $nodeId ." OR targetId = ". $nodeId .") AND status = 'deleted'"); //Verwijder relaties die al verwijderd waren. TODO: Deze netjes bewaren en bij een revert ook weer als deleted terugzetten.
        $this->db->doSQL("UPDATE relations_versions SET status='deleted' WHERE (sourceId = ". $nodeId ." OR targetId = ". $nodeId .") AND status = 'current'"); //Zet huidige relaties op deleted, zodat die bij evt. revert weer netjes worden meegenomen
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
        $result = new stdClass();
        $result->nodes = $this->db->getArray("SELECT * FROM nodes_versions WHERE status = 'suggested' ORDER BY GREATEST(COALESCE(created,0), COALESCE(updated,0)) DESC LIMIT 0,50");
        $result->relations = $this->db->getArray("SELECT relations_versions.*, nodeSource.title as source, nodeTarget.title as target FROM relations_versions JOIN nodes as nodeSource ON (nodeSource.nodeId = relations_versions.sourceID) JOIN nodes as nodeTarget ON (nodeTarget.nodeId = relations_versions.targetId) WHERE status = 'suggested' ORDER BY datetime DESC LIMIT 0,50");
        return $result;
    }

    function getUpdates(){
        $rows = $this->db->getArray("SELECT * FROM nodes_versions WHERE status = 'current' ORDER BY GREATEST(COALESCE(created,0), COALESCE(updated,0)) DESC LIMIT 0,100");
        return $rows;
    }

    function getDeleted(){
        $rows = $this->db->getArray("SELECT * FROM nodes_versions WHERE status = 'deleted' AND updated > '". date("Y-m-d H:i:s", strtotime("-30days")) ."' ORDER BY updated DESC LIMIT 0,50");
        return $rows;
    }

    function getLinksFromObject($obj){
        $result = [];
        $pattern = '~[a-z]+://\S+~';
        foreach($obj as $key => $value){
            if(is_object($value) || is_array($value)){
                $links = $this->getLinksFromObject($value);
                $result = array_merge($result, $links ?? []);
            } else {
                if (preg_match($pattern, $value) || strtolower(substr($value, 0, 4)) == "http" || strtolower(substr($value, 0, 4)) == "www") {
                    $result[] = $value;
                }
            }
        }
        return $result;
    }

    function getLinkHeaders($url){
        $result = new stdClass();
        $result->url = $url;
        $result->headers = get_headers($url);
        $result->code = intval(substr($result->headers[0], 9, 3));
        $result->description = substr($result->headers[0], 13);
        if($result->code >= 300 && $result->code < 400){
            foreach($result->headers as $header){
                list($key, $value) = explode(":", $header,2);
                if(strtolower($key) == "location"){
                    $result->location = trim($value);
                }
            }
        }
        return $result;
    }

    function getLinks(){
        $result = [];
        $rows = $this->db->getArray("SELECT nodeId, type, title, text, data FROM nodes WHERE text LIKE '%href%' OR DATA LIKE '%http%' OR DATA LIKE '%www%' ORDER BY nodeId DESC");
        foreach($rows as $row){
            $row->links = [];
            $pattern = '/<a href=\"([^\"]*)\">(.*)<\/a>/iU';
            if($num_found = preg_match_all($pattern, $row->text, $out))
            {
                foreach($out[1] as $link){
                    if(substr($link,0,1) != "/" && strtolower(substr($link,0,6)) != "mailto") { //Filter internal links
                        $row->links[] = $link;
                    }
                }
                $data = json_decode($row->data);
                $links = $this->getLinksFromObject($data);
                $row->links = array_merge($row->links, $links ?? []);
            }
            unset($row->text);
            unset($row->data);
            if(count($row->links) > 0) {
                $result[] = $row;
            }
        }
        return $result;
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
            $this->db->doSQL("UPDATE nodes_versions SET status = 'previous' WHERE nodeId = ". $nodeVersion->nodeId ." AND status = 'suggested' AND nodeVersionId < ". $nodeVersionId);
            $this->db->doSQL("UPDATE nodes_versions SET status = 'current' WHERE nodeVersionId = ". $nodeVersionId);

            if($nodeVersion->status == "deleted"){
                $this->db->doSQL("UPDATE relations_versions SET status = 'current' WHERE (targetId = ". $nodeVersion->nodeId ." OR sourceId = ". $nodeVersion->nodeId .") AND status = 'deleted'");
            } else {
                $relations = $this->db->getArray("SELECT * FROM relations_versions WHERE (targetId = ". $nodeVersion->nodeId ." OR sourceId = ". $nodeVersion->nodeId .") AND status = 'suggested' ORDER BY datetime");
                foreach($relations as $relation){
                    $this->historyRelationApprove($relation->relationVersionId);
                }
            }
        }
    }

    function historyRevert($nodeVersionId){
        $this->historyApprove($nodeVersionId);
    }

    function historyDelete($nodeVersionId){
        $this->db->doSQL("DELETE FROM nodes_versions WHERE nodeVersionId = ". $nodeVersionId ." AND status != 'current'");
    }

    function historyRelationApprove($relationVersionId){
        $relationVersion = $this->db->returnFirst("SELECT * FROM relations_versions WHERE relationVersionId = ". $relationVersionId);
        if($relationVersion){
            $arr = (array) $relationVersion;
            unset($arr["relationVersionId"]);
            unset($arr["status"]);
            unset($arr["creatorId"]);

            $this->db->doUpsert("relations", $arr);

            $this->db->doSQL("UPDATE relations_versions SET status = 'previous' WHERE sourceId = ". $relationVersion->sourceId ." AND targetId = ". $relationVersion->targetId ." AND `key` = '". $relationVersion->key ."' AND status = 'current'");
            $this->db->doSQL("UPDATE relations_versions SET status = 'current' WHERE relationVersionId = ". $relationVersionId);
        }
    }

    function historyRelationRevert($relationVersionId){
        $this->historyRelationApprove($relationVersionId);
    }

    function historyRelationDelete($relationVersionId){
        $this->db->doSQL("DELETE FROM relations_versions WHERE relationVersionId = ". $relationVersionId ." AND status != 'current'");
    }

    function getEntityCount(){
        return $this->db->getArray("SELECT type , count(*) AS count FROM nodes WHERE type IS NOT NULL GROUP BY type");
    }

    function checkKey($id, $key){
        return ["code" => 200, "data" => $this->db->getNumRows("SELECT nodeId FROM nodes WHERE `key` LIKE '". $key ."' AND nodeId <> '". $id ."'")];
    }

    function dataTop15Status(){
        $nodes = $this->getNodesExtended('gemeente');
        $result = [];

        foreach($nodes as $node){
            $temp = new stdClass();
            $title = $node->title;
            //$title = html_entity_decode(preg_replace('/u([\da-fA-F]{4})/', '&#x\1;', $title)); //OM utf8 karakters er goed in te krijgen: https://stackoverflow.com/questions/7061339/how-to-convert-u00e9-into-a-utf8-char-in-mysql-or-php
            $temp->name = $title;
            $temp->status = [];
            if($node->gemeente_datatop15){
                foreach($node->gemeente_datatop15 as $item){
                    if($item->datarelation->status){
                        $s = new stdClass();
                        $s->name = $item->title;
                        $s->status = $item->datarelation->status;
                        $temp->status[] = $s;
                    }
                }
            }
            $result[] = $temp;
        }
        return $result;
    }
}
?>
