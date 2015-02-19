/**
 * A module which defines control points
 * @module app/controlpoint
 */
define(["app/config", "Phaser", "app/player"],
function(config, Phaser, player){
    "use strict"

    /**
     * A type defining in-game control points
     * @alias module:app/controlpoint
     */
    var ControlPoint = function(game, handler, x, y, owner) {
        /**
         * A reference to the current game
         * @type {Phaser.Game}
         */
        this.game = game;

        /**
         * A reference to this games ActionHandler
         * @type {ActionHandler}
         */
        this.handler = handler;

        /**
         * The id of the player controlling this resource
         */
        this.owner = owner || null;

        /**
         * The radius of the circle of FoW holding the control point clears
         */
        this.view = 500;

        /**
         * The range within which a unit can capture this control point
         */
        this.range = 384;

        this.convertPercent = 0;

        this.graphics = this.game.add.group();
        this.graphics.position = new Phaser.Point(x, y);
        this.display();
    }

    Object.defineProperty(ControlPoint.prototype, "position", {
        get : function() {
            return this.graphics.position;
        },
        set : function(value) {
            this.graphics.position = value;
        }
    });

    ControlPoint.prototype.redraw = false;

    ControlPoint.prototype.update = function() {
        var attemptedOwner = null;
        var magnitude = 1;
        for (var id in this.game.units) {
            var unit = this.game.units[id];
            if (unit.health > 0 &&
                Phaser.Point.distance(unit.position, this.position) < this.range){
                if (attemptedOwner == null) {
                    attemptedOwner = unit.player;
                } else if (attemptedOwner != unit.player) {
                    return this;
                } else {
                    ++magnitude;
                }
            }
        }

        if (attemptedOwner == null) {
            this.convertPercent = 0;
        } else if (this.convertPercent <= 100){
            this.convertPercent += config.map.controlPointConvertRate*magnitude;

            if (this.convertPercent >= 100) {
                this.owner = attemptedOwner;
                this.updateColor();
            }
        }

        return this;
    }

    ControlPoint.prototype.updateColor = function() {
        ControlPoint.redraw = true;
        if (this.owner) {
            this.sprite.tint = this.owner.color;
        } else {
            this.sprite.tint = 0xFFFFFF;
        }
    }

    ControlPoint.prototype.display = function() {
        var loaded = this.game.cache.checkImageKey("384empty");
        if (loaded) {
            this.sprite = this.graphics.create(0, 0, "384empty");
            this.sprite.anchor.set(0.5, 0.5);
            this.sprite.update = this.update.bind(this);
            this.updateColor();

            setInterval(function(){
                this.sprite.angle += 0.05;
            }.bind(this), 100);
        } else {
            this.game.load.onFileComplete.add(function(p, name){
                if (name == "384empty") {
                    this.display();
                }
            }.bind(this));
        }
    }

    return ControlPoint;
});
