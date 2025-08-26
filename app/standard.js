var heatColors = ['#ffffff', '#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'];

function log(input){
    //console.log(input);
}

function format_number (number, decimals, dec_point, thousands_sep, hide_zeros) {
  // http://kevin.vanzonneveld.net
  // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // Strip all characters but numerical ones.
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? '.' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? ',' : dec_point,
    hide_zeros = (typeof hide_zeros === 'undefined') ? false : hide_zeros,
    s = '',
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec && !hide_zeros) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/*
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};
*/

function RD2WGS(x, y) {
  // Coordinates of origin (Amersfoort)
  var x0 = 155000.0;
  var y0 = 463000.0;
  var phi0 = 52.15517440;
  var lambda0 =  5.38720621;
  var K = [ 
    {"p":0, "q":1, "K":3235.65389}, 
    {"p":2, "q":0, "K": -32.58297}, 
    {"p":0, "q":2, "K":  -0.24750}, 
    {"p":2, "q":1, "K":  -0.84978}, 
    {"p":0, "q":3, "K":  -0.06550}, 
    {"p":2, "q":2, "K":  -0.01709}, 
    {"p":1, "q":0, "K":  -0.00738}, 
    {"p":4, "q":0, "K":   0.00530}, 
    {"p":2, "q":3, "K":  -0.00039}, 
    {"p":4, "q":1, "K":   0.00033}, 
    {"p":1, "q":1, "K":  -0.00012}];
  var L = [
    {"p":1, "q":0, "L":5260.52916}, 
    {"p":1, "q":1, "L": 105.94684}, 
    {"p":1, "q":2, "L":   2.45656}, 
    {"p":3, "q":0, "L":  -0.81885}, 
    {"p":1, "q":3, "L":   0.05594}, 
    {"p":3, "q":1, "L":  -0.05607}, 
    {"p":0, "q":1, "L":   0.01199}, 
    {"p":3, "q":2, "L":  -0.00256}, 
    {"p":1, "q":4, "L":   0.00128}];
  var dx = (x - x0)/1E5;
  var dy = (y - y0)/1E5;
  var phi = phi0;
  for (var i = 0; i < K.length; ++i) {
    var p = K[i].p;
    var q = K[i].q;
    var k = K[i].K;
    phi += k*Math.pow(dx, p)*Math.pow(dy, q)/3600;
  }
  var lambda = lambda0; 
  for (var i = 0; i < L.length; ++i) {
    var p = L[i].p;
    var q = L[i].q;
    var l = L[i].L;
    lambda += l*Math.pow(dx, p)*Math.pow(dy, q)/3600;
  }
  return [180*phi/Math.PI, 180*lambda/Math.PI];
};

function distance(lat1, lon1, lat2, lon2) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515; //In miles
        dist = dist * 1.609344; // In kilometers
        return dist;
    }
}

function collect() {
  var ret = {};
  var len = arguments.length;
  for (var i=0; i<len; i++) {
    for (p in arguments[i]) {
      if (arguments[i].hasOwnProperty(p)) {
        ret[p] = arguments[i][p];
      }
    }
  }
  return ret;
}

var isChangedTempValue = null;
function isChanged(value){
    //console.log(isChangedTempValue + " vs " + value);
    if(value == isChangedTempValue){
        return false;   
    }
    isChangedTempValue = value;
    return true;
}


function average(arr, excludeOutliers){
    if(excludeOutliers){
        //First average for all points
        var avg = average(arr, false);
        var stdev = Math.sqrt(variance(arr));
        var sum = 0;
        var count = 0;
        
        //Then average without outliers
        for(i in arr){
            if(Math.abs(arr[i] - avg) < 2.5 * stdev){
                sum += arr[i];
                count++;
            }
        }
        return sum / count;
    } else {
        sum = 0;
        count = 0;
        for(i in arr){
            sum += arr[i];
            count++;
        }
        return sum / count;
    }
}

function variance(arr){
    var avg = average(arr);
    v = 0;
    count = 0;
    for(i in arr){
        v += Math.pow( (arr[ i ] - avg), 2 );
        count++;
    }
    return (v / count);
}

function stdev(arr, excludeOutliers){
    if(excludeOutliers){
        //First average for all points
        var avg = average(arr);
        var stdev = Math.sqrt(variance(arr));
        var sum = 0;
        var count = 0;
        
        //Then average and variance without outliers
        for(i in arr){
            if(Math.abs(arr[i] - avg) < 2.5 * stdev){
                sum += arr[i];
                count++;
            }
        }
        var new_avg = sum / count;
        
        var v = 0;
        count = 0;

        for(i in arr){
            if(Math.abs(arr[i] - avg) < 2.5 * stdev){
                v += Math.pow( (arr[ i ] - new_avg), 2 );
                count++;
            }
        }
        return Math.sqrt(v/count);
        
    } else {
        return Math.sqrt(variance(arr));
    }
}

function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  // handle case of empty input
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

function UCFirst(input) {
    if(input) return input.charAt(0).toUpperCase() + input.slice(1);
}

function similarWord(str1, str2, minLength = 4){
    const words1 = new Set(str1.toLowerCase().split(/[ ,.]+/));
    const words2 = new Set(str2.toLowerCase().split(/[ ,.]+/));
    return [...words1].some(word => (words2.has(word) && word.length > minLength));
}