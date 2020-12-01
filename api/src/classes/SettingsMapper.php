<?php
class SettingsMapper extends Mapper
{
    public function __construct($db, $media = null) {
        $this->db = $db;
        $this->media = $media;
    }

    function getSettings(){
        return json_decode(file_get_contents(getenv('CONFIG_SETTINGS_PATH')));
    }

    function saveSettings($data){
        $f = fopen(getenv('CONFIG_SETTINGS_PATH'),"w");
        fwrite($f, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));

        fclose($f);
    }
}
?>
