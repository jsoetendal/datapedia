<?php
    error_reporting(E_ALL ^E_NOTICE ^E_WARNING);
    $url = $_SERVER['REQUEST_URI'];
    //$url = '/node//505';
    if($_SERVER["SERVER_NAME"] == "localhost") {
        $parts = explode("/", strtolower($url));
        array_splice($parts, 0,1);
    } else {
        $parts = explode("/", strtolower($url));
    }
    $settings = json_decode(file_get_contents("../app/settings/settings.json"));
    $module = null;
    $node = null;
    $nodes = null;

    $modules = [];
    foreach($settings->modules as $m){
        $modules[] = $m->name;
    }


    if(strtolower($parts[1] == "nodes")){
        $type = $parts[2];
        foreach($settings->content->entities as $e) {
            if (strtolower(trim($e->type)) == strtolower(trim($type))) {
                header("Location: https://www.datapedia.nl/". $e->module . $url, true, 301); exit();
            }
        }
    }elseif(strtolower($parts[1] == "node")){
        $nodeId = $parts[3];
        $node = json_decode(file_get_contents("https://www.datapedia.nl/api/public/node/get/" . $nodeId));
        $type = $node->type;
        foreach($settings->content->entities as $e) {
            if (strtolower(trim($e->type)) == strtolower(trim($type))) {
                header("Location: https://www.datapedia.nl/". $e->module . $url, true, 301); exit();
            }
        }
    }

    if(in_array($parts[1], $modules)){
        $module = $parts[1];
        if(strtolower($parts[2] == "nodes")){
            $type = $parts[3];
            $nodes= json_decode(file_get_contents("https://www.datapedia.nl/api/public/nodes/". $type ."/"));
        }elseif(strtolower($parts[2] == "node")){
            $nodeId = $parts[4];
            $node = json_decode(file_get_contents("https://www.datapedia.nl/api/public/node/get/" . $nodeId));
            $type = $node->type;
        }
        //print("Nodes: ". $type ."<br/>NodeId: ". $nodeId);

        if ($type) {
            foreach ($settings->content->entities as $e) {
                if (strtolower(trim($e->type)) == strtolower(trim($type))) {
                    $entity = $e;
                }
            }
            if ($node) {
                $HTMLTitle = $node->title . " (" . $entity->single . ") | Datapedia Smart Mobility";
                $HTMLDescription = max_length($node->text, 255);
            } else {
                $HTMLTitle = $entity->plural . " | Datapedia Smart Mobility";
                $HTMLDescription = $entity->introduction;
            }
        } else {
            if($module == "datatop15"){
                $HTMLTitle = "Datapedia Data Top 15";
                $HTMLDescription = "Voor wegbeheerders die meedoen of mee willen doen aan het ontsluiten van data uit de Data Top 15 in het project ‘Digitalisering Overheden’, samen met het Regionaal Datateam. Met o.a: De Data Top 15 en een stappenplan voor alle items Actuele status van de wegbeheerders in de Data Top 15";
                $type = "datatop15";
                $nodes= json_decode(file_get_contents("https://www.datapedia.nl/api/public/nodes/". $type ."/"));
            } else {
                $HTMLTitle = "Datapedia Smart Mobility";
                $HTMLDescription = "Voor iedereen die meer wilt weten over slimme toepassingen in mobiliteit en welke rol data daar bij speelt. Van wegbeheerder tot beleidsambtenaar en wethouder mobiliteit. Met o.a: Het Datakookboek Smart Mobility, Voorbeelden van data & smart mobility in de praktijk";
            }
        }
    } else {
        $HTMLTitle = "Datapedia | Data Top 15 & Smart Mobility";
        $HTMLDescription = "Smart City, Smart Mobility, Wegbeheerders, Data Top 15, Digitalisering, Data en slimme toepassingen";
    }

    function max_length($text, $max = 255){
        $text = strip_tags($text);
        if(strlen($text) < $max) return $text;
        $pos = strpos($text, " ", (0.9 * $max));
        return substr($text, 0, min($max, $pos));
    }

    function linkname($text){
        $text = str_replace(" ","-",$text);
        return preg_replace("/[^a-zA-Z0-9\-]+/", "", $text);
    }

    ?>
<html ng-app="app" ng-controller="AppCtrl" lang="en">
<head>
    <meta charset="utf-8" />
    <title><?php echo($HTMLTitle);?></title>
    <base href="https://www.datapedia.nl/">
    <!--<base href="http://localhost/datapedia/">-->
    <meta name="description" content="<?php echo($HTMLDescription); ?>"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimal-ui" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="stylesheet" href="/style.css"/>

    <!-- for ios 7 style, multi-resolution icon of 152x152 -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-barstyle" content="black-translucent">
    <link rel="apple-touch-icon" href="themes/assets/images/logo.png">
    <meta name="apple-mobile-web-app-title" content="Smart Mobility Data">
    <!-- for Chrome on Android, multi-resolution icon of 196x196 -->
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="shortcut icon" sizes="196x196" href="themes/assets/images/logo.png">

    <!-- style -->
    <link rel="stylesheet" href="themes/assets/animate.css/animate.min.css" type="text/css" />
    <link rel="stylesheet" href="themes/assets/glyphicons/glyphicons.css" type="text/css" />
    <link rel="stylesheet" href="themes/assets/font-awesome/css/font-awesome.min.css" type="text/css" />
    <link rel="stylesheet" href="themes/assets/material-design-icons/material-design-icons.css" type="text/css" />

    <link rel="stylesheet" href="themes/assets/bootstrap/dist/css/bootstrap.min.css" type="text/css" />
    <!-- build:css themes/assets/styles/app.min.css -->
    <link rel="stylesheet" href="themes/assets/styles/app.css" type="text/css" />
    <!-- endbuild -->
    <link rel="stylesheet" href="themes/assets/styles/font.css" type="text/css" />

    <link rel="stylesheet" href="themes/specific.css"/>
</head>
<body>
<div class="app" id="app">

<header class="app-header white box-shadow">
    <div class="navbar">
        <a data-toggle="collapse" data-target="#navbar-1" class="navbar-item pull-right hidden-md-up m-a-0 m-l">
            <i class="material-icons"></i>
        </a>
        <a class="navbar-brand" href=".">
            <span class="hidden-folded inline ng-binding">Datapedia <span class="text-primary">Smart Mobility</span></span>
        </a>
        <ul class="nav navbar-nav pull-right">
        </ul>
        <div class="collapse navbar-toggleable-sm" id="navbar-1">
            <ul class="nav navbar-nav nav-active-border b-primary pull-right">
                <?php
                $backgroundURL = "app/images/fietsfile.jpg";
                if($module) {
                    foreach($settings->modules as $m) {
                        if ($m->name == $module) {
                            $backgroundURL = $m->background;
                            foreach ($m->navigation as $link) {
                                echo '<li class="nav-item"><a href="'. $m->name ."/". $link->url . '" class="nav-link"><span class="nav-text">' . $link->label . '</span></a>';
                                if (property_exists($link, "sub")) {
                                    echo '<ul class="dropdown-menu pull-down text-color ng-scope" role="menu">';
                                    foreach ($link->sub as $sub) {
                                        echo '<li class="dropdown-item"><a href="'. $m->name ."/" . $sub->url . '"><span class="dropdown-item">' . $sub->label . '</span></a></li>';
                                    }
                                    echo '</ul>';
                                }
                                echo '</li>';
                            }
                        }
                    }
                }
                ?>
            </ul>
        </div>
    </div>
</header>
<div class="background" style="background-image: url('<?php echo $backgroundURL; ?>');"></div>
<!-- content -->
<div id="content" role="main">
    <div class="app-body" id="view">
        <div class="padding">
            <div class="box licht lt m-b-lg"><div class="row"><div class="col-xs-12"><h1><?php echo $HTMLTitle; ?></h1><strong><a href="/nodes/<?php echo $node->type; ?>"><?php echo $entity->plural; ?></a></strong><br/><small><?php echo $HTMLDescription; ?></small></div></div></div>
            <div class="box">
            <div class="box-body">
                <?php
                    if($node){
                        echo "<!--NODE-->";
                        echo "<h1>". $node->title ."</h1>";
                        echo "<h3>". $node->path ."</h3>";
                        echo "<p>". $node->text ."</p>";
                        if($node->imgUrl) echo "<img src='../". $node->imgUrl ."'>";
                        echo "<dl>";
                        $data = json_decode($node->data);
                        foreach($entity->data as $entity_data){
                            echo "<dt>". $entity_data->label ."</dt>";
                            $param = $entity_data->key;
                            echo "<dd>". $data->$param ."</dd>";
                        }
                        echo "</dl>";
                        if($entity->relations) {
                            foreach ($entity->relations as $relation) {
                                $key = $relation->key;
                                echo "<h4>" . $relation->label . "</h4><ul>";
                                foreach ($node->relations->$key as $rel) {
                                    echo "<li><a href='". $module ."/node/" . linkname($rel->title) . "/" . $rel->targetId . "'>" . $rel->title . "</li>";
                                }
                                echo "</ul>";
                            }
                        }
                        if($entity->dependencies) {
                            foreach ($entity->dependencies as $relation) {
                                $key = $relation->key;
                                echo "<h4>" . $relation->label . "</h4><ul>";
                                foreach ($node->relations->$key as $rel) {
                                    echo "<li><a href='". $module ."/node/" . linkname($rel->title) . "/" . $rel->sourceId . "'>" . $rel->title . "</li>";
                                }
                                echo "</ul>";
                            }
                        }
                        //print_r($node);
                    }else if($nodes){
                        echo "<!--NODES-->";
                        //print_r($nodes);
                        print("<ul>");
                        foreach($nodes as $node){
                            echo "<li><a href='". $module ."/node/" . linkname($node->title) . "/" . $node->nodeId . "'>" . $node->title . "</li>";
                        }
                        print("</ul>");
                    } else if(!$module) {
                        echo "<!--START-->";
                        echo '<div class="p-a m-t-3">';
                            echo '<div class="row m-t-3">';
                            foreach($settings->modules as $m){
                                ?>
                                <div class="col-xs-12 col-md-4">
                                    <a href="<?php echo $m->name; ?>" style="cursor: pointer">
                                        <img src="<?php echo $m->image;?>" style="width: 100%">
                                        <div class="box-body licht" style="min-height: 12em">
                                            <h5>Datapedia <span class="text-primary"><?php echo $m->title; ?></span></h5>
                                            <p><?php echo $m->introduction; ?></p>
                                            <div class="text-center m-y">
                                                <div class="center btn btn-fw primary" style="margin: auto">Datapedia <?php echo $m->title; ?></div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            <?php
                            }
                            echo '</div>';
                        echo '</div>';
                    }else if($module == "smartmobility"){
                        echo "<!--SMARTMOBILITY-->";
                        //TODO: Links aanpassen!
                        ?>
                        <div class="row no-gutter">
                            <div class="col-xs-12 col-md-8 no-gutter">
                                <div class="box licht frontpage">
                                    <div class="box-header">
                                        <h1>Datapedia <span class="text-primary">Smart Mobility</span></h1>
                                    </div>
                                    <div class="box-body">
                                        Voor de gemeentes in de Metropoolregio Amsterdam ligt er een mooie uitdaging in het digitaliseren van mobiliteitsdata.
                                        Verdere digitalisering is essentieel om mobiliteit slimmer te maken: om overheidstaken beter en efficienter uit te voeren, om de reiziger beter te informeren en om innovatie en samenwerking met andere partijen te vereenvoudigen.
                                        <br/><br/>De Datapedia Smart Mobility helpt je bij het waarom, het wat en het hoe en zet je het liefst direct aan het werk!

                                    </div>
                                </div>
                            </div>
                            <div class="col-xs-12 col-md-4 no-gutter">
                                <div class="box donker frontpage">
                                    <div class="box-header">
                                        <h1>Wij helpen je graag!</h1>
                                    </div>
                                    <div class="box-body">
                                        De Datapedia Smart Mobility is een initatief van het <a href="https://smartmobilitymra.nl" target="_blank">Platform Smart Mobility in de Metropoolregio Amsterdam (MRA)</a> en het Regionaal Datateam Landsdeel Noord-West. Vragen? <a href="mailto:j.soetendal@vervoerregio.nl">Neem contact met ons op!</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-xs-12 col-md-4">
                                <div class="box">
                                    <img src="uploads/main-waarom.jpg" style="width: 100%">
                                    <div class="box-body licht" style="min-height: 12em">
                                        <h5>Waarom?</h5>
                                        <ul class="frontpage">
                                            <li><div class="pull-left"><i class="fa fa-chevron-right"></i></div>Bekijk de video <a class="text-primary" href="smartmobility/node//530">"Wat is data en waarom is het zo belangrijk"</a></li>
                                            <li><div class="pull-left"><i class="fa fa-chevron-right"></i></div>Zie de vele  <a class="text-primary" href="smartmobility/nodes/project">voorbeelden</a> van hoe data mobiliteit slimmer kan maken</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="col-xs-12 col-md-4">
                                <div class="box">
                                    <img src="uploads/main-hoe.jpg" style="width: 100%">
                                    <div class="box-body licht" style="min-height: 12em">
                                        <h5>Wat en hoe?</h5>
                                        <ul class="frontpage">
                                            <li><div class="pull-left"><i class="fa fa-chevron-right"></i></div>Lees het <a class="text-primary" href="smartmobility/nodes/article">Handboek Data Top 15</a></li>
                                            <li><div class="pull-left"><i class="fa fa-chevron-right"></i></div>Bekijk de <a class="text-primary" href="smartmobility/nodes/onderwerp">verschillende onderwerpen en bijbehorende beschikbare datasets</a> en  <a class="text-primary" href="datatop15/nodes/datatop15">Data Top 15</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="col-xs-12 col-md-4">
                                <div class="box">
                                    <img src="uploads/main-aandeslag.jpg" style="width: 100%">
                                    <div class="box-body licht" style="min-height: 12em">
                                        <h5>Aan de slag!</h5>
                                        <ul class="frontpage">
                                            <li><div class="pull-left"><i class="fa fa-chevron-right"></i></div>Bekijk de  <a class="text-primary" href="datatop15/nodes/datatop15">Data Top 15</a> met een aanpak voor ieder data-item</li>
                                            <li><div class="pull-left"><i class="fa fa-chevron-right"></i></div>Doe de <a class="text-primary" href="datatop15/nodes/gemeente">'intake' voor jouw gemeente</a> of vul deze verder aan.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <?php
                    } else {
                        echo "<!--DATATOP15-->";
                        //Module Data Top 15;
                    }
                ?>
            </div>
        </div>
    </div>
</div> <!-- content -->

    <footer id="main-footer">
        <div id="footer-widgets" class="row">
            <div class="footer-widget">
                <div id="text-4" class="col-xs-12 col-md-3">
                    <h4 class="title">Over de Data Top 15</h4>
                    <div class="textwidget"><p>In het programma 'Digitalisering Overheden' werken 5 landsdelen samen om in 2023 'digitaal capabel in mobiliteit' te zijn. Aan de hand van de Data Top 15 wordt data van de wegbeheerders gepubliceerd.</p>
                        <!--<p><a href="//smartmobilitymra.nl/wat-is-smart-mobility/"><strong>Lees meer</strong></a></p>-->
                    </div>
                </div> <!-- end .fwidget -->
            </div> <!-- end .footer-widget -->

            <div class="footer-widget">
                <div id="text-3" class="col-xs-12 col-md-3">
                    <h4 class="title">Over het Regionaal Data Team (RDT)</h4>
                    <div class="textwidget"><p>In het landsdeel Noord-Holland/Flevoland is het Regionaal Datateam (RDT) actief om wegbeheerders te ondersteunen in de digitaliserings-opgave.</p>
                        <!--<p><a href="//smartmobilitymra.nl/wat-is-smart-mobility/"><strong>Lees meer</strong></a></p>-->
                    </div>
                </div> <!-- end .fwidget -->
            </div> <!-- end .footer-widget -->

            <div class="footer-widget">
                <div id="text-2" class="col-xs-12 col-md-3">
                    <h4 class="title">Over MRA Smart Mobility</h4>
                    <div class="textwidget"><p>Het MRA-platform Smart Mobility richt zich concreet op innovaties op datagebied in combinatie met het optimaal benutten van slimme techniek.</p>
                        <p><a href="//smartmobilitymra.nl/wat-is-smart-mobility/"><strong>Lees meer</strong></a></p>
                    </div>
                </div> <!-- end .fwidget -->
            </div> <!-- end .footer-widget -->
            <div class="footer-widget">
                <div id="text-2" class="col-xs-12 col-md-3">
                    <h4 class="title">Onderwerpen</h4>
                    <div class="textwidget">
                        <ul>
                        <?php
                        foreach($settings->content->entities as $e){
                            echo "<li><a href='". $e->module ."/nodes/". $e->type ."'>". $e->plural ."</a></li>";
                        }
                        ?>
                    </ul>
                    </div>
                </div> <!-- end .fwidget -->
            </div> <!-- end .footer-widget -->
        </div> <!-- #footer-widgets -->
    </footer>
</div>
<!--
<?php
 //print_r($node);
?>
-->
</body>
</html>