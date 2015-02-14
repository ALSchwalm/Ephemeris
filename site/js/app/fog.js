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

    Fog.prototype.update = function() {
        for (var id in this.game.units) {
            var unit = this.game.units[id];

            if (unit.playerID != player.id){
                unit.sprite.exists = false;
                for (var otherID in this.game.units) {
                    var friendlyUnit = this.game.units[otherID];
                    if (friendlyUnit.playerID != player.id)
                        continue;

                    if (Phaser.Point.distance(unit.position,
                                             friendlyUnit.position) < friendlyUnit.view) {
                        unit.sprite.exists = true;
                    }
                }
            }
        }
        this.drawFog();
    }

    Fog.prototype.drawFog = function() {
        this.graphics.clear();

        this.graphics.beginFill(0x000000, 1);
        for (var id in this.game.units) {
            var unit = this.game.units[id];

            if (unit.playerID != player.id) continue;
            this.graphics.drawCircle(unit.position.x,
                                     unit.position.y,
                                     unit.view*2);
        }
        this.graphics.endFill();
    }

    var fog = new Fog();
    return fog;
});
