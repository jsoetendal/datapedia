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
                      let history = {'nodes': [], 'relations': {}};

                      for(let i in data.nodes){
                          history.nodes.push(new Node(data.nodes[i]));
                          if(data.nodes[i].status == 'current'){
                              history.currentNode = nodes[i];
                          }
                      }

                      for(let i in data.relations){
                          if(!history.relations[data.relations[i].key]) {
                              history.relations[data.relations[i].key] = {
                                  'key': data.relations[i].key,
                                  'nodes': {},
                              }
                          }
                          if(!history.relations[data.relations[i].key].nodes[data.relations[i].targetId]){
                              history.relations[data.relations[i].key].nodes[data.relations[i].targetId] = {
                                  "title": data.relations[i].title,
                                  'suggestions': 0,
                                  'laststatus': "",
                                  'versions': []
                              };
                          }
                          data.relations[i].data = JSON.parse(data.relations[i].data);
                          history.relations[data.relations[i].key].nodes[data.relations[i].targetId].versions.push(data.relations[i]);
                          if(data.relations[i].status == "suggested") history.relations[data.relations[i].key].nodes[data.relations[i].targetId].suggestions += 1;
                          history.relations[data.relations[i].key].nodes[data.relations[i].targetId].laststatus = data.relations[i].status;
                      }

                      for(let i in data.dependencies){
                          if(!history.relations[data.dependencies[i].key]){
                              history.relations[data.dependencies[i].key] = {
                                  'key': data.dependencies[i].key,
                                  'nodes': {}
                              }
                          }
                          if(!history.relations[data.dependencies[i].key].nodes[data.dependencies[i].sourceId]){
                              history.relations[data.dependencies[i].key].nodes[data.dependencies[i].sourceId] = {
                                  "title": data.dependencies[i].title,
                                  'suggestions': 0,
                                  'laststatus': "",
                                  'versions': []
                              };
                          }
                          data.dependencies[i].data = JSON.parse(data.dependencies[i].data);
                          history.relations[data.dependencies[i].key].nodes[data.dependencies[i].sourceId].versions.push(data.dependencies[i]);
                          if(data.dependencies[i].status == "suggested") history.relations[data.dependencies[i].key].nodes[data.dependencies[i].sourceId].suggestions += 1;
                          history.relations[data.dependencies[i].key].nodes[data.dependencies[i].sourceId].laststatus = data.dependencies[i].status;
                      }


                      if(func) func(history);
                  }
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
                          //console.log(newId);
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

          this.addRelationAndData = function(sourceId, key, targetId, data, func){
              var url = $rootScope.APIBase + "relation/add/";
              let postData = {
                  "sourceId": sourceId,
                  "key": key,
                  "targetId": targetId
              }
              if(data) postData.data = data;

              $http({
                  method: 'POST',
                  url: url,
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  },
                  data: postData
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
                          self.addRelationAndData(sourceId, key, targetId,data, func);
                      });
                  } else {
                      alert("Mislukt om node toe te voegen");
                  }
              });
          }

          this.addRelation = function(sourceId, key, targetId, func) {
              this.addRelationAndData(sourceId, key, targetId, null, func)
          }


              //Does exactly the same as addRelation, only difference is the node that is returned...
          this.addDependencyAndData = function(sourceId, key, targetId, data, func){
              var url = $rootScope.APIBase + "dependency/add/";
              let postData = {
                  "sourceId": sourceId,
                  "key": key,
                  "targetId": targetId
              }
              if(data) postData.data = data;

              $http({
                  method: 'POST',
                  url: url,
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  },
                  data: postData
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
                          self.addDependencyAndData(sourceId, key, targetId, data, func);
                      });
                  } else {
                      alert("Mislukt om node toe te voegen");
                  }
              });
          }

          this.addDependency = function(sourceId, key, targetId, func){
              this.addDependencyAndData(sourceId, key, targetId, null, func);
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
                      $("#melding").modal()
                      $rootScope.melding = {"titel": "Wijzigen niet opgeslagen", "tekst": "Je hebt geen toestemming om deze gegevens te wijzigen. Log opnieuw in of gebruik de eenmalige link opnieuw."}
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

          this.getTokenLink = function(nodeId, func){
              var self = this;

              var url = $rootScope.APIBase + "node/token/" + nodeId;
              $http({
                  method: 'GET',
                  url: url,
                  headers: {
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  }
              }).then(function(response) {
                  log(response);
                  if(response.status == 200){
                      if(response.data && func){
                          func(response.data);
                      }
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.getTokenLink(nodeId, func);
                      });
                  } else {
                      alert("Mislukt om node "+ nodeId +" op te halen");
                  }
              });
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

          this.loadUpdates = function(func){
              var self = this;

              var url = $rootScope.APIBase + "updates/";
              $http({
                  method: 'GET',
                  url: url,
                  headers: {
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  }
              }).then(function(response) {
                  log(response);
                  if(response.status == 200){
                      var suggestions = [];
                      if(func) func(response.data);
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.loadUpdates(func);
                      });
                  } else {
                      alert("Mislukt om updates op te halen");
                  }
              });
          }

          this.loadDeleted = function(func){
              var self = this;

              var url = $rootScope.APIBase + "deleted/";
              $http({
                  method: 'GET',
                  url: url,
                  headers: {
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  }
              }).then(function(response) {
                  log(response);
                  if(response.status == 200){
                      var suggestions = [];
                      if(func) func(response.data);
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.loadDeleted(func);
                      });
                  } else {
                      alert("Mislukt om updates op te halen");
                  }
              });
          }

          this.loadSuggestions = function(func){
              var self = this;

              var url = $rootScope.APIBase + "suggestions/";
              $http({
                  method: 'GET',
                  url: url,
                  headers: {
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  }
              }).then(function(response) {
                  log(response);
                  if(response.status == 200){
                      var suggestions = [];
                      if(func) func(response.data);
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.loadSuggesties(func);
                      });
                  } else {
                      alert("Mislukt om suggesties op te halen");
                  }
              });
          }

          this.callURL = function(url, func){
              $http({
                  method: 'GET',
                  url: url,
                  headers: {
                      'X-Authorization': 'Bearer ' + $rootScope.setup.user.auth.accesstoken
                  }
              }).then(function(response) {
                  log(response);
                  if(response.status == 200){
                      if(func) func(response.data);
                  } else {
                      log(response);
                  }
              }).catch(function(fallback) {
                  log(fallback);
                  if(fallback.status == 401){
                      //Refresh needed
                      $rootScope.setup.user.refreshUser(function(){
                          self.callURL(url, func);
                      });
                  } else {
                      console.log("Failed URL request: " +url);
                  }
              });
          }

          this.historyApprove = function(nodeVersion, func){
              this.callURL($rootScope.APIBase + "history/revert/" + nodeVersion.nodeVersionId, func);
          }

          this.historyRevert = function(nodeVersion, func){
              this.callURL($rootScope.APIBase + "history/revert/" + nodeVersion.nodeVersionId, func);
          }

          this.historyDelete = function(nodeVersion, func) {
              this.callURL($rootScope.APIBase + "history/delete/" + nodeVersion.nodeVersionId, func);
          }

          this.historyRelationApprove = function(relationVersion, func){
              this.callURL($rootScope.APIBase + "historyrelation/revert/" + relationVersion.relationVersionId, func);
          }

          this.historyRelationRevert = function(relationVersion, func){
              this.callURL($rootScope.APIBase + "historyrelation/revert/" + relationVersion.relationVersionId, func);
          }

          this.historyRelationDelete = function(relationVersion, func) {
              this.callURL($rootScope.APIBase + "historyrelation/delete/" + relationVersion.relationVersionId, func);
          }
      }]
);
