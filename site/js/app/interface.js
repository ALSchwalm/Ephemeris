/**
 * Module which displays the in-game interface
 * @module app/interface
 */
define(["app/config", "Phaser", "app/utils", "app/player", "app/map", "app/fog"],
function(config, Phaser, utils, player, map, fog){
    "use strict"

    /**
     * Singleton which displays the in-game interface
     * @alias module:app/interface
     */
    var Interface = function() {}

    /**
     * Initialize the interface
     *
     * @param {Phaser.Game} game - A reference to the current game object
     */
    Interface.prototype.init = function(game) {
        this.game = game;
        this.minimapWidth = map.width*config.interface.minimap.scale;
        this.minimapHeight = map.height*config.interface.minimap.scale;
        this.minimapBack = this.game.add.graphics(0, config.game.height -
                                                  this.minimapHeight);

        this.minimapBounds = new Phaser.Rectangle(this.minimapBack.x,
                                                  this.minimapBack.y,
                                                  this.minimapWidth,
                                                  this.minimapHeight);
        // Draw backgound
        this.minimapBack.beginFill(0x222222, 1);
        this.minimapBack.drawRect(0, 0, this.minimapWidth, this.minimapHeight);
        this.minimapBack.endFill();

        // Draw regions
        for (var i=0; i < map.regions.length; ++i) {
            var region = map.regions[i];
            var transformed = this.worldToMinimapCoord(region.position);
            var minimapRegion = this.game.add.image(transformed.x,
                                                    transformed.y,
                                                    region.key);
            minimapRegion.scale = {
                x: config.interface.minimap.scale,
                y: config.interface.minimap.scale,
            }
            minimapRegion.alpha = 0.4;

            // Crop anything which would extend outside the minimap
            if (minimapRegion.x + minimapRegion.width > this.minimapWidth) {
                var cropWidth = (region.x + region.width) - map.width;
                cropWidth = region.width - cropWidth;
                minimapRegion.crop(new Phaser.Rectangle(0, 0, cropWidth, region.height));
            }

            this.minimapBack.addChild(minimapRegion);
        }

        // Draw grid
        var cellSize = this.minimapWidth/config.interface.minimap.gridLines;
        this.minimapBack.lineStyle(1, 0xCCCCCC, 0.1);
        for (var i=0; i < config.interface.minimap.gridLines; ++i) {
            for (var j=0; j < config.interface.minimap.gridLines; ++j) {
                this.minimapBack.drawRect(i*cellSize, j*cellSize, cellSize, cellSize);
            }
        }
        this.minimapBack.endFill();

        this.minimap = this.game.add.graphics(0, config.game.height -
                                              this.minimapHeight);

        this.fogGraphics = this.game.add.graphics(0, config.game.height -
                                                  this.minimapHeight);
        this.fogData = this.game.add.bitmapData(this.minimapWidth,
                                                this.minimapHeight);
        this.fogData.context.fillStyle = 'rgba(0,0,0,0.4)';
        this.fogData.context.fillRect(0, 0, this.minimapWidth,
                                      this.minimapHeight);
        this.fogSprite = this.game.add.sprite(0, config.game.height-this.minimapHeight,
                                              this.fogData);
        this.fogSprite.mask = this.fogGraphics;

        this.fogGraphics.fixedToCamera = true;
        this.fogSprite.fixedToCamera = true;
        this.minimap.fixedToCamera = true;
        this.minimapBack.fixedToCamera = true;
        return this;
    }

    /**
     * Update the interface
     */
    Interface.prototype.update = function() {
        this.updateMinimap();
        return this;
    }

    Interface.prototype.updateMinimapFoW = function() {
        this.fogGraphics.clear();

        this.fogGraphics.beginFill(0x000000, 1);
        for (var id in this.game.units) {
            var unit = this.game.units[id];

            if (unit.playerID != player.id) continue;
            this.fogGraphics.drawCircle(unit.position.x*config.interface.minimap.scale,
                                        unit.position.y*config.interface.minimap.scale,
                                        unit.view*2*config.interface.minimap.scale);
        }
        this.fogGraphics.endFill();
    }

    Interface.prototype.updateMinimap = function() {
        this.minimap.clear();
        this.game.world.bringToTop(this.minimapBack);
        this.game.world.bringToTop(this.fogSprite);
        this.game.world.bringToTop(this.minimap);

        this.updateMinimapFoW();

        this.minimap.lineStyle(2, 0x444444, 1);
        this.minimap.drawRect(0, 0, this.minimapWidth, this.minimapHeight);
        this.minimap.lineStyle();

        // Draw units
        for (var id in this.game.units) {
            var unit = this.game.units[id];
            var position = unit.position;
            var transformed = this.worldToMinimapCoord(position);

            if (unit.playerID == player.id) {
                if (this.game.selectedUnits.indexOf(unit) == -1) {
                    this.minimap.beginFill(0x0000FF, 0.5);
                } else {
                    this.minimap.beginFill(0xFFFFFF, 0.5);

                }
            } else if (unit.sprite.visible){
                this.minimap.beginFill(0xCC0000, 0.5);
            }
            this.minimap.drawRect(transformed.x, transformed.y, 4, 4);
            this.minimap.endFill();
        }

        // Draw camera
        this.minimap.lineStyle(1, 0xFFFFFF, 0.7);

        // Phaser.Camera.position returns the center of the camera, so get
        // upper left corner like this
        var cameraPosition = this.worldToMinimapCoord({
            x: this.game.camera.x,
            y: this.game.camera.y
        });
        var cameraSize = this.worldToMinimapCoord({
            x: this.game.camera.width,
            y: this.game.camera.height
        });

        this.minimap.drawRect(cameraPosition.x, cameraPosition.y,
                              cameraSize.x, cameraSize.y);
        this.minimap.endFill();

        return this;
    }

    /**
     * Transform a world coordinate into minimap coordinates
     */
    Interface.prototype.worldToMinimapCoord = function(coord) {
        return {
            x: utils.transform(0, map.width,
                               0, this.minimapWidth,
                               coord.x),
            y: utils.transform(0, map.height,
                               0, this.minimapHeight,
                               coord.y)
        };
    }

    /**
     * Transform a minimap coordinate into world coordinates
     */
    Interface.prototype.minimapToWorldCoord = function(coord) {
        return {
            x: utils.transform(0, this.minimapWidth,
                               0, map.width,
                               coord.x),
            y: utils.transform(0, this.minimapHeight,
                               0, map.height,
                               coord.y)
        };
    }

    var hud = new Interface();

    return hud;
});
