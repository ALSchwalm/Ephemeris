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
            height : window.innerHeight
        },
        assets : {
            numPlanets : 8
        },
        player : {
            colors : [0x0000FF, 0xFF0000],
            mutedColors : [0xAAAAFF, 0xFFAAAA],
        },
        map : {
            starFrequency : 0.001,
            starColors : [
                0xFFFFFF,
                0xEEEEAA,
            ],
            parallaxFactor : 50,
            controlPointConvertRate : 1/30
        },
        interface : {
            minimap : {
                scale : 0.07,
                gridLines : 20,
                fogOfWarResolution : 6
            },
            fogOfWarSize : 20,
            iconSize : 76,
            iconBarMaxWidth : 800
        }
    };

    return config;
})
