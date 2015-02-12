/**
 * A module returning a function which will be executed to load game assets
 * @module app/state/preload
 */
define(["app/config"], function(config){
    "use strict"

    /**
     * Function which will be executed by Phaser at start
     * @alias module:app/state/preload
     *
     * @param {Phaser.Game} game - The current game object
     */
    var preload = function(game){
        game.load.image('ship', 'assets/images/units/MercenaryFighter.png');
        game.load.image('shipOverlay', 'assets/images/units/MercenaryFighter_overlay.png');
        game.load.image('20select', 'assets/images/20select.png');
        game.load.image('20empty', 'assets/images/20empty.png');
        game.load.image('flare2', 'assets/images/flare2.png');
        for (var i=0; i < config.assets.numPlanets; ++i) {
            game.load.image('planet' + i, 'assets/images/planets/planet' + i + '.png');
        }
    };

    return preload;
});
