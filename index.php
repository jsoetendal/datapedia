  <!DOCTYPE html>
  <html ng-app="app" ng-controller="AppCtrl" lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Smart Mobility Data | Overzicht van data en toepassingen</title>
    <meta name="description" content="Smart City, Smart Mobility, Data, Datalandschap" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimal-ui" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <base href="<?php print(getenv('BASE_HREF'));?>">
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
  <div id="warningMsg" class="extradonker" style="position: fixed; bottom: 0px; left: 0px; right: 0px; padding: 10px; z-index: 9999"><i class="fa fa-exclamation-triangle"></i> Help jij mee de Datapedia compleet te maken? Voeg (zonder inloggen) een suggestie toe, of <a ui-sref="signup">maak een account aan</a>!</div>

  <div class="app" id="app">

  <!-- ############ LAYOUT START-->
      <!-- Header -->
      <header class="app-header white box-shadow">
          <div class="navbar">
            <!--<a href=""#/">
              <img src="themes/assets/images/logoSmartMob.png" style="height: 100px;" ng-hide="scrolledDown">
            </a>-->
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
                <li ng-repeat-start="link in settings.navigation" class="nav-item" ng-if="!link.sub">
                  <a ng-href="{{link.url}}" class="nav-link" ng-class="{'text-primary': state.name == link.state && state.params.type == link.params.type}">
                    <span class="nav-text">{{link.label}}</span>
                  </a>
                </li>
                <li ng-repeat-end class="nav-item dropdown dropdown-submenu"  ng-class="{'text-primary': state.name == link.state && state.params.type == link.params.type}" ng-if="link.sub">
                  <a class="nav-link dropdown-toggle" href="" data-toggle="dropdown">
                    <span class="nav-text">{{link.label}}</span>
                  </a>
                  <ul ng-if="link.sub" class="dropdown-menu pull-down text-color ng-scope" role="menu">
                    <li ng-repeat="sub in link.sub" class="dropdown-item">
                      <a ng-href="{{sub.url}}">
                        <span class="dropdown-item">{{sub.label}}</span>
                      </a>
                    </li>
                  </ul>
                </li>

                <!-- Inloggen -->
                <li class="nav-item dropdown"  ng-hide="user.auth.authenticated">
                  <a class="nav-link" href="" data-toggle="dropdown">
                    <span class="nav-text">Login</span>
                  </a>
                  <div class="dropdown-menu w-xl animated fadeInUp pull-right p-a-0 ng-scope">
                    <div class="box-color m-a-0">
                      <div class="box-header b-b p-y-sm">
                        <strong>Inloggen</strong>
                      </div>
                      <div class="box-body">
                        <form role="form" ng-submit="doLogin()">
                          <div class="form-group">
                            <label>E-mailadres</label>
                            <input type="email" class="form-control" placeholder="Vul je e-mailadres in" ng-model="email" required autocomplete="off">
                          </div>
                          <div class="form-group">
                            <label>Wachtwoord</label>
                            <input type="password" class="form-control" placeholder="Geef wachtwoord" ng-model="password" required autocomplete="off">
                          </div>
                          <div class="checkbox">
                            <label class="md-check"><input type="checkbox" ng-model="refresh"><i></i> Ingelogd blijven</label>
                          </div>
                          <div class="m-t m-b-xs">
                            <button type="submit" class="btn btn-sm primary text-u-c p-x _600">Inloggen</button>
                            <p class="text-muted m-t">Alle gegevens op de Datapedia zijn beschikbaar voor iedereen. Iedereen kan ook zonder inloggen reacties of suggesties geven.<br/>Inloggen is alleen nodig voor het beheren en redigeren van de Datapedia.</p>
                            <p><strong>Nog geen account?</strong></p>
                            <div class="btn primary" ui-sref="signup">Account aanmaken</div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </li>

                <!-- Als ingelogd -->
                <li class="nav-item dropdown dropdown-submenu" ng-if="user.auth.authenticated">
                  <a class="nav-link dropdown-toggle" href="" data-toggle="dropdown">
                    <span>Ingelogd</span>
                  </a>
                  <ul class="dropdown-menu pull-down text-color ng-scope" role="menu">
                    <li class="dropdown-item">
                      <a>
                        <span class="dropdown-item nav-text m-l-sm text-left"><span class="_500">{{user.auth.email}}</span> <small class="text-muted">{{user.auth.role}}</small></span>
                      </a>
                    </li>
                    <li class="dropdown-item">
                      <a ui-sref="admin" ng-show="user.isAdmin">
                        <span class="dropdown-item">Admin</span>
                      </a>
                    </li>
                    <li class="dropdown-item">
                      <a ui-sref="content" ng-show="user.isEditorOrUp">
                        <span class="dropdown-item">Contentbeheer</span>
                      </a>
                    </li>
                    <li class="dropdown-item">
                      <a ui-sref="users" ng-show="user.isEditorOrUp">
                        <span class="dropdown-item">Users</span>
                      </a>
                    </li>
                    <li class="dropdown-item">
                      <a ui-sref="logoff">
                        <span class="dropdown-item">Uitloggen</span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>


            <!-- Page title - Bind to $state's title -->
            <!--
              <div class="navbar-item pull-left navbar-brand" id="pageTitle">{{topHeader}}</div>

              <ul class="nav navbar-nav pull-right">
                <li class="nav-item" ng-hide="user.auth && user.auth.authenticated">
                  <a class="nav-link" ui-sref="login"><i class="fa fa-user text-muted"></i> <span>Inloggen</span></a>
                </li>
                <li class="nav-item dropdown">
                  <a class="nav-link clear" ng-show="user.auth && user.auth.authenticated" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-user text-muted"></i> <span>{{user.auth.email}}</span></a>
                  <div class="dropdown-menu pull-right dropdown-menu-scale ng-scope">
                    <a class="dropdown-item" ng-show="user.isAdmin" ui-sref="admin"><span>Admin</span></a>
                    <a class="dropdown-item" ng-show="user.isEditorOrUp" ui-sref="users"><span>Users</span></a>
                    <div class="dropdown-divider" ng-show="user.isEditorOrUp"></div>
                    <a class="dropdown-item" ui-sref="logoff">Uitloggen</a>
                  </div>
                </li>
              </ul>
              -->
          </div>
      </header>
      <div class="background" style="background-image: url('{{backgroundImgUrl}}');"></div>

    <!-- content -->
    <div id="content" role="main">

      <div class="app-body" id="view" ui-view>
  <!-- ############ PAGE START-->
      </div>

    </div> <!-- content -->

    <footer id="main-footer">
      <div id="footer-widgets" class="row">
        <div class="footer-widget">
          <div id="text-4" class="col-xs-12 col-md-4">
            <h4 class="title">Over de Data Top 15</h4>
            <div class="textwidget"><p>In het programma 'Digitalisering Overheden' werken 5 landsdelen samen om in 2023 'digitaal capabel in mobiliteit' te zijn. Aan de hand van de Data Top 15 wordt data van de wegbeheerders gepubliceerd.</p>
              <!--<p><a href="//smartmobilitymra.nl/wat-is-smart-mobility/"><strong>Lees meer</strong></a></p>-->
            </div>
          </div> <!-- end .fwidget -->
        </div> <!-- end .footer-widget -->

        <div class="footer-widget">
          <div id="text-3" class="col-xs-12 col-md-4">
            <h4 class="title">Over het Regionaal Data Team (RDT)</h4>
            <div class="textwidget"><p>In het landsdeel Noord-Holland/Flevoland is het Regionaal Datateam (RDT) actief om wegbeheerders te ondersteunen in de digitaliserings-opgave.</p>
              <!--<p><a href="//smartmobilitymra.nl/wat-is-smart-mobility/"><strong>Lees meer</strong></a></p>-->
            </div>
          </div> <!-- end .fwidget -->
        </div> <!-- end .footer-widget -->

        <div class="footer-widget">
          <div id="text-2" class="col-xs-12 col-md-4">
            <h4 class="title">Over MRA Smart Mobility</h4>
            <div class="textwidget"><p>Het MRA-platform Smart Mobility richt zich concreet op innovaties op datagebied in combinatie met het optimaal benutten van slimme techniek.</p>
              <p><a href="//smartmobilitymra.nl/wat-is-smart-mobility/"><strong>Lees meer</strong></a></p>
            </div>
          </div> <!-- end .fwidget -->
        </div> <!-- end .footer-widget -->
      </div> <!-- #footer-widgets -->
    </footer>



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
    <script src="app/components/main/login.controller.js"></script>
    <script src="app/components/main/signup.controller.js"></script>
    <script src="app/components/main/logoff.controller.js"></script>
    <script src="app/components/nodes/node.model.js"></script>
    <script src="app/components/nodes/nodes.model.js"></script>
    <script src="app/components/nodes/nodes.controller.js"></script>
    <script src="app/components/nodes/node.controller.js"></script>
    <script src="app/components/users/user.model.js"></script>
    <script src="app/components/users/users.model.js"></script>
    <script src="app/components/users/users.controller.js"></script>
    <script src="app/components/admin/content.controller.js"></script>
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