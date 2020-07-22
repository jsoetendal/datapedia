<?php
class Mail{
    var $email, $subject, $text, $html;
    
    
    function Mail($array){
        DEFINE("SPARKPOST_API_KEY","0ac3c98674aefc2f930e8b6bb2adec95636cbeb8");
        
        foreach($array as $key => $value){
            $this->$key = $value;
        }
    }
    
    
    function send(){
          if(!$this->text){
              $this->text = strip_tags($this->html);
          }
          if(!$this->cc){
              $this->cc = [];
          }
          if(!$this->bcc){
              $this->bcc = [];
          }
          
        $data = new stdClass();
        $data->options = new stdClass();
        $data->options->open_tracking = false;
        $data->options->click_tracking = false;
        $data->options->ip_pool = "proloco";
        
        $data->recipients = [];
        $to = new StdClass();
        $to->address = new stdClass();
        $to->address->email = $this->email;
        $data->recipients[] = $to;
        
        foreach($this->cc as $c){
            $copy = new StdClass();
            $copy->address = new stdClass();
            $copy->address->email = $c;
            $copy->address->header_to = $this->email;
            $data->recipients[] = $copy;
        }

        foreach($this->bcc as $b){
            $copy = new StdClass();
            $copy->address = new stdClass();
            $copy->address->email = $b;
            $copy->address->header_to = $this->email;
            $data->recipients[] = $copy;
        }

        $content = new StdClass();
        $content->from = new stdClass();
        $content->from->name = "Datapedia.nl";
        $content->from->email = "info@datapedia.nl";
        if($this->reply_to) $content->reply_to = $this->reply_to;
        $content->subject = $this->subject;
        if(count($this->cc) > 0){
            $content->headers = new stdClass();
            $content->headers->CC = implode(",",$this->cc);
        }
        $content->text = $this->txt;
        $content->html = $this->html;
        
        $data->content = $content;
        
        ob_start();
        $c = curl_init(); 
        curl_setopt($c, CURLOPT_URL, "https://api.sparkpost.com/api/v1/transmissions"); 
        curl_setopt($c, CURLOPT_HTTPHEADER, array("Content-Type: application/json", "Authorization: ". SPARKPOST_API_KEY)); 
        curl_setopt($c, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($c, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($data)); 

        $result = curl_exec($c);
        
        $this->data = json_encode($data);
        $this->result = ob_get_clean();
        
        if(!curl_errno($c)){ 
            curl_close($c); 
            return true;
        } else { 
            //echo 'Curl error: ' . curl_error($c); 
            curl_close($c); 
            return false;
        }        
    }
    
    
    
    
}
?>
