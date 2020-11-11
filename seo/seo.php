<html ng-app="app" ng-controller="AppCtrl" lang="en">
<head>
    <meta charset="utf-8" />
    <title>Smart Mobility Data | Overzicht van data en toepassingen</title>
    <meta name="description" content="Smart City, Smart Mobility, Data, Datalandschap" />
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
<h1>Datapedia</h1>
<?php
    $url = $_SERVER['REQUEST_URI'];
    $parts = explode("/", $url);

    print("<strong>". $url ."</strong><br/>");
    print_r($parts);
?>
</body>
</html>