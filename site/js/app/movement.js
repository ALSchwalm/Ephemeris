/**
 * A module which handles pathing and movement
 * @module app/movement
 */
define(["app/config"], function(config){
    "use strict"

    /**
     * A type which provides simple pathing and movement utilites
     * @alias module:app/movement
     */
    var MovementHandler = function() {}

    /**
     * Initialize the action handler
     *
     * @param {Phaser.Game} game - A reference to the current game object
     * @param {ActionHandler} handler - A reference the game action handler
     */
    MovementHandler.prototype.init = function(game, handler) {
        this.game = game;
        this.handler = handler;
        return this;
    }

    /**
     * Begin a movement of a group of units to around a target point
     *
     * @param {Unit[]} units - A group of units
     * @param {Phaser.Point} target - The destination point
     */
    MovementHandler.prototype.groupMoveToPoint = function(units, target) {
        units.map(function(unit){
            this.handler.do({
                type: "move",
                data : {
                    id : unit.id,
                    path: [target]
                }
            });
        }.bind(this));
        return this;
    }

    var movement = new MovementHandler();
    return movement;
});
