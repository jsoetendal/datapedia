Node = function(data) {
    var self = this;

    for (i in data) {
        if(i == "data"){
            //JSON
            this['data'] = JSON.parse(data.data);
        }else if(Array.isArray(data[i]) && (data[i][0].sourceId || data[i][0].targetId)){
            //In this case, it is always an array of nodes from nodesExtended
            this[i] = [];
            for(var j in data[i]){
                if(data[i][j].sourceId || data[i][j].targetId) {
                    //Only add if it is an node from an extendedNode
                    data[i][j].visible = true;
                    data[i][j].data = JSON.parse(data[i][j].data);
                    this[i].push(data[i][j]);
                    //TODO: Drie regels hierboven zouden vervangen moeten worden door onderstaande. Maar dat gaat fout, ik vermoed door een rare recursie.
                    //this[i].push(new Node(data[i][j]));
                }
            }
        } else {
            //All other cases
            this[i] = data[i];
        }
    }
    this.visible = true;
    //this.relations = {};
}

Node.prototype.addRelatedNode = function(node, key){
    if(!this.relations[key]){
        this.relations[key] = [];
    }
    this.relations[key].push(node);
}

Node.prototype.addDependentNode = function(node, key){
    if(!this.dependencies[key]){
        this.dependencies[key] = [];
    }
    this.dependencies[key].push(node);
}

Node.prototype.deleteRelatedNode = function(relation) {
    var temp = [];
    for (var i in this.relations[relation.key]) {
        if (this.relations[relation.key][i].targetId != relation.targetId) {
            temp.push(this.relations[relation.key][i]);
        }
    }
    this.relations[relation.key] = temp;
}

Node.prototype.deleteDependencyNode = function(relation) {
    var temp = [];
    for (var i in this.dependencies[relation.key]) {
        if (this.dependencies[relation.key][i].sourceId != relation.sourceId) {
            temp.push(this.dependencies[relation.key][i]);
        }
    }
    this.dependencies[relation.key] = temp;
}