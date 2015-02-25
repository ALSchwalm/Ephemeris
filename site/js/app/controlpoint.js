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

        /**
         * The name displayed when the control point is selected
         *
         * @type{string}
         */
        this.name = "Control Point"

        this.unitGenTimer = this.game.time.create(false);
        this.unitGenTimer.loop(5000, function() {
            if (this.owner == player) {
                this.handler.do({
                    type: "create",
                    data: {
                        type: this.buildUnitType,
                        x: this.position.x,
                        y: this.position.y+40
                    }
                });
            }
        }.bind(this));
        this.unitGenTimer.start();

        this.buildUnitType = "Fighter";
        this.convertPercent = 0;

        this.graphics = this.game.add.group();
        this.graphics.position = new Phaser.Point(x, y);

        this.sprite = this.game.add.sprite(0, 0, 'flag');
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.animations.add('wave');
        this.sprite.animations.play('wave', 7, true);

        this.iconKey = "controlpointIcon";

        this.circle = this.game.add.image(0, 0, '20empty');
        this.circle.anchor.set(0.5, 0.5);
        setInterval(function(){
            this.circle.angle -= 0.5;
        }.bind(this), 100);

        this.captureBar = this.game.add.graphics(0, -60);

        this.selectGraphic = this.game.add.sprite(0, 0, "20select");
        this.selectGraphic.anchor.set(0.5, 0.5);
        this.selectGraphic.visible = false;

        this.graphics.addChild(this.selectGraphic);
        this.graphics.addChild(this.captureBar);
        this.graphics.addChild(this.sprite);
        this.graphics.addChild(this.circle);
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

    ControlPoint.prototype.onSelect = function() {
        this.selectGraphic.visible = true;
    }

    ControlPoint.prototype.onUnselect = function() {
        this.selectGraphic.visible = false;
    }

    ControlPoint.prototype.buildUnit = function(unit) {
        this.buildUnitType = unit;
        this.unitGenTimer.stop(false);
        this.unitGenTimer.start();
    }

    ControlPoint.prototype.drawCaptureBar = function(color) {
        this.captureBar.clear();
        var percent = this.convertPercent/100;

        // Background
        this.captureBar.lineStyle(1, 0xCCCCCC, 1);
        this.captureBar.beginFill(0x333333, 0.8);
        this.captureBar.drawRect(-this.sprite.width/2,
                                 this.sprite.height,
                                 this.sprite.width, 4);
        this.captureBar.endFill();

        // Current capture percent
        this.captureBar.beginFill(color, 0.8);
        this.captureBar.drawRect(-this.sprite.width/2,
                                 this.sprite.height,
                                 this.sprite.width*percent, 4);
        this.captureBar.endFill();
    }

    ControlPoint.prototype.drawBuildPercent = function() {

    }

    ControlPoint.prototype.update = function() {
        var attemptedOwner = null;
        var magnitude = 1;
        for (var i=0; i < this.game.units.length; ++i) {
            var unit = this.game.units[i];
            if (unit.alive &&
                Phaser.Point.distance(unit.position, this.position) < this.range){
                if (attemptedOwner == null) {
                    attemptedOwner = unit.owner;
                } else if (attemptedOwner != unit.owner) {
                    return false;
                } else {
                    ++magnitude;
                }
            }
        }

        if (attemptedOwner == null || attemptedOwner == this.owner) {
            this.convertPercent = 0;
            this.captureBar.clear();
        } else if (this.convertPercent <= 100){
            this.convertPercent += config.map.controlPointConvertRate*magnitude;

            if (this.convertPercent >= 100) {
                this.owner = attemptedOwner;
                this.updateColor();
            }
            this.drawCaptureBar(attemptedOwner.color);
        }
        return true;
    }

    ControlPoint.prototype.updateColor = function() {
        ControlPoint.redraw = true;
        if (this.owner) {
            this.area.tint = this.owner.color;
        } else {
            this.area.tint = 0xFFFFFF;
        }
    }

    ControlPoint.prototype.display = function() {
        var loaded = this.game.cache.checkImageKey("384empty");
        if (loaded) {
            // Area is not part of 'graphics' so it is not hidden by FoW
            this.area = this.game.add.image(this.position.x,
                                            this.position.y, "384empty");
            this.area.anchor.set(0.5, 0.5);
            this.area.update = this.update.bind(this);
            this.updateColor();

            setInterval(function(){
                this.area.angle += 0.05;
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
