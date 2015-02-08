/**
 * Module which generates a random map
 * @module app/utils
 */
define(["app/config", "app/utils"], function(config, utils){
    "use strict"

    var Map = function() {}
    Map.prototype.init = function(game) {
        this.game = game;
        this.graphics = this.game.add.graphics(0, 0);

        var worldSize = config.game.world.width*config.game.world.height;

        this.graphics.beginFill(0xFFFFFF, 0.3);
        for (var i=0; i < worldSize*config.map.starFrequency; ++i) {
            var x = utils.seededRandom()*config.game.world.width;
            var y = utils.seededRandom()*config.game.world.height;
            this.graphics.drawRect(x, y, 2, 2);
        }
        this.graphics.endFill();
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
    }

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
