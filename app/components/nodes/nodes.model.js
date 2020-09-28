'use strict';
angular.
  module('core.nodes',[]).
  service('Nodes',  ['$http', '$rootScope',
      function Nodes($http, $rootScope){
      var self = this;
      var nodes = [];
      var node = null;

          this.loadNodes = function(type, extended, path, func){
              var self = this;

              var url = $rootScope.APIBase + "nodes/" + type +"/";
              if(path){
                  url = $rootScope.APIBase + "nodes/" + type +"/path/" + path;
              } else if(extended){ //else -> path kan niet extended opgehaald worden
                  url = $rootScope.APIBase + "nodes/extended/" + type +"/";
              }
              $http({
                  method: 'GET',
                  url: url,
                  headers: {
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  }
              }).then(function(response) {
                  log(response);
                  if(response.status == 200){
                      self.nodes = [];
                      if(response.data){
                          var data = response.data;
                          for(var i in data){
                              var h = data[i];
                              self.nodes.push(new Node(h));
                          }
                      }
                      if(func) func(type);
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.loadNodes(type, extended, path, func);
                      });
                  } else {
                      alert("Mislukt om nodes op te halen");
                  }
              });
          }

          /**
           * Loads al nodes that are sourceId of a specific relation (defined by 'key') including a '<key>'-field including all target nodes of this relation for the specific node.
           * @param key
           * @param func
           */
          this.loadRelation = function(key, func){
              var self = this;

              var url = $rootScope.APIBase + "nodes/relation/" + key +"/";
              $http({
                  method: 'GET',
                  url: url,
                  headers: {
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  }
              }).then(function(response) {
                  log(response);
                  if(response.status == 200){
                      self.nodes = [];
                      if(response.data){
                          var data = response.data;
                          for(var i in data){
                              var h = data[i];
                              for(var j in data[i][key]){
                                  //make Nodes from target nodes
                                  data[i][key][j] = new Node(data[i][key][j]);
                              }
                              self.nodes.push(new Node(h));
                          }
                      }
                      if(func) func(key);
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.loadRelation(key, func);
                      });
                  } else {
                      alert("Mislukt om nodes uit relatie op te halen");
                  }
              });
          }

          this.searchNodes = function(text, func){
          var self = this;

          var url = $rootScope.APIBase + "search/" + text +"/";
          $http({
              method: 'GET',
              url: url,
              headers: {
                  'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
              }
          }).then(function(response) {
              log(response);
              if(response.status == 200){
                  self.nodes = [];
                  if(response.data){
                      var data = response.data;
                      for(var i in data){
                          var h = data[i];
                          self.nodes.push(new Node(h));
                      }
                  }
                  if(func) func(text);
              } else {
                  log(response);
              }
          }).catch(function(fallback) {
              log(fallback);
              if(fallback.status == 401){
                  //Refresh needed
                  $rootScope.setup.user.refreshUser(function(){
                      self.searchNodes(text, func);
                  });
              } else {
                  alert("Mislukt om te zoeken in nodes");
              }
          });
      }

      this.getType = function(){
              if(this.nodes[0]) return this.nodes[0].type;
      }

       this.getNodes = function(){
           return this.nodes;
       }

          this.loadNode = function(nodeId, func){
              var self = this;

              var url = $rootScope.APIBase + "node/get/" + nodeId;
              $http({
                  method: 'GET',
                  url: url,
                  headers: {
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  }
              }).then(function(response) {
                  log(response);
                  if(response.status == 200){
                      if(response.data){
                          self.node = new Node(response.data);
                      }
                      if(func) func();
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.loadNode(nodeId, func);
                      });
                  } else {
                      alert("Mislukt om node "+ nodeId +" op te halen");
                  }
              });
          }

          this.getNode = function(){
           return this.node;
      }

      this.loadNodeHistory = function(nodeId, func){
          var self = this;

          var url = $rootScope.APIBase + "node/history/" + nodeId;
          $http({
              method: 'GET',
              url: url,
              headers: {
                  'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
              }
          }).then(function(response) {
              log(response);
              if(response.status == 200){
                  var nodes = [];
                  if(response.data){
                      var data = response.data;
                      for(var i in data){
                          var h = data[i];
                          nodes.push(new Node(h));
                      }
                  }
                  if(func) func(nodes);
              } else {
                  log(response);
              }
          }).catch(function(fallback) {
              log(fallback);
              if(fallback.status == 401){
                  //Refresh needed
                  $rootScope.setup.user.refreshUser(function(){
                      self.loadNodeHistory(nodeId,func);
                  });
              } else {
                  alert("Mislukt om nodes op te halen");
              }
          });
      }

          this.addNode = function(data, func){
              var url = $rootScope.APIBase + "node/add/";
              $http({
                  method: 'POST',
                  url: url,
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  },
                  data: data
              }).then(function(response) {
                  if(response.status == 200){
                      if(response.data){
                          var newId = response.data.nodeId;
                          console.log(newId);
                          if(func) func(newId);
                      }
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.addNode(data, func);
                      });
                  } else {
                      alert("Mislukt om node toe te voegen");
                  }
              });
          }

          this.saveNode = function(data, func){
              var url = $rootScope.APIBase + "node/save/";
              $http({
                  method: 'POST',
                  url: url,
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  },
                  data: data
              }).then(function(response) {
                  if(response.status == 200){
                      if(func) func();
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.saveNode(data, func);
                      });
                  } else {
                      alert("Mislukt om node op te slaan");
                  }
              });
          }

          this.deleteNode = function(nodeId, func){
              var url = $rootScope.APIBase + "node/delete/" + nodeId;
              $http({
                  method: 'GET',
                  url: url,
                  headers: {
                    'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  }
              }).then(function(response) {
                  if(response.status == 200){
                      if(func) func();
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.deleteNode(nodeId, func);
                      });
                  } else {
                      alert("Mislukt om node te verwijderen");
                  }
              });
          }

          this.addRelation = function(sourceId, key, targetId, func){
              var url = $rootScope.APIBase + "relation/add/";
              $http({
                  method: 'POST',
                  url: url,
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  },
                  data: {
                      "sourceId": sourceId,
                      "key": key,
                      "targetId": targetId
                  }
              }).then(function(response) {
                  if(response.status == 200){
                      if(response.data){
                          var node = new Node(response.data);
                          if(func) func(node);
                      }
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.addRelation(sourceId, key, targetId, func);
                      });
                  } else {
                      alert("Mislukt om node toe te voegen");
                  }
              });
          }

          this.setRelationData = function(sourceId, key, targetId, data, func){
              var url = $rootScope.APIBase + "relation/set/";
              $http({
                  method: 'POST',
                  url: url,
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  },
                  data: {
                      "sourceId": sourceId,
                      "key": key,
                      "targetId": targetId,
                      "data": data
                  }
              }).then(function(response) {
                  if(response.status == 200){
                      if(response.data){
                          var node = new Node(response.data);
                          if(func) func(node);
                      }
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.setRelationData(sourceId, key, targetId, data, func);
                      });
                  } else {
                      alert("Mislukt om node toe te voegen");
                  }
              });
          }

          this.deleteRelation = function(relatie, func){
              var url = $rootScope.APIBase + "relation/delete/";
              $http({
                  method: 'POST',
                  url: url,
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  },
                  data: {
                      "sourceId": relatie.sourceId,
                      "key": relatie.key,
                      "targetId": relatie.targetId
                  }
              }).then(function(response) {
                  if(response.status == 200){
                      if(func) func();
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.deleteRelation(relatie, func);
                      });
                  } else {
                      alert("Mislukt om relatie te verwijderen");
                  }
              });
          }

          this.addImage = function(nodeId, data, func){

          }

          this.loadPaths = function(type, func){
              var self = this;

              var url = $rootScope.APIBase + "paths/" + type +"/";
              $http({
                  method: 'GET',
                  url: url,
                  headers: {
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  }
              }).then(function(response) {
                  log(response);
                  if(response.status == 200){
                      self.nodes = [];
                      if(response.data){
                          if(func) func(response.data);
                      }
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.loadPaths(type, func);
                      });
                  } else {
                      alert("Mislukt om nodes op te halen");
                  }
              });
          }

          this.addNodes = function(data, func){
              var url = $rootScope.APIBase + "nodes/add/";
              $http({
                  method: 'POST',
                  url: url,
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  },
                  data: data
              }).then(function(response) {
                  if(response.status == 200){
                      if(response.data){
                          var result = response.data;
                          console.log(result);
                          if(func) func(result);
                      }
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.addNodes(text, func);
                      });
                  } else {
                      alert("Mislukt om node toe te voegen");
                  }
              });
          }

          this.createTree = function(func){
           this.tree = {"title": "", "subs": [], "nodes": [], "level": 0};
              for(var i in this.nodes){
                  if(typeof this.nodes[i].path == 'string') {
                      var paths = this.nodes[i].path.split(";");
                      for (var j in paths) {
                          if (typeof paths[j] != 'string' || (paths[j].trim() == "" && paths.length > 1 && j == 0)) {
                              //Niet toevoegen, eerste 'lege'
                          } else {
                              this.addToTree(paths[j], this.nodes[i]);
                          }
                      }
                  }
              }
              if(func){
                  func(this.tree);
              }
          }

          this.addToTree = function(path, node){
              var currentPointInTree = this.tree;
              var levels = path.split("\\");
              for(var i in levels){
                  if(typeof levels[i] != 'string'){
                      //do niets
                  } else if(levels[i].trim() == ''){
                      currentPointInTree.nodes.push(node);
                  } else {
                      var found = false;
                      for(var j in currentPointInTree.subs){
                          if(currentPointInTree.subs[j] && currentPointInTree.subs[j].title == levels[i]){
                              currentPointInTree = currentPointInTree.subs[j];
                              found = true;
                          }
                      }
                      if(!found){
                          currentPointInTree.subs.push({"title": levels[i], "subs": [], "nodes": [], "level": i + 1});
                          currentPointInTree = currentPointInTree.subs[currentPointInTree.subs.length - 1];
                      }
                      if(parseInt(i)+1 == levels.length){
                          //Laatste level, dus hier toevoegen
                          currentPointInTree.nodes.push(node);
                      }
                  }
              }
          }
      }]
);
