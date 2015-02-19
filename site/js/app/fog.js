/**
 * A module implementing the fog of war
 * @module app/fog
 */
define(["app/config", "Phaser", "app/map", "app/player"],
function(config, Phaser, map, player){
    "use strict"

    /**
     * A class implementing the fog of war
     * @alias module:app/fog
     *
     * @param {Phaser.Game} game - The current game object
     */
    var Fog = function() {}
    Fog.prototype.init = function(game) {
        this.game = game;

        this.graphics = this.game.add.graphics(0, 0);
        this.fogData = this.game.add.bitmapData(config.game.width,
                                                config.game.height);
        this.fogData.context.fillStyle = 'rgba(0,0,0,0.45)';
        this.fogData.context.fillRect(0, 0, config.game.width,
                                      config.game.height);
        this.fogSprite = this.game.add.sprite(0, 0, this.fogData);
        this.fogSprite.fixedToCamera = true;
        this.fogSprite.mask = this.graphics;
    }

    Fog.prototype.hideUnit = function(unit, hide) {
        if (hide == unit.graphics.visible && !unit._animating) {
            unit._animating = true;
            if (!hide) {
                unit.graphics.visible = true;
            }
            var tween = this.game.add.tween(unit.graphics)
                .to({alpha: !hide}, 100).start().onComplete.add(function(){
                    if (hide) {
                        unit.graphics.visible = false;
                    }
                    unit._animating = false;
                });
        }
    }

    Fog.prototype.updateUnitFog = function(unit) {
        if (unit.player != player){
            var hide = true;
            for (var otherID in this.game.units) {
                var friendlyUnit = this.game.units[otherID];
                if (friendlyUnit.player != player || friendlyUnit.health <= 0)
                    continue

                if (Phaser.Point.distance(unit.position,
                                          friendlyUnit.position) < friendlyUnit.view) {
                    hide = false;
                }
            }

            map.controlPoints.map(function(point){
                if (point.owner == player &&
                    Phaser.Point.distance(unit.position,
                                          point.position) < point.view) {
                    hide = false;
                }
            }.bind(this));

            this.hideUnit(unit, hide);
        }
        return true;
    }

    Fog.prototype.update = function() {
        for (var id in this.game.units) {
            this.updateUnitFog(this.game.units[id]);
        }
        this.drawFog();
    }

    Fog.prototype.revealUnitView = function(unit) {
        if (unit.player.id != player.id ||
            unit.health <= 0) return;
        this.graphics.drawCircle(unit.position.x,
                                 unit.position.y,
                                 unit.view*2);
    }

    Fog.prototype.drawFog = function() {
        this.game.world.bringToTop(this.fogSprite);
        this.graphics.clear();

        this.graphics.beginFill(0x000000, 1);
        for (var id in this.game.units) {
            this.revealUnitView(this.game.units[id]);
        }

        map.controlPoints.map(function(point){
            if (point.owner == player) {
                this.graphics.drawCircle(point.position.x,
                                         point.position.y,
                                         point.view*2);
            }
        }.bind(this));

        this.graphics.endFill();
    }

    var fog = new Fog();
    return fog;
});
