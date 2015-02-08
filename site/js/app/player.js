/**
 * A module which defines the player
 * @module app/player
 */
define(["app/config"],
function(config){
    "use strict"

    /**
     * Function which represents the player
     * @alias module:app/player
     */
    var Player = function() {

        /**
         * The player id
         */
        this.id = null;
    }

    var player = new Player();

    return player;
});
