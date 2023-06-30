'use strict';

// Define the `core` module
angular.module('core', ['core.nodes','core.users','core.user','core.setup', 'core.settings']);

angular.
  module('core').
  filter('plain', function() {
        return function(text, num_chars) {
            var str = text ? String(text).replace(/<[^>]+>/gm, '') : '';
            if (str.length <= num_chars) { return str; }
            const subString = str.substr(0, num_chars-1); // the original check
            return subString.substr(0, subString.lastIndexOf(" ")) + "&hellip;";
        };
    }
  ).
  filter('EUR', function() {
    return function(input) {
      return "EUR " + format_number(input);
    };
  }).
filter('EURROUND', function() {
    return function(input) {
        return "EUR " + format_number(500 * Math.round(input/500));
    };
}).
filter('bytes', function() {
    return function(input) {
        if(isNaN(input)) return "-";
        if(input > 1024 * 1024){
            return Math.round(input / (1024 * 102.4)) / 10 + " mb"
        } else if(input > 1024){
            return Math.round(input / (102.4)) / 10 + " kb"
        } else {
            return input + " bytes";
        }
    };
}).
  filter('number', function() {
    return function(input) {
        if(isNaN(input)) return "-";
        return input;
    };
  }).
  filter('numberformat', function() {
    return function(input, num_decimals) {
        if(!num_decimals) num_decimals = 0;
        return format_number(input, num_decimals);
    };
  }).
  filter('range', function() {
    return function(start, end) {
        if(start == end){
            return start;
        } else {
            return start + " - " + end;
        }
    };
  }).  
  filter('km', function() {
    return function(input) {
        if(parseFloat(input) < 1){
            return (parseFloat(input) * 1000) + "m";
        } else {
            return input + "km";
        }
    };
  }).
  filter('afstand', function() {
    return function(input) {
        if(parseFloat(input) < 1){
            return format_number((parseFloat(input) * 1000),0) + " meter";
        } else {
            return format_number(input,1) + " kilometer";
        }
    };
  }).
  filter('score', function() {
    return function(input) {
      if(isNaN(input)) return "";
      return getStanineDescription(parseFloat(input), 100, 10);
    };
  }).
  filter('keuze', function() {
    return function(input) {
        if(parseInt(input) == -1){
            return "Liever niet";
        } else if(parseInt(input) == 1){
            return "Liever wel";
        } else {
            return "Maakt niet uit";
        }
    };
  }).  
  filter('afstandkeuze', function() {
    return function(input) {
        if(parseInt(input) > 0){
            return "Binnen " + input + " km.";        
        }else if(parseFloat(input) > 0){
            return "Binnen " + (input * 1000) + " meter.";        
        }else {
            return "Maakt niet uit";
        }
    };
  }).
  filter('percentage', function() {
    return function(input, num_decimals) {
        if(parseFloat(input) >= 0){
            return format_number(input, num_decimals) + "%";        
        }else {
            return "-";
        }
    };
  }).
  filter('UCFirst', function() {
    return function(input) {
        if(input) return input.charAt(0).toUpperCase() + input.slice(1);
    };
  }).
  filter('UCList', function() {
    return function(input) {
        if(input) return input.charAt(0).toUpperCase() + input.slice(1).replace(/,/g,", ");
    };
  }).
filter('UCArray', function() {
    return function(input) {
        if(input){
            if(typeof input === 'string'){
                var result = input;
            }else if(typeof input === 'object' || typeof input === 'array' ){
                var result = input.join(", ");
            }
            return result.charAt(0).toUpperCase() + result.slice(1).replace(/,/g,", ");
        }
    };
}).
filter('array', function() {
    return function(input) {
        if(input){
            if(typeof input === 'string'){
                return input;
            }else if(typeof input === 'object' || typeof input === 'array' ){
                return input.join(", ");
            }
        }
    };
}).
filter('first', function(){
    return function(input){
        if(!Array.isArray(input)){
            return input;
        }else {
            return input[0];
        }
    }
}).
filter('last', function(){
    return function(input){
        if(!Array.isArray(input)){
            return input;
        }else {
            return input[input.length - 1];
        }
    }
})
    .filter('lastpath', function(){
        return function(input){
            if(!input) return null
            if(!input.split) return null
            var paths = input.split(";");
            var paths = input.split(";");
            return paths[paths.length - 1];
        }
    })
    .filter('path', function(){
        return function(input){
            if(!input) return null
            if(input.charAt(0) === ";") input = input.substr(1);
            return input.replaceAll(";",", ").replaceAll("\\"," > ").trim();
        }
    })
    .filter('dag', function() {
        return function(input) {
            if(!input) return input;
            if(input instanceof Date){
                var d = input;
            } else {
                var d = new Date(input);
            }
            return d.toLocaleDateString("default", {timeZone: 'Europe/Amsterdam', day: 'numeric'});
        };
    })
    .filter('maand', function() {
        return function(input) {
            if(!input) return input;
            if(input instanceof Date){
                var d = input;
            } else {
                var d = new Date(input);
            }
            return d.toLocaleDateString("default", {timeZone: 'Europe/Amsterdam', month:'long', year:'numeric'});
        };
    })
    .filter('tijd', function() {
        return function(input) {
            if(!input) return input;
            if(input instanceof Date){
                var d = input;
            } else {
                var d = new Date(input);
            }
            return d.toLocaleTimeString("default", {timeZone: 'Europe/Amsterdam', hour: '2-digit', minute:'2-digit'});
        };
    })
    .filter('compleetDateTime', function() {
        return function(input) {
            if(!input) return input;
            if(input instanceof Date){
                var d = input;
            } else {
                var d = new Date(input);
            }
            return d.toLocaleTimeString("default", {timeZone: 'Europe/Amsterdam', weekday: 'long', day: 'numeric', month:'long', year:"numeric", hour: '2-digit', minute:'2-digit'});
        };
    })
    .filter('correctTime', function() {
        return function(input) {
            if(!input) return input;
            if(input.toUpperCase() == 'ZOJUIST') return input;
            var d=new Date(input.replace(" ","T") + "Z"); //Convert to UTC timezone
            return d.toLocaleTimeString("default", {timeZone: 'Europe/Amsterdam',weekday: 'long', day: 'numeric', month:'long', hour: '2-digit', minute:'2-digit'});
        };
    }).
  filter('correctTimeUpdate', function() {
    return function(input) {
        var d=new Date(input.replace(" ","T") + "Z"); //Convert to UTC timezone
        var now = new Date();
        var diffmins = (now - d) / 60000;
        var diffdays = (now - d) / 86400000;
        var sameday = d.toDateString() === now.toDateString();
        if(diffmins <= 1){
            return "Zojuist";
        }else if(diffmins < 60){
            return Math.round(diffmins) + " min. geleden";
        }else if(sameday){
            return d.toLocaleTimeString("default", {timeZone: 'Europe/Amsterdam', hour: '2-digit', minute:'2-digit'});
        }else if(diffdays <= 6){
            return d.toLocaleTimeString("default", {timeZone: 'Europe/Amsterdam', weekday: 'long', hour: '2-digit', minute:'2-digit'});
        }else {
            return d.toLocaleString("default", {timeZone: 'Europe/Amsterdam', weekday:'long', day: 'numeric', month:'long', year:'numeric', hour: '2-digit', minute:'2-digit'}); //Display as locale
        }
    };
  }).
    filter('geleden', function(){
        return function(input){
            if(!input) return "";
            var d=new Date(input.replace(" ","T") + "Z"); //Convert to UTC timezone
            if(!d) return "";
            var now = new Date();
            var diffmins = (now - d) / 60000;
            var diffdays = (now - d) / 86400000;
            if(diffmins <= 1){
                return "Zojuist";
            }else if(diffmins < 120){
                return Math.round(diffmins) + " min. geleden";
            }else if(diffdays < 2) {
                return Math.round(diffmins / 60) + " uur geleden";
            } else if(diffdays <= 45){
                return Math.round(diffdays) + " dagen geleden";
            }else if(diffdays <= 730){
                return Math.round(diffdays/30.5) + " maanden geleden"
            }else {
                return Math.round(diffdays/365.25) + " jaar geleden"
            }
        }
    }).
  filter('localDate', function() {
    return function(input) {
        if(!input) return "-";
        var d=new Date(input.replace(" ","T") + "Z"); //Convert to UTC timezone
        return d.toLocaleString("default", {timeZone: 'Europe/Amsterdam', day: 'numeric', month:'numeric', year:'numeric'}); //Display as locale
    };
  }).
  filter('UTCDate', function() {
    return function(input) {
        if(!input) return "-";
        var d=new Date(input); //Convert to UTC timezone
        return d.toLocaleString("default", {timeZone: 'Europe/Amsterdam', day: 'numeric', month:'numeric', year:'numeric'}); //Display as locale
    };
  }).
  filter('status', function() {
    return function(input) {
        if(!input) return "-";
        if(input.trim() != "") return input.charAt(0).toUpperCase() + input.slice(1);
        return "-";
    };
  }).
filter('duur', function() {
    return function(input){
        if(!input) return "";
        var parts = input.split(";");
        var d=new Date(parts[0].replace(" ","T") + "Z"); //Convert to UTC timezone
        if(!d ) return "";
        if(parts[1]){
            var now=new Date(parts[1].replace(" ","T") + "Z"); //Convert to UTC timezone
        }
        if(!now || isNaN(now)){
            var now = new Date();
        }
        var diffmins = (now - d) / 60000;
        var diffdays = (now - d) / 86400000;
        var sameday = d.toDateString() === now.toDateString();
        if(diffmins < 60){
            return Math.round(diffmins) + " minuten";
        }else if(diffdays < 1){
            return Math.floor(diffdays * 24) + " uur"
        }else if(diffdays <= 14){
            return Math.floor(diffdays) + " dagen"
        }else if(diffdays <= 60){
            return Math.floor(diffdays / 7) + " weken"
        } else {
            return Math.floor(diffdays / 30.5) + " maanden"
        }
    }
 }).
filter('nodeIdNotIn', function() {
    return function(arr1, arr2) {
        if(!arr1) return false;
        return arr1.filter(function(val) {
            for(var i in arr2){
                if(arr2[i].nodeId == val.nodeId) return false;
            }
            return true;
        })
    }
}).
  directive('nieuw', function() {
    return {
        replace: true,
        template: '<span><span class="label accent m-r-xs" ng-if="nieuw">Nieuw</span>{{text}}</span>',
        link: function(scope, el, attrs) {
            var insert = attrs.insert;
            var now = new Date();
            var diffdays = (now - insert) / 86400000;
            if(diffdays < 1){
                scope.nieuw = true;
                var diffhours = diffdays * 24;
                if(diffhours <= 1.5){
                    scope.text = "Zojuist toegevoegd";
                } else {
                    scope.text = Math.round(diffhours) + " uur geleden"
                }
            }else if(diffdays <= 5){
                scope.nieuw = true;
                var dagen = Math.round(diffdays);
                if(dagen == 1){
                    scope.text = "1 dag geleden"
                } else {
                    scope.text = dagen + " dagen geleden"
                }
            }else if(diffdays <= 45){
                scope.nieuw = false;
                scope.text = Math.round(diffdays) + " dagen geleden";
            }else if(diffdays <= 182){
                scope.nieuw = false;
                scope.text = Math.round(diffdays/30.5) + " maanden geleden"               
            }else {
                scope.nieuw = false;
                scope.text = "Langer dan 6 maanden geleden";
            }           
        },
    };
})
.directive('dagenverschil', function() {
    return {
        replace: true,
        template: '<span>{{aantal}} dagen</span>',
        link: function(scope, el, attrs) {
            var aDate=new Date(attrs.a);
            if(!attrs.b){ 
                var bDate = new Date()
            } else {
                var bDate = new Date(attrs.b);
            }
            scope.aantal = Math.abs(Math.ceil((bDate - aDate) / 86400000));
        },
    };
})
.directive('verschil', function() {
    return {
        replace: true,
        template: '<span style="color: {{color}}"><i class="fa {{icon}}"></i> EUR {{verschil}}</span>',
        link: function(scope, el, attrs) {
            var a=parseInt(attrs.a);
            var b=parseInt(attrs.b);
            var verschil = b - a;
            if(verschil < 0){
                scope.color = "red";
                scope.icon = "fa-minus"
            } else {
                scope.color = "green";
                scope.icon = "fa-plus"
            }
            scope.verschil = format_number(Math.abs(verschil));
            if(a > 0){
                scope.perc = Math.round((verschil / a) * 1000)/10;
            } else {
                scope.perc = 0;
            }
        },
    };
})
.directive('verschilp', function() {
    return {
        replace: true,
        template: '<span style="color: {{color}}"><i class="fa {{icon}}"></i> {{perc}}%</span>',
        link: function(scope, el, attrs) {
            var a=parseInt(attrs.a);
            var b=parseInt(attrs.b);
            var verschil = b - a;
            if(verschil < 0){
                scope.color = "red";
                scope.icon = "fa-minus"
            } else {
                scope.color = "green";
                scope.icon = "fa-plus"
            }
            scope.verschil = format_number(Math.abs(verschil));
            if(a > 0){
                scope.perc = Math.round((Math.abs(verschil) / a) * 1000)/10;
            } else {
                scope.perc = 0;
            }
        },
    };
})
.filter('EURverschil', function() {
return function(input) {
    if(input < 0){
        return "<span class='red'>EUR " + format_number(input) + "</span>";
    } else {
        return "<span class='green'>EUR " + format_number(input) + "</span>";
    }
};
}).filter('maxlength', function(){
    return function(input,max){
        if(input && input.length < max){
            return input;
        }else if(input){
            return input.substr(0,max) + "...";
        }
    };
}).filter('truncate', function(){
    return function(input,max){
        if(input && input.length < max){
            return input;
        }else if(input){
            return input.substr(0,max);
        }
    };
}).filter('substr', function(){
    return function(input,start,length){
        var result = "";
        if(input){
            result = input.substr(start,length);
            if(input.length > start + length){
                result += "..."
            }
        }
        return result;
    };
})
    .directive('addToggle', [function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                label: '=',
                arr: '=',
            },
            template:
                ['<div class="twotoggle toggle">',
                    '<span ng-show="disabled" class="label grey-300"><i class="fa fa-check"></i></span>',
                    '<span ng-show="!disabled && checked" class="label green" ng-click="delValue();"><i class="fa fa-check"></i></span>',
                    '<span ng-hide="disabled || checked" class="label grey-300" ng-click="addValue();"><i class="fa"></i></span>',
                    ' {{label}}</div>'].join(''),
            link: function(scope, el, attrs) {

                scope.$watch("arr",function(newValue,oldValue) {
                    if(vm.arr[0] == vm.label){
                        vm.checked = true;
                        vm.disabled = true;
                    }else if(vm.arr.indexOf(vm.label) > 0){
                        vm.checked = true;
                        vm.disabled = false;
                    } else {
                        vm.checked = false;
                        vm.disabled = false;
                    }
                }, true);

                // VM shorthand
                var vm = scope;

                vm.addValue = function(){
                    if(vm.arr.indexOf(vm.label) == -1){
                        vm.arr.push(vm.label);
                    }
                    vm.checked = true;
                }

                vm.delValue = function(){
                    if(vm.arr.indexOf(vm.label) > -1){
                        vm.arr.splice(vm.arr.indexOf(vm.label),1);
                    }
                    vm.checked = false;
                }
            },
        };
    }])
    .directive('addToggle2', [function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                label: '=',
                arr: '=',
            },
            template:
                ['<div class="twotoggle toggle">',
                    '<span ng-show="disabled" class="label grey-300"><i class="fa fa-check"></i></span>',
                    '<span ng-show="!disabled && checked" class="label green" ng-click="delValue();"><i class="fa fa-check"></i></span>',
                    '<span ng-hide="disabled || checked" class="label grey-300" ng-click="addValue();"><i class="fa"></i></span>',
                    ' {{label}}</div>'].join(''),
            link: function(scope, el, attrs) {

                scope.$watch("arr",function(newValue,oldValue) {
                    if(vm.arr.indexOf(vm.label) > -1){
                        vm.checked = true;
                        vm.disabled = false;
                    } else {
                        vm.checked = false;
                        vm.disabled = false;
                    }
                }, true);

                // VM shorthand
                var vm = scope;

                vm.addValue = function(){
                    if(vm.arr.indexOf(vm.label) == -1){
                        vm.arr.push(vm.label);
                    }
                    vm.checked = true;
                }

                vm.delValue = function(){
                    if(vm.arr.indexOf(vm.label) > -1){
                        vm.arr.splice(vm.arr.indexOf(vm.label),1);
                    }
                    vm.checked = false;
                }
            },
        };
    }])
.directive('tobottom', ['$window','$timeout', function ($window, $timeout) {

     return {
        link: link,
        restrict: 'C',
     };

     function link(scope, element, attrs){
        var el = element;
        var padding = 40;
        
        $timeout(function(){
            var offsetTop = $(".tobottom").offset().top; //element.offset() doesn't work, so this only works wit one 'tobottom' element on the page
            var height = $window.innerHeight - offsetTop - padding;
            el.css({height: height});
            
            angular.element($window).bind('resize', function(){
                var height = $window.innerHeight - offsetTop - padding;
                el.css({height: height});
            });
        }, false);
     }

 }])
    .directive("imgUpload",function($http,$compile){
        return {
            restrict : 'AE',
            scope : {
                key : "@",
                msg: "@",
                node : "=",
                max: "@"
            },
            template : 	'<input class="fileUpload" type="file" multiple />'+
                '<div class="preview clearfix" ng-if="previewData.src">'+
                '<div class="previewData clearfix">'+
                '<img src={{previewData.src}}></img>'+
                '<div class="previewDetails">'+
                '{{previewData.name}}, {{previewData.type}}'+
                '<span ng-click="remove(data)" class="circle remove">'+
                '<i class="fa fa-close"></i>'+
                '</span><span ng-show="previewData.resized" class="text-warning"><br/>De afbeelding is automatisch verkleind naar max. {{max}} pixels.</span>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '<div class="dropzone">'+
                '<p class="msg">{{msg}}</p>'+
                '</div>',
            link : function(scope,elem,attrs){
                var formData = new FormData();
                scope.previewData = [];

                function previewFile(file){
                    var reader = new FileReader();
                    var obj = new FormData().append('file',file);
                    reader.onload=function(data){
                        //NIEUW::
                        var img = document.createElement("img");
                        img.onload = function (event) {
                            // Dynamically create a canvas element
                            var MAX_WIDTH = scope.max;
                            var MAX_HEIGHT = scope.max;

                            var width = img.width;
                            var height = img.height;

                            if(scope.max && (width > MAX_WIDTH || height > MAX_HEIGHT)) {
                                // Change the resizing logic
                                if (width > height) {
                                    if (width > MAX_WIDTH) {
                                        height = height * (MAX_WIDTH / width);
                                        width = MAX_WIDTH;
                                    }
                                } else {
                                    if (height > MAX_HEIGHT) {
                                        width = width * (MAX_HEIGHT / height);
                                        height = MAX_HEIGHT;
                                    }
                                }

                                var canvas = document.createElement("canvas");
                                canvas.width = width;
                                canvas.height = height;
                                var ctx = canvas.getContext("2d");
                                ctx.drawImage(img, 0, 0, width, height);

                                // Show resized image in preview element
                                var dataurl = canvas.toDataURL(file.type);
                                var resized = true;
                            } else {
                                //
                                var dataurl = data.target.result;
                                var resized = false;
                            }
                            //document.getElementById("preview").src = dataurl;
                            var size = ((file.size/(1024*1024)) > 1)? Math.round(10 *(file.size/(1024*1024)))/10 + ' MB' : Math.round(10* (file.size/		1024))/10+' KB';
                            scope.$apply(function(){
                                scope.previewData = {'name':file.name,'size':size, 'resized': resized, 'type':file.type,
                                    'src':dataurl,'data':obj, 'originalValue': scope.previewData.originalValue};
                                if(scope.node[scope.key] && typeof scope.node[scope.key] == "string"){
                                    scope.previewData.originalValue = scope.node[scope.key];
                                }
                                scope.node[scope.key] = scope.previewData; //Was eerder pushen naar previewData om meerdere toe te staan
                                //console.log(scope.node);
                            });
                        }
                        img.src = data.target.result;


                        //BESTAAND:
                        /*
                        var src = data.target.result;
                        var size = ((file.size/(1024*1024)) > 1)? Math.round(10 *(file.size/(1024*1024)))/10 + ' MB' : Math.round(10* (file.size/		1024))/10+' KB';
                        scope.$apply(function(){
                            scope.previewData = {'name':file.name,'size':size, 'width': reader.width, 'height': reader.height, 'type':file.type,
                                'src':src,'data':obj, 'originalValue': scope.previewData.originalValue};
                            if(scope.node[scope.key] && typeof scope.node[scope.key] == "string"){
                                scope.previewData.originalValue = scope.node[scope.key];
                            }
                            scope.node[scope.key] = scope.previewData; //Was eerder pushen naar previewData om meerdere toe te staan
                            //console.log(scope.node);
                        });
                         */
                    }
                    reader.readAsDataURL(file);
                }

                function uploadFile(e,type){
                    e.preventDefault();
                    var files = "";
                    if(type == "formControl"){
                        files = e.target.files;
                    } else if(type === "drop"){
                        files = e.originalEvent.dataTransfer.files;
                    }
                    for(var i=0;i<files.length;i++){
                        var file = files[i];
                        if(file.type.indexOf("image") !== -1){
                            previewFile(file);
                        } else {
                            alert(file.name + " is not supported");
                        }
                    }
                }
                elem.find('.fileUpload').bind('change',function(e){
                    uploadFile(e,'formControl');
                });

                elem.find('.dropzone').bind("click",function(e){
                    $compile(elem.find('.fileUpload'))(scope).trigger('click');
                });

                elem.find('.dropzone').bind("dragover",function(e){
                    e.preventDefault();
                });

                elem.find('.dropzone').bind("drop",function(e){
                    uploadFile(e,'drop');
                });

                scope.remove=function(data){
                    if(scope.previewData.originalValue){
                        scope.node[scope.key] = scope.previewData.originalValue;
                    } else {
                        scope.node[scope.key] = null;
                    }
                    scope.previewData = [];
                }
            }
        }
    })
    .directive("fileUpload",function($http,$compile){
        return {
            restrict : 'AE',
            scope : {
                msg: "@",
                attachments : "="
            },
            template : 	'<input class="fileUpload" type="file" multiple />'+
                '<div class="dropzone">'+
                '<p class="msg">{{msg}}</p>'+
                '</div>',
            link : function(scope,elem,attrs){
                var formData = new FormData();
                scope.previewData = [];

                function addFile(file){
                    var reader = new FileReader();
                    var obj = new FormData().append('file',file);
                    reader.onload=function(data){
                        var src = data.target.result;
                        scope.$apply(function(){
                            if(!scope.attachments) scope.attachments = [];
                            scope.attachments.push({'name':file.name,'title':file.name,'size':file.size,'type':file.type,
                                'src':src,'data':obj});
                        });
                    }
                    reader.readAsDataURL(file);
                }

                function uploadFile(e,type){
                    e.preventDefault();
                    var files = "";
                    if(type == "formControl"){
                        files = e.target.files;
                    } else if(type === "drop"){
                        files = e.originalEvent.dataTransfer.files;
                    }
                    for(var i=0;i<files.length;i++){
                        var file = files[i];
                        addFile(file);
                    }
                }
                elem.find('.fileUpload').bind('change',function(e){
                    uploadFile(e,'formControl');
                });

                elem.find('.dropzone').bind("click",function(e){
                    $compile(elem.find('.fileUpload'))(scope).trigger('click');
                });

                elem.find('.dropzone').bind("dragover",function(e){
                    e.preventDefault();
                });

                elem.find('.dropzone').bind("drop",function(e){
                    uploadFile(e,'drop');
                });
            }
        }
    })
// source: https://docs.angularjs.org/api/ng/service/$compile
.directive('compile', function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                // watch the 'compile' expression for changes
                return scope.$eval(attrs.compile);
            },
            function(value) {
                // when the 'compile' expression changes
                // assign it into the current DOM
                element.html(value);

                // compile the new DOM and link it to the current
                // scope.
                // NOTE: we only compile .childNodes so that
                // we don't get into infinite loop compiling ourselves
                $compile(element.contents())(scope);
            }
        );
    };
});
;
