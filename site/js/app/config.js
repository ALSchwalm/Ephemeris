/**
 * General configuration information
 * @module app/config
 */
define(function(){
    "use strict"

    /**
     * @alias module:app/config
     * @namespace
     * @property {object}  config                   - Configuration options
     * @property {object}  config.game              - General game configuration
     * @property {number}  config.game.width        - Width of the canvas in px
     * @property {number}  config.game.height       - Height of the canvas in px
     */
    var config = {
        game : {
            width : window.innerWidth,
            height : window.innerHeight,
            world : {
                width : 4000,
                height : 4000
            }
        },
        assets : {
            numPlanets : 8
        },
        map : {
            planetFrequency : 0.1,
            starFrequency : 0.001,
            starColors : [
                0xFFFFFF,
                0xEEEEAA,
            ]
        }
    };

    return config;
})
