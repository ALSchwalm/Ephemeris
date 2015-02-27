/**
 * A module which defines the player
 * @module app/player
 */
define(["app/config", "app/utils"],
function(config, utils){
    "use strict"

    /**
     * Function which represents the player
     * @alias module:app/player
     */
    var Player = function(id, number, color) {

        /**
         * The player id
         */
        this.id = id || null;

        /**
         * The number of the player
         */
        this.number = null;
        if (typeof(number) !== "undefined") {
            this.number = number;
        }

        /**
         * This players color
         */
        this.color = color || this.getPlayerColor(number);

        /**
         * The set of opposing players
         */
        this.opponents = {};
    }

    /**
     * Get the color for the 'number' player (or null)
     */
    Player.prototype.getPlayerColor = function(number) {
        if (typeof(number) === "undefined")
            return 0x000000;
        return config.player.colors[number];
    }

    Player.prototype.init = function(id, number) {
        this.id = id;
        this.number = number;
        this.color = this.getPlayerColor(number);
    }

    Player.prototype.registerOpponent = function(id, number) {
        this.opponents[id] = new Player(id, number);
    }

    Player.prototype.clone = function(player) {
        for (var key in player) {
            this[key] = player[key];
        }
    }

    var player = new Player();

    return player;
});
