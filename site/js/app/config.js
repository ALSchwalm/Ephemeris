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
        map : {
            starFrequency : 0.001,
            starColors : [
                0xFFFFFF,
                0xEEEEAA,
            ],
            parallaxFactor : 50
        },
        interface : {
            minimap : {
                scale : 0.07,
                gridLines : 20
            }
        }
    };

    return config;
})
