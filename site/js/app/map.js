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
     */
    Map.prototype.init = function(game) {
        this.game = game;
        this.graphics = this.game.add.graphics(-config.game.world.width/2,
                                               -config.game.world.height/2);
        this.graphics.fixedToCamera = true;

        var worldSize = config.game.world.width*config.game.world.height;

        for (var i=0; i < worldSize*config.map.starFrequency; ++i) {
            var x = utils.seededRandom()*config.game.world.width;
            var y = utils.seededRandom()*config.game.world.height;
            var size = utils.seededRandom()*2;
            var colorIndex = Math.floor(utils.seededRandom()*
                                        config.map.starColors.length);
            var color = config.map.starColors[colorIndex];

            this.graphics.beginFill(color, 0.3);
            this.graphics.drawRect(x, y, size, size);
            this.graphics.endFill();
        }
        this.planets = [];

        this.availableImages = [];

        // TODO find a good way to randomly generate these
        this.availableLocations = [
            { x: 300, y: 300 },
            { x: 2300, y: 2300 },
            { x: 3300, y: 3300 },
            { x: -100, y: 2000 },
        ];

        for (var i=0; i < config.assets.numPlanets; ++i) {
            this.availableImages.push(i);
        }

        var initialPlanet = this.addPlanet();

        this.planetWidth = initialPlanet.width;
        this.planetHeight = initialPlanet.height;

        var possible = worldSize/(this.planetWidth*this.planetHeight)*
            config.map.planetFrequency;

        for (var i=0; i < possible; ++i) {
            this.planets.push(this.addPlanet());
        }
        return this;
    }

    /**
     * Generate a random planet and place it on the map
     *
     * @returns {Phaser.Image} - The images added to the game
     */
    Map.prototype.addPlanet = function() {
        var index = Math.floor(utils.seededRandom()*this.availableImages.length);
        var image = this.availableImages[index];
        if (typeof(image) === "undefined") {
            return null;
        } else {
            this.availableImages.splice(index, 1);
        }

        index = Math.floor(utils.seededRandom()*this.availableLocations.length);
        var location = this.availableLocations[index];
        if (typeof(location) === "undefined") {
            return null;
        } else {
            this.availableLocations.splice(index, 1);
        }

        var planet = this.game.add.image(location.x, location.y, 'planet' + image);
        this.planets.push(planet);
        return planet
    }

    var map = new Map();

    return map;
});
