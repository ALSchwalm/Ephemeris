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
        unit.graphics.visible = !hide;
    }

    Fog.prototype.updateUnitFog = function(unit) {
        if (unit.player != player){
            var hide = true;
            this.game.units.map(function(friendlyUnit){
                if (friendlyUnit.player != player || friendlyUnit.dead)
                    return;

                if (Phaser.Point.distance(unit.position,
                                          friendlyUnit.position) < friendlyUnit.view) {
                    hide = false;
                }
            });

            map.controlPoints.map(function(point){
                if (point.owner == player &&
                    Phaser.Point.distance(unit.position,
                                          point.position) < point.view) {
                    hide = false;
                }
            }, this);

            this.hideUnit(unit, hide);
        }
        return true;
    }

    Fog.prototype.update = function() {
        this.game.units.map(function(unit){
            this.updateUnitFog(unit);
        }, this);
        this.drawFog();
    }

    Fog.prototype.revealUnitView = function(unit) {
        if (unit.player.id != player.id ||
            unit.dead) return;
        this.graphics.drawCircle(unit.position.x,
                                 unit.position.y,
                                 unit.view*2);
    }

    Fog.prototype.drawFog = function() {
        this.game.world.bringToTop(this.fogSprite);
        this.graphics.clear();

        this.graphics.beginFill(0x000000, 1);
        this.game.units.map(function(unit){
            this.revealUnitView(unit);
        }, this);

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
