/**
 * A module returning a function which will be executed during the 'create'
 * phase of Phaser js startup
 * @module app/state/create
 */
define(["app/config", "app/action", "app/map",
        "app/controls", "app/network", "app/movement",
        "app/interface"],
function(config, handler, map, controls, network, movement, hud){
    "use strict"

    /**
     * Function which will be executed by Phaser after 'preload' is finished
     * @alias module:app/state/create
     *
     * @param {Phaser.Game} game - The current game object
     */
    var create = function(game){
        map.init(game, {
            seed: "3.141597",
            width: 4000,
            height: 4000,
            regions : [
                {
                    position : {
                        x: 200,
                        y: 300
                    },
                    image : "planet1"
                },
                {
                    position : {
                        x: 1000,
                        y: 3000
                    },
                    image : "planet2"
                }
            ]
        });
        controls.init(game, handler);
        handler.init(game);
        network.init(game, handler);
        movement.init(game, handler);
        hud.init(game);
    };

    return create;
});
