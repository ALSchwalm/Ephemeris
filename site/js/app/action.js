/**
 * Module defining the action handler
 * @module app/action
 */
define(['app/config', 'app/network', 'app/player', 'app/utils', 'app/ship'],
function(config, network, player, utils, Ship){
    "use strict"

    var ActionHandler = function(){}
    ActionHandler.prototype.init = function(game) {
        this.game = game;
        this.actions = [];
    }

    ActionHandler.prototype.do = function(action) {
        // Clone the action, as acting on it, may destroy it
        var clone = utils.clone(action);

        this.actions.push(clone);

        switch(action.type.toLowerCase()) {
        case "move":
            this.game.units[action.data.id].moveTo(action.data.path);
            break;
        case "create":
            var type = eval(action.data.type);
            var newUnit = new type(this.game,
                                   action.data.x,
                                   action.data.y,
                                   action.data.config);
            clone.data.config = clone.data.config || {};
            clone.data.config.id = newUnit.id;
            if (!clone.sourc){
                clone.data.config.player = player.id;
            }
            break;
        default:
            break;
        }

        if (!clone.source) {
            network.send(clone);
        }
    }

    var handler = new ActionHandler();
    return handler;
});
