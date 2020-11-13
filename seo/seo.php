<?php
    $url = $_SERVER['REQUEST_URI'];
    $parts = explode("/", $url);
    $settings = json_decode(file_get_contents("../settings/settings.json"));

    if(strtolower($parts[1] == "nodes")){
        $type = $parts[2];
        $nodes= json_decode(file_get_contents("https://www.datapedia.nl/api/public/nodes/". $type ."/"));
    }elseif(strtolower($parts[1] == "node")){
        $nodeId = $parts[3];
        $node = json_decode(file_get_contents("https://www.datapedia.nl/api/public/node/get/" . $nodeId));
        $type = $node->type;
    }

    if($type){
        foreach($settings->content->entities as $e){
            if($e->type == $type){
                $entity = $e;
            }
        }
        if($node){
            $HTMLTitle = $node->title . " (". $entity->single .") | Datapedia Smart Mobility";
            $HTMLDescription = max_length($node->text, 255);
        } else {
            $HTMLTitle = $entity->plural . " | Datapedia Smart Mobility";
            $HTMLDescription = $entity->introduction;
        }
    } else {
        $HTMLTitle = "Overzicht van data en toepassingen  | Datapedia Smart Mobility";
        $HTMLDescription = "Smart City, Smart Mobility, Data, Datalandschap";
    }

    function max_length($text, $max = 255){
        $text = strip_tags($text);
        $pos = strpos($text, " ", (0.9 * 255));
        return substr($text, 0, min($max, $pos));
    }
?>
<html ng-app="app" ng-controller="AppCtrl" lang="en">
<head>
    <meta charset="utf-8" />
    <title><?php echo($HTMLTitle);?></title>
    <meta name="description" content="<?php echo($HTMLDescription); ?>"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimal-ui" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="stylesheet" href="../style.css"/>

    <!-- for ios 7 style, multi-resolution icon of 152x152 -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-barstyle" content="black-translucent">
    <link rel="apple-touch-icon" href="../themes/assets/images/logo.png">
    <meta name="apple-mobile-web-app-title" content="Smart Mobility Data">
    <!-- for Chrome on Android, multi-resolution icon of 196x196 -->
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="shortcut icon" sizes="196x196" href="../themes/assets/images/logo.png">

    <!-- style -->
    <link rel="stylesheet" href="../themes/assets/animate.css/animate.min.css" type="text/css" />
    <link rel="stylesheet" href="../themes/assets/glyphicons/glyphicons.css" type="text/css" />
    <link rel="stylesheet" href="../themes/assets/font-awesome/css/font-awesome.min.css" type="text/css" />
    <link rel="stylesheet" href="../themes/assets/material-design-icons/material-design-icons.css" type="text/css" />

    <link rel="stylesheet" href="../themes/assets/bootstrap/dist/css/bootstrap.min.css" type="text/css" />
    <!-- build:css themes/assets/styles/app.min.css -->
    <link rel="stylesheet" href="../themes/assets/styles/app.css" type="text/css" />
    <!-- endbuild -->
    <link rel="stylesheet" href="../themes/assets/styles/font.css" type="text/css" />

    <link rel="stylesheet" href="../themes/specific.css"/>
</head>
<body>
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
                foreach($settings.navigation as $link){
                    echo '<li nclass="nav-item"></li><a href="'. $link->url .'" class="nav-link"><span class="nav-text">'. $link->label .'{{link.label}}</span></a>';
                    if($link->sub){
                        echo '<ul class="dropdown-menu pull-down text-color ng-scope" role="menu">';
                        foreach($link->sub as $sub) {
                            echo '<li class="dropdown-item"><a href="' . $sub->url . '"><span class="dropdown-item">' . $sub->label . '</span></a></li>';
                        }
                        echo '</ul>';
                    }
                    echo '</li>';
                }
                ?>
            </ul>
        </div>
    </div>
</header>
<div class="background" style="background-image: url('../app/images/fietsfile.jpg');"></div>
<!-- content -->
<div id="content" role="main">
    <div class="app-body" id="view">
        <div class="padding">
            <div class="box">
                <div class="box-header">
                    <h1><?php echo $HTMLTitle; ?></h1>
                    <small><?php echo $HTMLDescription; ?></small>
                </div>
            </div>
            <div class="box-body">
                <?php
                    if($node){
                        echo "<h1>". $node->title ."</h1>";
                        echo "<h3>". $node->path ."</h3>";
                        echo "<p>". $node->text ."</p>";
                        if($node->imgUrl) echo "<img src='../". $node->imgUrl ."'>";
                        echo "<dl>";
                        foreach($entity->data as $data){
                            echo "<dt>". $data->label ."</dt>";
                            $param = $data->key;
                            echo "<dd>". $node->data->$param ."</dd>";
                        }
                        echo "</dl>";
                        foreach($entity->relations as $relation){
                            $key = $relation->key;
                            echo "<h4>". $relation->label ."</h4><ul>";
                            foreach($data->relations->$key as $rel){
                                echo "<li><a href='../node/". linkname($rel->title) ."/". $rel->targetId ."'>". $rel->title ."</li>";
                            }
                            echo "</ul>";
                        }
                        foreach($entity->depedency as $relation){
                            $key = $relation->key;
                            echo "<h4>". $relation->label ."</h4><ul>";
                            foreach($data->relations->$key as $rel){
                                echo "<li><a href='../node/". linkname($rel->title) ."/". $rel->sourceId ."'>". $rel->title ."</li>";
                            }
                            echo "</ul>";
                        }
                    }else if($nodes){

                    }else {
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
                                            <li><div class="pull-left"><i class="fa fa-chevron-right"></i></div>Bekijk de video <a class="text-primary" ui-sref="node({nodeId: 530})">"Wat is data en waarom is het zo belangrijk"</a></li>
                                            <li><div class="pull-left"><i class="fa fa-chevron-right"></i></div>Zie de vele  <a class="text-primary" ui-sref="nodes({type: 'project'})">voorbeelden</a> van hoe data mobiliteit slimmer kan maken</li>
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
                                            <li><div class="pull-left"><i class="fa fa-chevron-right"></i></div>Lees het <a class="text-primary" ui-sref="nodes({type: 'article'})">Handboek Data Top 15</a></li>
                                            <li><div class="pull-left"><i class="fa fa-chevron-right"></i></div>Bekijk de <a class="text-primary" ui-sref="nodes({type: 'onderwerp'})">verschillende onderwerpen en bijbehorende beschikbare datasets</a> en  <a class="text-primary" ui-sref="nodes({'type': 'datatop15'})">Data Top 15</a></li>
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
                                            <li><div class="pull-left"><i class="fa fa-chevron-right"></i></div>Bekijk de  <a class="text-primary" ui-sref="nodes({'type': 'datatop15'})">Data Top 15</a> met een <a class="text-primary" ui-sref="node({nodeId: 571})">aanpak</a> voor ieder data-item</li>
                                            <li><div class="pull-left"><i class="fa fa-chevron-right"></i></div>Doe de <a class="text-primary" ui-sref="nodes({'type': 'gemeente'})">'intake' voor jouw gemeente</a> of vul deze verder aan.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <?php
                    }
                ?>
            </div>
        </div>
    </div>
</div> <!-- content -->
</body>
</html>