<?php
/**
* Class to connect to mySQL-database and to perform queries on the database;
*/
class Database
{
    var $db;
    var $host;
    var $database;
    var $username;
    var $password;
    var $object;
    
    /**
    * Create Database class, using parameters
    * @return Database
    * 
    */
    function __construct($host, $database, $username, $password){
        global $db_settings;
        $this->host = $host;
        $this->database = $database;
        $this->username = $username;
        $this->password = $password;
        $this->connect();
    }   

    /**
    * Connect to database as specified in class construction
    * 
    */
    function connect(){
        if ($this->db == null) {
            $this->db = mysqli_connect($this->host, $this->username, $this->password, $this->database);
            if(!$this->db){
                $this->printDBError();
            }
        }
    }
     
     /**
     * Perform SQL statement
     * 
     * @param string $SQLQuery SQL statement to perform
     * @return resource result of statement
     */
    function doSQL($SQLQuery)
    {
        $this->numberQueries++;
        $this->connect();
        $result = mysqli_query ($this->db, $SQLQuery);
        $this->printDBError($SQLQuery, true);
        return $result;
    }
    
    /**
    * Do upsert (INSERT, ON DUPLICATE KEY UPDATE) into a specified table, using an Array
    * 
    * @param string $table table the data should be upserted to
    * @param mixed[] $insertArray array with the column names as keys and the values as values
    */
    function doUpsert($table, $insertArray){
        $split = "";
        $names = "";
        $update = "";
        $values = "";
        foreach($insertArray as $name => $value){
            $names .= $split ."`". $name ."`";
            $values .= $split . "'". $value ."'";
            $update .= $split ."`". $name ."` = '". $value ."'";
            $split = ",";
        } 
        $SQL = "INSERT INTO ". $table ."(". $names .") VALUES (". $values .") ON DUPLICATE KEY UPDATE ". $update;
        $this->doSQL($SQL);
        
        return mysqli_affected_rows($this->db);
        //print("<BR>" . $SQL);
    }       

    function printUpsert($table, $insertArray){
        $split = "";
        $names = "";
        $update = "";
        $values = "";
        foreach($insertArray as $name => $value){
            $names .= $split ."`". $name ."`";
            $values .= $split . "'". $value ."'";
            $update .= $split ."`". $name ."` = '". $value ."'";
            $split = ",";
        } 
        $SQL = "INSERT INTO ". $table ."(". $names .") VALUES (". $values .") ON DUPLICATE KEY UPDATE ". $update;
        //$this->doSQL($SQL);
        print("<BR>" . $SQL);
    } 
    
    /**
    * Do insert into specified table, using an Array
    * 
    * @param string $table table the data should be inserted in
    * @param mixed[] $insertArray array with the column names as keys and the values as values
    * @return int Id of inserted row
    */
    function doInsert($table, $insertArray){
        $split = "";
        $names = "";
        $values = "";
        foreach($insertArray as $name => $value){
            $names .= $split ."`". $name ."`";
            $values .= $split . "'". mysqli_real_escape_string($this->db, $value) ."'";
            $split = ",";
        } 
        $SQL = "INSERT INTO ". $table ."(". $names .") VALUES (". $values .");";
        $this->doSQL($SQL);
        return mysqli_insert_id($this->db);
    }       
    
    /**
    * Update specified $table with $updateArray for all rows matching $selectArray
    * 
    * @param string $table table the data should be updated
    * @param mixed[] $updateArray array with the column names as keys and the values as values (f.e. ["name" => "Jasper", "task" => "Writing documentation"])
    * @param mixed[] $selectArray array with the column names as keys and the values as values (f.e. ["id" => 123])
    */
    
    function doUpdate($table, $updateArray, $selectArray){
        $split = "";
        $set = "";
        foreach($updateArray as $name => $value){
            $set .= $split ."`". $name ."` = '". mysqli_real_escape_string($this->db, $value) ."'";
            $split = ",";
        } 
        
        $split = "";
        $where = "";
        foreach($selectArray as $name => $value){
            $where .= $split ."`". $name ."` = '". mysqli_real_escape_string($this->db, $value) ."'";
            $split = " AND ";
        } 
        
        
        $SQL = "UPDATE ". $table ." SET ". $set ." WHERE ". $where .";";
        $this->doSQL($SQL);
    }    
    
    /**
    * Perform a $SQLQuery and save the result for further functions of this class
    * 
    * @param string $SQLQuery the SQL query to be performed
    * @return null
    */
    function getQuery($SQLQuery)
    {
        $this->numberQueries++;
        $this->connect();
        $this->objects = mysqli_query ($this->db, $SQLQuery);
        $this->printDBError($SQLQuery);
        return null;
    }

    /**
    * Perform a $SQLQuery and return the resulys as an array
    * 
    * @param string $SQLQuery the SQL query to be performed
    * @return array
    */
    function getArray($SQLQuery)
    {
        $this->numberQueries++;
        $this->connect();
        $this->objects = mysqli_query ($this->db, $SQLQuery);
        $this->printDBError($SQLQuery);
        $arr = Array();
        while($row = $this->fetch()){
            $arr[] = $row;
        }
        return $arr;
    }

    /**
    * Get all values from one column of a table in an array 
    * 
    * @param string $table name of the table to get
    * @param string $column name of the column to get
    * @return array like [2,2,3,4,1,2,3,5,6,1,2]
    */
    function getColumnArray($table, $column, $filter = "")
    {
        $this->numberQueries++;
        $this->connect();
        $this->objects = mysqli_query ($this->db, "SELECT `". $column ."` as `key` FROM ". $table . " ". $filter);
        $this->printDBError($SQLQuery);
        $arr = Array();
        while($row = $this->fetch()){
            $arr[] = $row->key;
        }
        return $arr;
    }    

    /**
    * Perform a $SQLQuery and store the results in an array with a key specified by 'key' and a value specified by 'value'
    * 
    * @param string $SQLQuery the SQL query to be performed
    * @return array
    */
    function getKeyValueArray($SQLQuery)
    {
        $this->numberQueries++;
        $this->connect();
        $this->objects = mysqli_query ($this->db, $SQLQuery);
        $this->printDBError($SQLQuery);
        $arr = Array();
        while($row = $this->fetch()){
            $arr[$row->key] = $row->value;
        }
        return $arr;
    }

    function getKeyArray($SQLQuery)
    {
        $this->numberQueries++;
        $this->connect();
        $this->objects = mysqli_query ($this->db, $SQLQuery);
        $this->printDBError($SQLQuery);
        $arr = Array();
        while($row = $this->fetch()){
            $arr[$row->key] = $row;
        }
        return $arr;
    }
    
    /**
    * Fetch a mysqli_fetch_object from an earlier performed SQL query
    * @return object
    */
    function fetch(){
        return mysqli_fetch_object($this->objects);
    }
    
    /**
    * Get mysqli_num_rows of last performed SQL query
    * @return int number of rows
    * 
    */
    function numResults(){
        return mysqli_num_rows($this->objects);
    }

    /**
    * Return the value of the column 'result' of the first row of the specified $SQLquery
    * 
    * @param string $SQLQuery
    * @return mixed value of column 'result' in first row
    */
    function returnQuery($SQLQuery)
    {
        $this->numberQueries++;
        $this->connect();
        $results = mysqli_query ($this->db, $SQLQuery);
        $this->printDBError($this->db, $SQLQuery);
        if (mysqli_num_rows($results) > 0){
             $result = mysqli_fetch_object($results);
             $this->printDBError($SQLQuery);
             return $result->result;
         } else {
             return null;
         }
    }
    
    /**
    * Return first row of specified $SQLQuery
    * 
    * @param string $SQLQuery
    * @return object|null
    */

    function returnFirst($SQLQuery)
    {
        $this->numberQueries++;
        $this->connect();
     $results = mysqli_query ($this->db, $SQLQuery);
     $this->printDBError($this->db, $SQLQuery);
     if (mysqli_num_rows($results) > 0){
         $result = mysqli_fetch_object($results);
         $this->printDBError($SQLQuery);
         return $result;
     } else {
         return null;
     }
    }
    
    
    /**
    * Return number of rows of $SQLQuery
    * 
    * @param string $SQLQuery
    * @return int numbers of rows of specified $SQLQuery
    */
    function getNumRows($SQLQuery)
    {
        $this->numberQueries++;
        $this->connect();
        $result = mysqli_query ($this->db, $SQLQuery);
        $return =  mysqli_num_rows($result);
        $this->printDBError($SQLQuery);
        return $return;
    }    
    
    /**
    * Print SQL error
    * 
    * @param string $SQL SQL query that caused error
    * @param bool $stop to specifiy if script should exit()
    */
    function printDBError($SQL = "-", $stop = false){
        $error = mysqli_error($this->db); 
        if(trim($error) <> ""){
            print "<strong>". print_r($error) ."</strong><br>SQL statement: ". $SQL ."<p>";
            if($stop){
                exit();
            }
        }
    }
    
    function debug($txt){
    }
    
    function free(){
        mysqli_free_result($this->objects);
    }

    function num_rows(){
        if($this->objects){
             $return = mysqli_num_rows($this->objects);
             return $return;
        } else {
            return null;
        }
    }

    function last_insertID(){
        return mysqli_insert_ID($this->db);
    }

    function affected_rows(){
        return mysqli_affected_rows($this->db);
    }  
    
    function escape($text){
        return mysqli_real_escape_string($this->db, $text);
    }
}

function safeSQL($text){
    return addslashes($text);
}
?>
