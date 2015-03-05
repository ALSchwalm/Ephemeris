/**
 * Module which generates a map from a config file
 * @module app/map
 */
define(["app/config", "Phaser", "app/utils", "app/player", "app/controlpoint"],
function(config, Phaser, utils, player, ControlPoint){
    "use strict"

    /**
     * Singleton which generates a random map (as seeded by the server)
     * @alias module:app/map
     */
    var Map = function() {}

    /**
     * Generate the map
     *
     * @param {Phaser.Game} game - A reference to the current game object
     * @param {object} map - Configuration object for the map
     */
    Map.prototype.init = function(game, handler, map) {
        this.game = game;
        this.handler = handler
        this.configuration = map;
        this.game.rnd.sow([map.seed]);
        this.graphics = this.game.add.group();

        this.stars = this.game.add.graphics(0, 0);
        this.stars.fixedToCamera = true;
        this.graphics.addChild(this.stars);

        this.width = map.width;
        this.height = map.height;

        // Continue game after losing focus
        this.game.stage.disableVisibilityChange = true;

        this.game.world.setBounds(0, 0, this.width, this.height);

        var worldSize = this.width*this.height;

        // Generate some stars
        for (var i=0; i < worldSize*config.map.starFrequency; ++i) {
            var x = this.game.rnd.frac()*this.width;
            var y = this.game.rnd.frac()*this.height;
            var size = this.game.rnd.frac()*2;
            var colorIndex = Math.floor(this.game.rnd.frac()*
                                        config.map.starColors.length);
            var color = config.map.starColors[colorIndex];

            this.stars.beginFill(color, 0.3);
            this.stars.drawRect(x, y, size, size);
            this.stars.endFill();
        }

        this.controlPoints = [];

        // Add regions
        this.regions = [];
        for (var i=0; i < map.regions.length; ++i) {
            this.makeRegion(map.regions[i]);
        }

        // Place camera over this player's starting position
        this.game.camera.position = map.startingPoints[player.number];

        return this;
    }

    /**
     * Add control points to the map.
     *
     * @note This must not be called until after "start" has been received
     */
    Map.prototype.addControlPoints = function() {
        for (var i=0; i < this.configuration.controlPoints.length; ++i) {
            var point = this.configuration.controlPoints[i];

            var owner = null;
            if (player.number == point.owner-1) {
                owner = player;
            } else {
                for (var id in player.opponents) {
                    if (player.opponents[id].number == point.owner-1) {
                        owner = player.opponents[id];
                        break;
                    }
                }
            }

            this.controlPoints.push(new ControlPoint(this.game,
                                                     this.handler,
                                                     point.x, point.y,
                                                     owner));
        }
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
            this.graphics.addChild(region.image);
            region.image.anchor.set(0.5, 0.5);

            region.image.angle = regionConfig.angle || 0;
            if (regionConfig.tint) {
                region.image.tint = regionConfig.tint;
            }

            if (regionConfig.scale) {
                region.image.scale = regionConfig.scale;
            }

            region.image.update = function(){
                if (!region.effect) {
                    return;
                }
                this.game.units.map(function(unit){
                    if (Phaser.Point.distance(unit.position,
                                              region.image.position) < region.effectRadius) {
                        for (var effect in region.effect) {
                            if (!unit.statusEffects[effect]) {
                                unit.statusEffects[effect] = region.effect[effect];
                            }
                        }
                    }
                }, this);
            }.bind(this);

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
    }

    var map = new Map();

    return map;
});
