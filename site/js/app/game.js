/**
 * Module defining the Phaser game object.
 * @note This module should probably not be 'required' as it will likely create
 *       a dependency cycle
 * @module app/game
 */
define(['app/config',
        'Phaser',
        'app/state/preload',
        'app/state/update',
        'app/state/create',
        'app/state/start',
        'app/network'],
function(config, Phaser, preload, update, create, start, network){
    "use strict"

    network.connect(function(){
        /**
         * The game singleton
         * @type {Phaser.Game}
         */
        var game = new Phaser.Game(config.game.width, config.game.height,
                                   Phaser.AUTO, 'phaser-body', {
                                       preload : preload,
                                       update  : update,
                                       create  : create,
                                   }, true);
        game.units = [];
        game.selected = [];

        game.registerUnit = function(unit) {
            game.units.push(unit);
        }

        game.getUnit = function(id) {
            for (var i=0; i < game.units.length; ++i) {
                if (game.units[i].id == id)
                    return game.units[i];
            }
            return null;
        }

        game.removeUnit = function(unit) {
            var index = game.units.indexOf(unit);
            if (index != -1) {
                game.units.splice(index, 1);
            }
        }

        return game;
    }, start);
});
