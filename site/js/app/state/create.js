/**
 * A module returning a function which will be executed during the 'create'
 * phase of Phaser js startup
 * @module app/state/create
 */
define(["app/config", "app/action", "app/ship", "app/controls", "app/network"],
function(config, handler, Ship, controls, network){
    "use strict"

    /**
     * Function which will be executed by Phaser after 'preload' is finished
     * @alias module:app/state/create
     *
     * @param {Phaser.Game} game - The current game object
     */
    var create = function(game){
        // Continue game after losing focus
        game.stage.disableVisibilityChange = true;

        game.world.setBounds(0, 0, 2000, 2000);
        controls.init(game, handler);
        handler.init(game);
        network.init(game, handler);
    };

    return create;
});
