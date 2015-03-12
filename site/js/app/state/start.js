/**
 * A module returning a function which will be when all players have connected
 * and the game is ready to start
 * @module app/state/start
 */
define(["app/config", "app/interface", "app/map", "app/network",
        "app/action", "app/music", "app/timer", "app/player", "jquery"],
       function(config, hud, map, network, action, music,
                timer, player, jquery){
    "use strict"

    /**
     * Function which will be executed by Phaser after 'create' is completed
     * and all players have connected
     * @alias module:app/state/start
     *
     * @param {Phaser.Game} game - The current game object
     */
    var start = function(game){
        map.addControlPoints();
        hud.displayControlPoints();
        network.onAllReady = function(replay) {
            setTimeout(function(){
                $("#loading-screen").fadeOut();
            }, 500);
            map.controlPoints.map(function(point){
                point.start();
            });
            game.running = true;
            game.startTime = new Date().getTime();
            music.playSong("background");
            action.startReplay(replay);
            timer.start();

            if (!replay) {
                config.mapFormat.startingUnits[player.number+1].map(function(conf) {
                    action.do(conf);
                });
            }
        }
        network.ready();
    }
    return start;
});
