/**
 * A module returning a function which will be executed to load game assets
 * @module app/state/preload
 */
define(["app/config", "app/map", "jquery"],
function(config, map, jQuery){
    "use strict"

    /**
     * Function which will be executed by Phaser at start
     * @alias module:app/state/preload
     *
     * @param {Phaser.Game} game - The current game object
     */
    var preload = function(game){
        game.load.onFileComplete.add(function(p){
            $("#loading-screen .loading-text").html("Loading: " + p + "%");
            $("#loading-screen .progress-bar").css('width', p+'%')
                .attr('aria-valuenow', p);
            if (p == 100) {
                setTimeout(function(){
                    $("#loading-screen").fadeOut();
                }, 500);
            }
        });

        map.init(game, {
            seed: "3.141597",
            width: 4000,
            height: 4000,
            regions : [
                {
                    type: "planet",
                    position : { x: 500, y: 700 },
                    asset : "planets/1.png"
                },
                {
                    type: "nebula",
                    position : { x: 2800, y: 1000 },
                    asset : "nebulas/0.png",
                    tint : 0x00FF00,
                    scale : { x : 3, y : 3 }
                },
                {
                    type: "nebula",
                    position : { x: 1200, y: 2300 },
                    asset : "nebulas/11.png",
                    tint : 0xFF0000,
                    scale : { x : 4, y : 4 }
                },
                {
                    type: "nebula",
                    position : { x: 2000, y: 2000 },
                    asset : "nebulas/11.png",
                    tint : 0xFF0000,
                    angle : 90,
                    scale : { x : 4, y : 4 }
                },
                {
                    type: "planet",
                    position : { x: 200, y: 3700 },
                    scale : { x : 0.4, y : 0.4 },
                    asset : "planets/2.png"
                },
                {
                    type: "planet",
                    position : { x: 3200, y: 3000 },
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
