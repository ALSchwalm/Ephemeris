/**
 * A module returning a function which will be executed during each frame
 * @module app/state/update
 */
define(["app/controls", "app/interface", "app/fog",
        "app/action", "app/map", "app/player"],
function(controls, hud, fog, action, map, player){
    "use strict"

    var gameIsOver = function(game) {
        var unitPlayer = null;
        for (var i=0; i < game.units.length; ++i) {
            if (!unitPlayer) {
                unitPlayer = game.units[i].owner;
            } else if (game.units[i].owner &&
                       unitPlayer != game.units[i].owner) {
                // There are units from two different players
                return null;
            }
        }

        for (var i=0; i < map.controlPoints.length; ++i) {
            if (map.controlPoints[i].owner != unitPlayer) {
                // There is a control point owned by a different player
                return null;
            }
        }
        return unitPlayer;
    }

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

            var winner = gameIsOver(game);
            if (winner) {
                game.running = false;
                if (winner == player) {
                    $("#game-over h1").html("Victory");
                } else {
                    $("#game-over h1").html("Defeat");
                }
                $("#game-over").removeClass("hidden");
            }
        }
    }

    return update;
});
