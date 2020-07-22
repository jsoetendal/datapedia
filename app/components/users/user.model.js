User = function(data) {
    var self = this;

    for (i in data) {
        this[i] = data[i];
    }
}