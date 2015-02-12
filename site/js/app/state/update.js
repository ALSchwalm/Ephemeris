/**
 * A module returning a function which will be executed during each frame
 * @module app/state/update
 */
define(["app/controls", "app/interface", "app/fog"],
function(controls, hud, fog){
    "use strict"

    var active = false;

    /**
     * Function which will be executed by Phaser during each frame
     * @alias module:app/state/update
     *
     * @param {Phaser.Game} game - The current game object
     */
    var update = function(game) {
        controls.update();
        fog.update();
        hud.update();
    }

    return update;
});
