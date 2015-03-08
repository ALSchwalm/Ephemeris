/**
 * A module returning a function which will be executed to load game assets
 * @module app/state/preload
 */
define(["app/config", "app/map", "app/action", "jquery"],
function(config, map, handler, jQuery){
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
                $(".progress").hide();
                $("#loading-screen .loading-text").html("Ready: Waiting for other players");
            }
        });

        map.init(game, handler, config.mapFormat);

        game.load.image('ship', 'assets/images/units/MercenaryFighter.png');
        game.load.image('shipOverlay', 'assets/images/units/MercenaryFighter_overlay.png');
        game.load.image('fighterIcon', 'assets/images/icons/fighter.png');
        game.load.image('bomber', 'assets/images/units/MercenaryBomber.png');
        game.load.image('bomberIcon', 'assets/images/icons/bomber.png');
        game.load.image('carrier', 'assets/images/units/Carrier.png');
        game.load.image('carrierIcon', 'assets/images/icons/carrier.png');
        game.load.image('controlpointIcon', 'assets/images/icons/controlpoint.png');
        game.load.image('20select', 'assets/images/20select.png');
        game.load.image('120select', 'assets/images/120select.png');
        game.load.image('20empty', 'assets/images/20empty.png');
        game.load.image('120empty', 'assets/images/120empty.png');
        game.load.image('384empty', 'assets/images/384empty.png');
        game.load.image('10fill', 'assets/images/10fill.png');
        game.load.image('flare2', 'assets/images/flare2.png');
        game.load.spritesheet('flag', 'assets/animations/flag.png', 32, 32);
        game.load.spritesheet('explosion', 'assets/animations/explosion.png', 128, 128);

        game.load.audio("background", "assets/sounds/background.mp3");
        game.load.audio("explosion", "assets/sounds/explosion.wav");
    }

    return preload;
});
