/**
 * A module returning a function which will be executed during the 'create'
 * phase of Phaser js startup
 * @module app/state/create
 */
define(["app/config", "app/action", "app/controls", "app/network",
        "app/movement", "app/interface", "app/fog"],
function(config, handler, controls, network, movement, hud, fog){
    "use strict"

    /**
     * Function which will be executed by Phaser after 'preload' is finished
     * @alias module:app/state/create
     *
     * @param {Phaser.Game} game - The current game object
     */
    var create = function(game){
        controls.init(game, handler);
        handler.init(game);
        network.init(game, handler);
        movement.init(game, handler);
        hud.init(game);
        fog.init(game);
    };

    return create;
});
