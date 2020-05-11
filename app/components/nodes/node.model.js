Node = function(data) {
    var self = this;

    for (i in data) {
        this[i] = data[i];
    }
    if(data.data) {
        this['data'] = JSON.parse(data.data);
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