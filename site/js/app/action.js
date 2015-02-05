/**
 * Module defining the action handler
 * @module app/action
 */
define(['app/config', 'app/network'],
function(config, network){
    "use strict"

    var ActionHandler = function(){}
    ActionHandler.prototype.init = function(game) {
        this.game = game;
        this.actions = [];
    }

    ActionHandler.prototype.do = function(action) {
        this.actions.push(action);

        if (!action.remote) {
            network.send(action);
        }

        switch(action.type.toLowerCase()) {
        case "move":
            this.game.units[action.data.id].moveTo(action.data.path);
            break;
        default:
            break;
        }
    }

    var handler = new ActionHandler();
    return handler;
});
