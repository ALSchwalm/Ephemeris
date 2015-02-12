/**
 * A module which defines a basic unit
 * @module app/unit
 */
define(["app/config", "Phaser", "app/controls", "app/utils", "app/player"],
function(config, Phaser, controls, utils, player){
    "use strict"

    /**
     * The base class of all in-game units. Newly defined units should
     * invoke Unit.init at the beginning of their constructors.
     * @alias module:app/unit
     */
    var Unit = function() {}

    /**
     * Initialize this unit
     *
     * @param {Phaser.Game} game - A reference to the current game object
     * @param {ActionHandler} handler - A reference to this game's ActionHandler
     * @param {object} config - Configuration for this unit
     */
    Unit.prototype.init = function(game, handler, config) {

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

        for (var id in config) {
            this[id] = config[id];
        }

        this._destination = this.destination || null;
        this.path = this.path || [];
        this.sprite = this.sprite || null;
        this.selectGraphic = this.selectGraphic || null;

        /**
         * The speed of this unit
         * @type {Number}
         */
        this.speed = this.speed || 1;

        /**
         * Attack range of this unit
         * @type {Number}
         */
        this.range = this.range || 100;

        /**
         * How frequently this unit can attack in ms
         * @type {Number}
         */
        this.attackRate = this.attackRate || 500;

        /**
         * A UUID for this unit
         * @type {string}
         */
        this.id = this.id || utils.genUUID();

        /**
         * The ID of the player which controls this unit
         * @type {string}
         */
        this.playerID = this.playerID || player.id;

        this.target = this.target || null;
        this.attacking = false;

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
            if (value instanceof Unit) {
                this.target = value;
            } else {
                this.target = null;
            }
            this._destination = value;
        }
    });

    /**
     * Callback executed when the unit is selected
     */
    Unit.prototype.onSelect = function() {
        if (this.selectGraphic == null) {
            this.selectGraphic = this.game.add.sprite(0, 0, "20select");
            this.selectGraphic.anchor = {x: 0.5, y:0.5};
            this.sprite.addChild(this.selectGraphic);
        }
    }

    /**
     * Callback executed when the unit is unselected
     */
    Unit.prototype.onUnselect = function() {
        this.selectGraphic.destroy();
        this.selectGraphic = null;
    }

    /**
     * Move the target toward a location
     *
     * @param {Phaser.Point|Unit} target - A point or unit to move toward
     */
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

    /**
     * Find the angle between the unit and the target point
     */
    Unit.prototype.getDirection = function(obj) {
        var target = obj || this.destination;
        if (!target) return 0;
        var rads = this.game.physics.arcade.angleToXY(this.position,
                                                      target.x, target.y);
        return rads - Math.PI/2;
    },

    Unit.prototype.normalizeAngle = function(angle) {
        if (angle < 0) {
            angle += 2*Math.PI;
        } else if (angle > 2*Math.PI) {
            angle -= 2*Math.PI;
        }
        return angle;
    }

    Unit.prototype.updateDirection = function() {
        var direction = this.getDirection();

        var diff = Math.abs(this.sprite.rotation - direction);
        diff = this.normalizeAngle(diff);
        if (diff > Math.PI) {
            this.sprite.rotation -= 0.1;
        } else {
            this.sprite.rotation += 0.1;
        }
        this.sprite.rotation = this.normalizeAngle(this.sprite.rotation);
    }

    /**
     * Show an attack from this unit to 'target'
     *
     * @param {Phaser.Point} [target=this.destination] - Target to attack
     */
    Unit.prototype.attack = function(target) {
        var target = (target) ? target : this.destination;

        var shot = this.game.add.sprite(this.position.x,
                                        this.position.y, "flare2");
        shot.anchor = {x:0.5, y:0.5};
        var tween = this.game.add.tween(shot);
        tween.to({
            x: target.x,
            y: target.y
        }, 200).start();

        tween.onComplete.add(function(){
            var scaleTween = this.game.add.tween(shot.scale);
            scaleTween.to({
                x: 0,
                y: 0
            }, 100).start();
        }.bind(this));
    }

    Unit.prototype.moveTowardDestination = function() {
        if (!this.destination) {
            if (this.path.length) {
                this.destination = this.path.shift();
            } else {
                return this;
            }
        }

        this.updateDirection();
        var rads = this.getDirection(this.destination) + Math.PI/2;
        var normalizedAngle = this.normalizeAngle(rads+Math.PI/2);

        if (Phaser.Point.distance(this.position, this.destination) < this.range &&
            this.target) {
            if (!this.attacking &&
                utils.angleDifference(this.sprite.rotation, normalizedAngle) < 1) {
                this.attacking = true;

                this.handler.do({
                    type : "attack",
                    data : {
                        source : this.id,
                        target : this.target.id
                    }
                });

                setTimeout(function(){
                    this.attacking = false;
                }.bind(this), this.attackRate);
                return this;
            } else {
                return this;
            }
        }

        this.position.x += Math.cos(rads)*this.speed;
        this.position.y += Math.sin(rads)*this.speed;

        if (Phaser.Point.distance(this.position, this.destination) < 1) {
            if (this.path.length) {
                this.destination = this.path.shift();
            } else {
                this.destination = null;
            }
        }
    }

    /**
     * General unit update. This should be invoked from every unit's update callback
     */
    Unit.prototype.unitUpdate = function() {
        this.moveTowardDestination();
        var avoidDistance = (this.destination && !this.target) ? 0 : 35;
        for (var id in this.game.units) {
            if (id == this.id || this.game.units[id].playerID != this.playerID)
                continue;
            var unit = this.game.units[id];

            //TODO: This should move the unit such that it is further away from
            // the nearby unit, while remaining near its destination
            if ((!unit.destination || unit.target) &&
                Phaser.Point.distance(this.position, unit.position) < avoidDistance) {
                if (this.position.x < unit.position.x) {
                    this.position.x -= 1;
                } else {
                    this.position.x += 1;
                }

                if (this.position.y < unit.position.y) {
                    this.position.y -= 1;
                } else {
                    this.position.y += 1;
                }
                break;
            }
        }
    }

    return Unit;
});
