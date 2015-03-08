/**
 * A module which handles pathing and movement
 * @module app/movement
 */
define(["app/config", "Phaser", "app/utils"], function(config, Phaser, utils){
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
                this.drawMovementPont(modifiedPoint);
                index++;
            }
        }
        return this;
    }

    /**
     * Show a movement point effect at the given point which fades out over
     * the given time.
     *
     * @param {Phaser.Point} point - Where to show the effect
     * @param {time} fadeTime - Duration of the effect
     */
    MovementHandler.prototype.drawMovementPont = function(point, fadeTime) {
        var fadeTime = fadeTime || 200;
        var moveGraphic = this.game.add.image(point.x,
                                              point.y,
                                              "10fill");
        moveGraphic.anchor = {x:0.5, y:0.5};
        moveGraphic.tint = 0x00DD00;
        this.game.add.tween(moveGraphic.scale).to({
            x: 0,
            y: 0
        }, fadeTime).start().onComplete.add(function(){
            moveGraphic.destroy();
        });
    }

    /**
     * Move the selected units to the given points.
     *
     * @param {Unit[]} units - The group of units
     * @param {Phaser.Point[]} points - An array of target points
     */
    MovementHandler.prototype.moveGroupToPoints = function(units, points) {
        var pointsPerUnit = Math.floor(points.length / units.length) || 1;

        var points = points.filter(function(point, i){
            if (i==0)
                return true;
            return Phaser.Point.distance(points[i-1], point) > 20;
        });

        units.forEach(function(unit, i){
            var index = (i*pointsPerUnit < points.length) ? i*pointsPerUnit :
                Math.floor(Math.random()*points.length);
            this.handler.do({
                type: "move",
                data : {
                    id : unit.id,
                    path: [points[index]]
                }
            });
        }, this);
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
