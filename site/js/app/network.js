/**
 * A module which handles networking
 * @module app/network
 */
define(["app/config", "socketio", "app/player"],
function(config, io, player){
    "use strict"

    /**
     * Function which abstracts netwokr communication
     * @alias module:app/network
     */
    var Network = function() {
        this.socket = io();
        this.socket.on("connected", function(msg){
            player.id = this.socket.id;
        }.bind(this));
    }

    Network.prototype.init = function(game, handler) {
        this.game = game;
        this.handler = handler;

        this.socket.on("action", function(action){
            this.handler.do(action);
        }.bind(this));
    }

    Network.prototype.send = function(action) {
        action.source = player.id;
        this.socket.emit("action", action);
    }

    var network = new Network();

    return network;
});
