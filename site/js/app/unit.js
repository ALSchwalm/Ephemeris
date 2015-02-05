/**
 * A module which defines a basic unit
 * @module app/unit
 */
define(["app/config", "Phaser", "app/controls"],
function(config, Phaser, controls){
    "use strict"

    var Unit = function() {}
    Unit.prototype.init = function(game) {
        this.game = game;
        this.game.registerUnit(this);

        this.destination = this.destination || null;
        this.path = this.path || [];
        this.sprite = this.sprite || null;
        this.selectGraphic = this.selectGraphic || null;
        this.focus = this.focus || null;
        this.speed = this.speed || 1;
    }

    Object.defineProperty(Unit.prototype, "position", {
        get : function() {
            return this.sprite.position;
        },
        set : function(value) {
            this.sprite.position = value;
        }
    });

    Unit.prototype.onClick = function() {
        if (this.game.input.mouse.button == 0) {
            controls.unitSelected(this);
            this.onSelect();
        }
    }

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

    Unit.prototype.moveTo = function(points) {
        if (points instanceof Array) {
            this.destination = points.shift();
            this.path = points;
        } else {
            this.path = [points];
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
