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
    var Network = function() {}

    /**
     * Connect the underlying web socket and execute 'callback' when complete
     *
     * @param {function} callback - Callback to be executed when the network
     *                              connection is established
     */
    Network.prototype.connect = function(callback) {
        var gameID = document.URL.match(/id=(.*)$/)[1];

        /**
         * The underlying socket object
         */
        this.socket = io(location.host, {
            query : "gameID=" + gameID
        });

        this.socket.on("connected", function(msg){
            player.id = this.socket.id;
            player.number = msg.playerNumber;
            callback();

            //TODO show invalid game id error when player.number is null
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

        this.socket.on("disconnected", function(msg){
            //TODO show screen indicating a player has left
        });
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
