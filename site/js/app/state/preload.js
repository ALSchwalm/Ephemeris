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
                    type: "planet",
                    position : {
                        x: 500,
                        y: 700
                    },
                    asset : "planets/1.png"
                },
                {
                    type: "nebula",
                    position : {
                        x: 2700,
                        y: 1500
                    },
                    asset : "nebulas/0.png",
                    tint : 0x00FF00,
                    scale : {
                        x : 3,
                        y : 3
                    }
                },
                {
                    type: "planet",
                    position : {
                        x: 200,
                        y: 3700
                    },
                    asset : "planets/2.png"
                },
                {
                    type: "planet",
                    position : {
                        x: 3200,
                        y: 3000
                    },
                    asset : "planets/4.png"
                }
            ]
        });

        game.load.image('ship', 'assets/images/units/MercenaryFighter.png');
        game.load.image('shipOverlay', 'assets/images/units/MercenaryFighter_overlay.png');
        game.load.image('20select', 'assets/images/20select.png');
        game.load.image('20empty', 'assets/images/20empty.png');
        game.load.image('10fill', 'assets/images/10fill.png');
        game.load.image('flare2', 'assets/images/flare2.png');
    };

    return preload;
});
