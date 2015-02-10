/**
 * A module which defines a basic unit
 * @module app/unit
 */
define(["app/config", "Phaser", "app/controls", "app/utils", "app/player"],
function(config, Phaser, controls, utils, player){
    "use strict"

    var Unit = function() {}
    Unit.prototype.init = function(game, config) {
        this.game = game;

        for (var id in config) {
            this[id] = config[id];
        }

        this._destination = this.destination || null;
        this.path = this.path || [];
        this.sprite = this.sprite || null;
        this.selectGraphic = this.selectGraphic || null;
        this.focus = this.focus || null;
        this.speed = this.speed || 1;
        this.id = this.id || utils.genUUID();
        this.playerID = this.playerID || player.id;
        if (this.playerID == player.id) {
            this.enemy = false;
        } else {
            this.enemy = true;
        }
        this.game.registerUnit(this);
    }

    Object.defineProperty(Unit.prototype, "position", {
        get : function() {
            return this.sprite.position;
        },
        set : function(value) {
            this.sprite.position = value;
        }
    });

    Object.defineProperty(Unit.prototype, "destination", {
        get : function() {
            if (this._destination instanceof Unit) {
                return this._destination.position;
            } else {
                return this._destination;
            }
        },
        set : function(value) {
            this._destination = value;
        }
    });

    Unit.prototype.onSelect = function() {
        if (this.selectGraphic == null) {
            this.selectGraphic = this.game.add.sprite(0, 0, "20select");
            this.selectGraphic.anchor = {x: 0.5, y:0.5};
            this.sprite.addChild(this.selectGraphic);
        }
    }

    Unit.prototype.onUnselect = function() {
        this.selectGraphic.destroy();
        this.selectGraphic = null;
    }

    Unit.prototype.moveTo = function(target) {
        if (typeof(target) === "string") {
            this.destination = this.game.units[target];
        } else if (target instanceof Array) {
            this.destination = target.shift();
            this.path = target;
        } else {
            this.path = [target];
        }
    }

    Unit.prototype.getDirection = function(obj) {
        var target = obj || ((this.focus) ? this.focus : this.destination);
        if (!target) return 0;
        var rads = this.game.physics.arcade.angleToXY(this.position,
                                                      target.x, target.y);
        return rads - Math.PI/2;
    }

    Unit.prototype.updateDirection = function() {
        var direction = this.getDirection();

        var diff = Math.abs(this.sprite.rotation - direction);
        if (diff > Math.PI) {
            this.sprite.rotation -= 0.1;
        } else {
            this.sprite.rotation += 0.1;
        }
    }

    Unit.prototype.moveTowardDestination = function() {
        if (!this.destination) {
            if (this.path.length) {
                this.destination = this.path.shift();
            } else {
                return this;
            }
        }

        var rads = this.getDirection(this.destination) + Math.PI/2;
        this.position.x += Math.cos(rads)*this.speed;
        this.position.y += Math.sin(rads)*this.speed;
        this.updateDirection();
        if (Phaser.Point.distance(this.position, this.destination) < 1) {
            if (this.path.length) {
                this.destination = this.path.shift();
            } else {
                this.destination = null;
            }
        }
    }

    return Unit;
});
