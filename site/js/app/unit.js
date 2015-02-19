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
     * @param {Number} x - Unit spawn x position
     * @param {Number} y - Unit spawn x position
     * @param {object} config - Configuration for this unit
     */
    Unit.prototype.init = function(game, handler, x, y, configuration) {

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

        this.graphics = this.game.add.group();
        this.graphics.position = new Phaser.Point(x, y);

        for (var id in configuration) {
            this[id] = configuration[id];
        }

        this.sprite = this.graphics.create(0, 0, this.spriteKey);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.update = this.update.bind(this);

        this.selectGraphic = null;

        this.healthGraphic = this.game.add.graphics(0, 0);
        this.graphics.addChild(this.healthGraphic);

        this.highlights = this.game.add.sprite(0, 0, this.overlayKey);
        this.highlights.anchor.set(0.5, 0.5);
        this.highlights.alpha = 0.7;
        this.sprite.addChild(this.highlights);

        this.background = this.game.add.sprite(0, 0, this.backgroundKey);
        this.background.anchor.set(0.5, 0.5);
        this.sprite.addChild(this.background);

        this._destination = this.destination || null;
        this.path = this.path || [];

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
         * The vision range of the unit (in pixels)
         * @type {Number}
         */
        this.view = this.view || 300;

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
         * A reference to the owner of this unit
         * @type {Player}
         */
        this.player = null;
        if (this.playerID && this.playerID != player.id) {
            this.player = player.opponents[this.playerID];
        } else {
            this.player = player;
        }

        /**
         * The current health of this unit
         * @type {Number}
         */
        this.health = this.health || 100;

        /**
         * The maximum health of this unit
         * @type {Number}
         */
        this.maxHealth = this.health || 100;

        /**
         * The base damage done by this unit during an attack
         * @type {Number}
         */
        this.attackPower = this.attackPower || 10;

        this.target = this.target || null;
        this.attacking = false;

        this.highlights.tint = this.player.color;
        this.sprite.tint = config.player.mutedColors[this.player.number]
        this.enemy = (this.player != player);
        this.game.registerUnit(this);
    }

    Object.defineProperty(Unit.prototype, "position", {
        get : function() {
            return this.graphics.position;
        },
        set : function(value) {
            this.graphics.position = value;
        }
    });

    Object.defineProperty(Unit.prototype, "health", {
        get : function() {
            return this._health;
        },
        set : function(value) {
            this._health = value;
            this.drawHealthBar();
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
     * Update this unit's health bar
     */
    Unit.prototype.drawHealthBar = function() {
        var percent = this.health / this.maxHealth;
        var color = (percent < 0.25) ? 0xCC0000 :
            (percent < 0.6) ? 0xFFFF00 : 0x00CC00;

        this.healthGraphic.clear();

        // Health background
        this.healthGraphic.lineStyle(1, 0xCCCCCC, 1);
        this.healthGraphic.beginFill(0x333333, 0.8);
        this.healthGraphic.drawRect(-this.sprite.width/2,
                                    this.sprite.height,
                                    this.sprite.width, 4);
        this.healthGraphic.endFill();

        // Current health level
        this.healthGraphic.beginFill(color, 0.8);
        this.healthGraphic.drawRect(-this.sprite.width/2,
                                    this.sprite.height,
                                    this.sprite.width*percent, 4);
        this.healthGraphic.endFill();
    }

    /**
     * Callback executed when the unit is selected
     */
    Unit.prototype.onSelect = function() {
        if (this.selectGraphic == null) {
            this.selectGraphic = this.game.add.sprite(0, 0, this.selectKey);
            this.selectGraphic.anchor.set(0.5, 0.5);
            this.graphics.addChild(this.selectGraphic);
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

        if (!Phaser.Math.fuzzyEqual(diff, Math.PI, 0.1)) {
            if (diff > Math.PI) {
                this.sprite.rotation -= 0.1;
            } else {
                this.sprite.rotation += 0.1;
            }
        }
        this.sprite.rotation = this.normalizeAngle(this.sprite.rotation);
    }

    /**
     * Remove this unit from the game
     */
    Unit.prototype.destroy = function() {
        this.graphics.destroy();
        var index = this.game.selectedUnits.indexOf(this);
        if (index != -1) {
            this.game.selectedUnits.splice(index, 1);
            this.onUnselect();
        }
    }

    /**
     * Show an attack from this unit to 'target'
     *
     * @param {Unit} target - Target to attack
     */
    Unit.prototype.attack = function(target) {
        var shot = this.game.add.sprite(this.position.x,
                                        this.position.y, "flare2");
        shot.anchor = {x:0.5, y:0.5};
        var tween = this.game.add.tween(shot);
        tween.to({
            x: target.position.x,
            y: target.position.y
        }, 200).start();

        tween.onComplete.add(function(){
            var scaleTween = this.game.add.tween(shot.scale);
            scaleTween.to({
                x: 0,
                y: 0
            }, 100).start();

            target.health -= this.attackPower;
            if (target.health <= 0) {
                target.destroy();
                this.target = null;
                this.destination = null;
            }
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

        if (Phaser.Point.distance(this.position, this.destination) < this.speed) {
            if (this.path.length) {
                this.destination = this.path.shift();
            } else {
                this.destination = null;
            }
        }
    }

    /**
     * If 'unit' is within 'avoidDistance' of this unit, move away from it
     * slightly.
     *
     * @note This is factored out for v8 optimization (avoid work in for-in statements)
     */
    Unit.prototype.avoidOtherUnits = function(unit, avoidDistance) {
        if (this == unit || unit.playerID != this.playerID ||
            unit.health <= 0)
            return false;

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
            return true;
        }
    }

    /**
     * If 'unit' is an enemy near this unit, automatically engage it
     */
    Unit.prototype.autoTargetEnemy = function(unit) {
        if (!this.enemy &&
            unit.enemy &&
            unit.graphics.visible &&
            unit.health > 0 &&
            !this.destination &&
            Phaser.Point.distance(unit.position,
                                  this.position) < this.view) {
            this.handler.do({
                type: "engage",
                data : {
                    source: this.id,
                    target: unit.id
                }
            });
        }
    }

    /**
     * General unit update. This should be invoked from every unit's update callback
     */
    Unit.prototype.unitUpdate = function() {
        this.moveTowardDestination();
        var avoidDistance = (this.destination && !this.target) ? 0 : 35;
        for (var id in this.game.units) {
            this.avoidOtherUnits(this.game.units[id], avoidDistance);
            this.autoTargetEnemy(this.game.units[id]);
        }
    }

    return Unit;
});
