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

        this.fowSize = config.interface.fogOfWarSize;

        /**
         * Array representing which parts of the map are obscured by the fog of war
         *
         * @type {boolean[][]}
         */
        this.fog = new Array(Math.ceil(map.width/this.fowSize));
        for (var i=0; i < this.fog.length; ++i) {
            this.fog[i] = new Array(Math.ceil(map.height/this.fowSize));
        }

        this.graphics = this.game.add.graphics(0, 0);

        this.fowHeight = Math.ceil(this.game.camera.height/this.fowSize);
        this.fowWidth = Math.ceil(this.game.camera.width/this.fowSize);
    }

    Fog.prototype.resetFog = function() {
        for (var i=0; i < this.fog.length; ++i) {
            for (var j=0; j < this.fog[i].length; ++j) {
                this.fog[i][j] = true;
            }
        }
    }

    Fog.prototype.update = function() {
        this.resetFog();

        for (var id in this.game.units) {
            var unit = this.game.units[id];

            if (unit.playerID != player.id) continue;

            var x = Math.ceil(unit.position.x/this.fowSize);
            var y = Math.ceil(unit.position.y/this.fowSize);
            var r = Math.ceil(unit.view/this.fowSize);

            for (var i=-r; i < r; ++i) {
                for (var j=-r; j < r; ++j) {
                    if (x+i >= 0 && x+i < this.fog.length &&
                        y+j >= 0 && y+j < this.fog.length &&
                        Phaser.Math.distance(unit.position.x,
                                             unit.position.y,
                                             (x+i)*this.fowSize,
                                             (y+j)*this.fowSize) <= unit.view) {
                        this.fog[x+i][y+j] = false;
                    }
                }
            }
        }
        this.drawFog();
    }

    Fog.prototype.drawFog = function() {
        this.graphics.clear();
        this.graphics.beginFill(0x000000, 0.4);

        var offsetX = Math.floor(this.game.camera.x/this.fowSize);
        var offsetY = Math.floor(this.game.camera.y/this.fowSize);

        for (var i=0; i <= this.fowWidth; ++i) {
            var x = (i+offsetX)*this.fowSize;
            if (i >= 0 && this.fog[i+offsetX].every(function(fog){ return fog; })) {
                this.graphics.drawRect(x, this.game.camera.y,
                                       this.fowSize,
                                       this.game.camera.height);
                continue;
            }

            for (var j=0; j <= this.fowHeight; ++j) {
                if (i+offsetX > this.fog.length ||
                    j+offsetY > this.fog[0].length)
                    continue;
                var y = (j+offsetY)*this.fowSize;
                if (this.fog[i+offsetX][j+offsetY]) {
                    this.graphics.drawRect(x, y,
                                           this.fowSize,
                                           this.fowSize);
                }
            }
        }
        this.graphics.endFill();
    }

    var fog = new Fog();
    return fog;
});
