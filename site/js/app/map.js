/**
 * Module which generates a random map
 * @module app/map
 */
define(["app/config", "app/utils"], function(config, utils){
    "use strict"

    /**
     * Singleton which generates a random map (as seeded by the server)
     * @alias module:app/network
     */
    var Map = function() {}

    /**
     * Generate the map
     *
     * @param {Phaser.Game} game - A reference to the current game object
     * @param {object} map - Configuration object for the map
     */
    Map.prototype.init = function(game, map) {
        utils.rngSeed = map.seed;
        this.game = game;
        this.graphics = this.game.add.graphics(0, 0);
        this.graphics.fixedToCamera = true;
        this.width = map.width;
        this.height = map.height;

        // Continue game after losing focus
        this.game.stage.disableVisibilityChange = true;

        this.game.world.setBounds(0, 0, this.width, this.height);

        var worldSize = this.width*this.height;

        for (var i=0; i < worldSize*config.map.starFrequency; ++i) {
            var x = utils.seededRandom()*this.width;
            var y = utils.seededRandom()*this.height;
            var size = utils.seededRandom()*2;
            var colorIndex = Math.floor(utils.seededRandom()*
                                        config.map.starColors.length);
            var color = config.map.starColors[colorIndex];

            this.graphics.beginFill(color, 0.3);
            this.graphics.drawRect(x, y, size, size);
            this.graphics.endFill();
        }
        this.regions = [];

        for (var i=0; i < map.regions.length; ++i) {
            var newRegion = this.makeRegion(map.regions[i]);
            if (newRegion) {
                this.regions.push(newRegion);
            }
        }

        return this;
    }

    /**
     * Add a region to the map
     *
     * @returns {object} - The region added to the game
     */
    Map.prototype.makeRegion = function(regionConfig) {
        var position = regionConfig.position;

        var region = regionConfig;

        var loaded = this.game.cache.checkImageKey(regionConfig.asset);
        if (loaded) {
            region.image = this.game.add.image(position.x, position.y,
                                               regionConfig.asset);
            region.image.anchor.set(0.5, 0.5);

            if (regionConfig.tint) {
                region.image.tint = regionConfig.tint;
            }

            if (regionConfig.scale) {
                region.image.scale = regionConfig.scale;
            }

            this.regions.push(region);

            if (regionConfig.type == "planet") {
                setInterval(function(){
                    region.image.angle += 0.1;
                }, 100);
            }
        } else {
            this.game.load.image(regionConfig.asset, 'assets/images/' + regionConfig.asset);
            this.game.load.onFileComplete.add(function(p, name){
                if (name == regionConfig.asset) {
                    this.makeRegion(regionConfig);
                }
            }.bind(this));
        }

        return null;
    }

    var map = new Map();

    return map;
});
