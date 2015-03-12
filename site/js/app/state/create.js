/**
 * A module returning a function which will be executed during the 'create'
 * phase of Phaser js startup
 * @module app/state/create
 */
define(["app/config", "app/action", "app/controls", "app/network",
        "app/movement", "app/interface", "app/fog", "app/music", "app/player", "app/timer"],
function(config, handler, controls, network, movement,
         hud, fog, music, player, timer){
    "use strict"

    /**
     * Function which will be executed by Phaser after 'preload' is finished
     * @alias module:app/state/create
     *
     * @param {Phaser.Game} game - The current game object
     */
    var create = function(game){
        $("#paused-continue").click(function(){
            $("#paused").addClass("hidden");
        });

        $("#paused-forfeit").click(function(){
            handler.do({
                type : "forfeit",
                data : {
                    player : player
                }
            });
        });

        $("#download-replay").click(function(){
            handler.downloadReplay();
        })

        controls.init(game, handler);
        handler.init(game, hud);
        network.init(game, handler);
        movement.init(game, handler);
        timer.init(game);
        hud.init(game);
        fog.init(game);
        music.init(game);
        game.state.afterCreate();
    }
    return create;
});
