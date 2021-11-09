  <!DOCTYPE html>
  <html ng-app="app" ng-controller="AppCtrl" lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Smart Mobility Data | Overzicht van data en toepassingen</title>
    <meta name="description" content="Smart City, Smart Mobility, Data, Datalandschap" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimal-ui" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <base href="<?php print(getenv('BASE_HREF'));?>">
      <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-W62XEBVFPS"></script>
    <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-W62XEBVFPS');
    </script>
    <link rel="stylesheet" href="style.css"/>

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
  <!--
  <div id="warningMsg" class="extradonker" style="position: fixed; bottom: 0px; left: 0px; right: 0px; padding: 10px; z-index: 9999"><i class="fa fa-exclamation-triangle"></i> Help jij mee de Datapedia compleet te maken? Voeg (zonder inloggen) een suggestie toe, of <a ui-sref="signup">maak een account aan</a>!</div>
  -->
  <div id="warningMsg" class="extradonker" style="position: fixed; bottom: 0px; left: 0px; right: 0px; padding: 10px; z-index: 9999"><i class="fa fa-exclamation-triangle"></i> Wegbeheerder in Noord-Holland en Flevoland en op zoek naar hulp bij de digitaliseringsopgave? Neem contact op met het <a ui-sref="node({'nodeId': 1220})">Regionaal Datateam</a>!</div>
  <div class="app" id="app">

      <div ui-view>
      </div>

      <div id="melding" class="modal" data-backdrop="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{melding.titel}}</h5>
            </div>
            <div class="modal-body text-center p-lg">
              <p>{{melding.tekst}}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn danger p-x-md" data-dismiss="modal">OK</button>
            </div>
          </div><!-- /.modal-content -->
        </div>
      </div>
    </div>
    <!-- / -->
      <!-- ############ LAYOUT END-->

    <script src="libs/jquery/jquery/dist/jquery.js"></script>
    <script src="libs/jquery/tether/dist/js/tether.min.js"></script>
    <script src="libs/jquery/bootstrap/dist/js/bootstrap.js"></script>


  <!-- core -->
    <script src="themes/flatkit/scripts/config.lazyload.js"></script>
    <!-- //Niet nodig, toch?
    <script src="themes/libs/jquery/jQuery-Storage-API/jquery.storageapi.min.js"></script>
    <script src="themes/libs/jquery/PACE/pace.min.js"></script>
    <script src="libs/jquery/underscore/underscore-min.js"></script>


    <script src="themes/flatkit/scripts/palette.js"></script>
    <script src="themes/flatkit/scripts/ui-load.js"></script>
    <script src="themes/flatkit/scripts/ui-jp.js"></script>
    <script src="themes/flatkit/scripts/ui-device.js"></script>
    <script src="themes/flatkit/scripts/ui-form.js"></script>
    <script src="themes/flatkit/scripts/ui-nav.js"></script>
    <script src="themes/flatkit/scripts/ui-screenfull.js"></script>
    <script src="themes/flatkit/scripts/ui-scroll-to.js"></script>
    <script src="themes/flatkit/scripts/ui-toggle-class.js"></script>

    <script src="themes/flatkit/scripts/app.js"></script>

    <script src="themes/libs/jquery/jquery-pjax/jquery.pjax.js"></script>
    <script src="themes/flatkit/scripts/ajax.js"></script>
    -->
    <script src="app/settings/jwt-decode.min.js"></script>

    <script src="libs/angular/angular/angular.js"></script>
    <script src="libs/angular/angular-animate/angular-animate.js"></script>
    <script src="libs/angular/angular-resource/angular-resource.js"></script>
    <script src="libs/angular/angular-sanitize/angular-sanitize.js"></script>
    <script src="libs/angular/angular-touch/angular-touch.js"></script>
    <script src="libs/angular/angular-bootstrap/ui-bootstrap-tpls.min.js"></script>

    <!-- router -->
    <script src="libs/angular/angular-ui-router/release/angular-ui-router.js"></script>
    <script src="libs/angular/angular-route/angular-route.js"></script>
    <script src="libs/angular/ngstorage/ngStorage.js"></script>
    <script src="libs/jquery/jQuery-Storage-API/jquery.storageapi.min.js"></script>
    <!--text editor -->
    <script type="text/javascript" src="libs/tinymce/js/tinymce/tinymce.min.js"></script>
    <script type="text/javascript" src="libs/ui-tinymce-master/dist/tinymce.min.js"></script>
  <!--diff-->
  <script type="text/javascript" src="libs/diff-match-patch/diff_match_patch_uncompressed.js"></script>
  <!--map-->
  <script type="text/javascript" src="libs/ng-map/ng-map.min.js"></script>
  <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCC6ApiyftrVuZsRw-LskZ5J3F7uXMvu6g"></script>

    <!-- nodes -->
    <script src="env.js"></script>
    <script src="app/app.js"></script>
    <script src="app/app.module.js"></script>
    <script src="app/app.ctrl.js"></script>
    <script src="app/standard.js"></script>
    <script src="app/core.module.js"></script>
    <script src="app/components/main/main.controller.js"></script>
    <script src="app/components/main/start.controller.js"></script>
    <script src="app/components/main/login.controller.js"></script>
    <script src="app/components/main/signup.controller.js"></script>
    <script src="app/components/main/logoff.controller.js"></script>
    <script src="app/components/module/module.controller.js"></script>
    <script src="app/components/nodes/node.model.js"></script>
    <script src="app/components/nodes/nodes.model.js"></script>
    <script src="app/components/nodes/nodes.controller.js"></script>
    <script src="app/components/nodes/node.controller.js"></script>
    <script src="app/components/users/user.model.js"></script>
    <script src="app/components/users/users.model.js"></script>
    <script src="app/components/users/users.controller.js"></script>
    <script src="app/components/admin/admin.controller.js"></script>
    <script src="app/components/admin/content.controller.js"></script>
    <script src="app/components/admin/settings.model.js"></script>
    <script src="app/components/admin/settings.controller.js"></script>
    <script src="app/components/import/import.controller.js"></script>
    <script src="app/components/import/dataoverheid.controller.js"></script>
    <script src="app/settings/diverse.controllers.js"></script>
    <script src="app/components/custom/datatop15.controller.js"></script>
    <script src="app/settings/user.js"></script>
    <script src="app/settings/setup.js"></script>
    <script src="app/ui-include.js"></script>

    <!-- Custom controllers -->
    <script src="app/components/custom/intake.controller.js"></script>


<!-- endbuild -->
  </body>
  </html>
