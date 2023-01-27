  <!DOCTYPE html>
  <html ng-app="app" ng-controller="AppCtrl" lang="en">
  <?php require_once("local/index.head.phtml"); ?>
  <body>
  <!--
  <div id="warningMsg" class="extradonker" style="position: fixed; bottom: 0px; left: 0px; right: 0px; padding: 10px; z-index: 9999"><i class="fa fa-exclamation-triangle"></i> Help jij mee de Datapedia compleet te maken? Voeg (zonder inloggen) een suggestie toe, of <a ui-sref="signup">maak een account aan</a>!</div>
  <div id="warningMsg" class="extradonker" style="position: fixed; bottom: 0px; left: 0px; right: 0px; padding: 10px; z-index: 9999"><i class="fa fa-exclamation-triangle"></i> Wegbeheerder in Noord-Holland en Flevoland en op zoek naar hulp bij de digitaliseringsopgave? Neem contact op met het <a ui-sref="node({'nodeId': 1220})">Regionaal Datateam</a>!</div>
  -->
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
    <!--<script src="themes/flatkit/scripts/config.lazyload.js"></script>-->
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

    <!-- nodes -->
    <script src="env.js"></script>
    <script src="app/app.js"></script>
    <script src="app/app.module.js"></script>
    <script src="app/app.ctrl.js"></script>
    <script src="app/standard.js"></script>
    <script src="app/core.module.js"></script>
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
    <script src="app/settings/diverse.controllers.js"></script>
    <script src="app/settings/user.js"></script>
    <script src="app/settings/setup.js"></script>
    <?php require_once("local/index.scripts.phtml"); ?>
    <script src="app/ui-include.js"></script>

<!-- endbuild -->
  </body>
  </html>
