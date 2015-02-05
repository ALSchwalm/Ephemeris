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
        'app/state/create'],
function(config, Phaser, preload, update, create){
    "use strict"

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
    game.id = 0;
    game.units = {};
    game.selectedUnits = [];

    game.registerUnit = function(unit) {
        var id = game.id;
        game.id++;
        unit.id = id;
        game.units[id] = unit;
    }

    return game;
});
