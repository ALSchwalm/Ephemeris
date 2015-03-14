/**
 * Module which plays music for the game
 * @module app/music
 */
define(["app/config", "Phaser"],
function(config, Phaser){
    "use strict"

    /**
     * Singleton which plays music
     * @alias module:app/music
     */
    var Music = function() {}
    Music.prototype.init = function(game) {
        this.game = game;
    }

    Music.prototype.playSong = function(name) {
        this.currentSong = this.game.add.audio("background", 0.1, true);
        this.currentSong.play();
    }

    return new Music();
});
