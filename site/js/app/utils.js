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
        }
    };

    return utils;
});
