/**
 * Module defining some utility functions
 * @module app/utils
 */
define(function(){
    "use strict"

    var utils = {
        genUUID: function() {
            // Credit to http://stackoverflow.com/a/2117523
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
                .replace(/[xy]/g, function(c) {
                    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                    return v.toString(16);
            });
        },

        clone: function(obj){
            return JSON.parse(JSON.stringify(obj));
        },

        transform : function(oldMin, oldMax, newMin, newMax, value) {
            var oldRange = oldMax - oldMin;
	    var newRange = newMax - newMin;
	    var newValue = (((value - oldMin) * newRange)/oldRange) + newMin;
	    return newValue;
        },

        angleDifference : function(angle1, angle2) {
            var diff = Math.abs(angle1 - angle2);

            if (diff > Math.PI) {
                diff = 2*Math.PI - diff;
            }
            return diff;
        }
    };

    return utils;
});
