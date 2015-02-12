/**
 * A module which handles pathing and movement
 * @module app/movement
 */
define(["app/config", "app/utils"], function(config, utils){
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
        var dimension = Math.ceil(Math.sqrt(units.length));
        var index = 0;
        for (var i=0; i < dimension; ++i) {
            for (var j=0; j < dimension; ++j) {
                if (index > units.length-1) return this;

                var offsets = {
                    x: i*50 - (dimension-1)*50/2,
                    y: j*50 - (dimension-1)*50/2
                };

                var modifiedPoint = {
                    x: target.x + offsets.x,
                    y: target.y + offsets.y
                };

                this.handler.do({
                    type: "move",
                    data : {
                        id : units[index].id,
                        path: [modifiedPoint]
                    }
                });
                index++;
            }
        }
        return this;
    }

    /**
     * Begin moving a group of units toward a target
     *
     * @param {Unit[]} units - A group of units
     * @param {Unit} target - The target to engage
     */
    MovementHandler.prototype.groupEngageTarget = function(units, target) {
        units.map(function(unit){
            this.handler.do({
                type: "engage",
                data : {
                    source : unit.id,
                    target : target.id
                }
            });
        }.bind(this));
        return this;
    }

    var movement = new MovementHandler();
    return movement;
});
