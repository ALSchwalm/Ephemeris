/**
 * A module returning a function which will be executed during each frame
 * @module app/state/update
 */
define(["app/controls", "app/interface", "app/fog", "app/action"],
function(controls, hud, fog, action){
    "use strict"

    var active = false;

    /**
     * Function which will be executed by Phaser during each frame
     * @alias module:app/state/update
     *
     * @param {Phaser.Game} game - The current game object
     */
    var update = function(game) {
        if (game.running) {
            controls.update();
            fog.update();
            hud.update();
            action.update();
        }
    }

    return update;
});
