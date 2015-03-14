/**
 * Module defining the action handler
 * @module app/action
 */
define(['app/config', 'app/network', 'app/player',
        'app/utils', 'app/ship', 'app/bomber', 'app/carrier'],
function(config, network, player, utils, Ship, Bomber, Carrier){
    "use strict"

    /**
     * An event handler, which records and performs requested actions
     * @alias module:app/action
     */
    var ActionHandler = function(){}

    /**
     * Initialize the action handler
     *
     * @param {Phaser.Game} game - A reference to the current game object
     */
    ActionHandler.prototype.init = function(game, hud) {
        this.game = game;
        this.hud = hud;
        this.history = [];
        this.replay = null;
        return this;
    }

    ActionHandler.prototype.update = function() {
        if (this.replay) {
            if (this.replay[0] &&
                this.replay[0][0] <= new Date().getTime() - this.game.startTime) {
                this.replay[0][1].replay = true;
                this.do(this.replay[0][1]);
                this.replay.shift(1);
            }
        }
    }

    /**
     * Replay a previous game described by 'replay'
     */
    ActionHandler.prototype.startReplay = function(replay) {
        this.replay = replay;
    }

    /**
     * Download a replay for this game
     */
    ActionHandler.prototype.downloadReplay = function() {
        var replay = {
            data: this.history,
            map: config.mapName,
            player: player
        };
        var data = "text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(replay));
        $('<a href="data:' + data + '" download="replay.json"></a>')[0].click();
    }

    /**
     * Function which dispatches an action to the appropriate handler
     *
     * @param {object} action - An action to perform
     */
    ActionHandler.prototype.do = function(action) {
        if (this.replay && !action.replay)
            return;

        // Clone the action, as acting on it, may destroy it
        var clone = utils.clone(action);
        this.history.push([new Date().getTime() - this.game.startTime, clone]);

        switch(action.type.toLowerCase()) {
        case "attack":
            var unit = this.game.getUnit(action.data.source);
            var target = this.game.getUnit(action.data.target);
            if (unit && target) {
                unit.attack(target);
            }
            break;
        case "move":
            var unit = this.game.getUnit(action.data.id);
            if (unit) {
                unit.moveTo(action.data.path);
            }
            break;
        case "destroy":
            var unit = this.game.getUnit(action.data.id);
            if (unit) {
                unit.destroy();
                this.hud.reconstructInfoPanel();
            }
            break;
        case "engage":
            var unit = this.game.getUnit(action.data.source);
            if (unit) {
                unit.moveTo(action.data.target);
            }
            break;
        case "forfeit":
            var id = action.data.player;
            this.game.running = false;
            if (id != player) {
                $("#game-over h1").html("Victory");
            } else {
                $("#game-over h1").html("Defeat");
            }
            $("#paused").addClass("hidden");
            $("#game-over").removeClass("hidden");
            break;
        case "create":
            var type = null;
            switch(action.data.type.toLowerCase()){
            case "fighter":
                type = Ship;
                break;
            case "bomber":
                type = Bomber;
                break;
            case "carrier":
                type = Carrier;
                break;
            default:
                console.error("Unknown unit type:", action.data.type);
            }
            var newUnit = new type(this.game,
                                   this,
                                   action.data.x,
                                   action.data.y,
                                   action.data.config);
            clone.data.config = clone.data.config || {};
            clone.data.config.id = newUnit.id;
            if (!clone.source){
                clone.data.config.playerID = player.id;
            }
            break;
        default:
            console.error("Unknown action type:", action.type);
            break;
        }

        if (!clone.source) {
            network.sendAction(clone);
        }
        return this;
    }

    var handler = new ActionHandler();
    return handler;
});
