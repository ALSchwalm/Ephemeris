/**
 * A module returning a function which will be executed to load game assets
 * @module app/state/preload
 */
define(["app/config", "app/map"],
function(config, map){
    "use strict"

    /**
     * Function which will be executed by Phaser at start
     * @alias module:app/state/preload
     *
     * @param {Phaser.Game} game - The current game object
     */
    var preload = function(game){
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
                    image : "planets/planet1.png"
                },
                {
                    position : {
                        x: 1000,
                        y: 3000
                    },
                    image : "planets/planet2.png"
                }
            ]
        });

        game.load.image('ship', 'assets/images/units/MercenaryFighter.png');
        game.load.image('shipOverlay', 'assets/images/units/MercenaryFighter_overlay.png');
        game.load.image('20select', 'assets/images/20select.png');
        game.load.image('20empty', 'assets/images/20empty.png');
        game.load.image('flare2', 'assets/images/flare2.png');
    };

    return preload;
});
