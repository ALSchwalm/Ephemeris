/**
 * Module defining some utility functions
 * @module app/utils
 */
define(["seedrandom"], function(seedrandom){
    "use strict"

    var utils = {
        rngSeed: null,
        rng: null,
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

        seededRandom: function() {
            if (this.rngSeed === null) {
                throw "Attempt to generate seeded random number with no seed"
            } else if (this.rng === null) {
                this.rng = new Math.seedrandom(this.rngSeed);
            }
            return this.rng();
        }
    };

    return utils;
});
