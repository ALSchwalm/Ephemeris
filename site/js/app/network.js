/**
 * A module which handles networking
 * @module app/network
 */
define(["app/config", "socketio", "app/player", "app/utils"],
function(config, io, player, utils){
    "use strict"

    /**
     * Type which abstracts network communication
     * @alias module:app/network
     */
    var Network = function() {
        this.socket = io();
        this.socket.on("connected", function(){
            player.id = this.socket.id;
        }.bind(this));
    }

    /**
     * Initialize the network communication
     *
     * @param {Phaser.Game} game - A reference to the current game object
     * @param {ActionHandler} handler - A reference the game action handler
     */
    Network.prototype.init = function(game, handler) {
        this.game = game;
        this.handler = handler;

        this.socket.on("action", function(action){
            this.handler.do(action);
        }.bind(this));
        return this;
    }

    /**
     * Send an action to the server
     *
     * @param {object} action - The action to send
     */
    Network.prototype.sendAction = function(action) {
        action.source = player.id;
        this.socket.emit("action", action);
        return this;
    }

    var network = new Network();

    return network;
});
