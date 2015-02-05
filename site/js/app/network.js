/**
 * A module which handles networking
 * @module app/network
 */
define(["app/config", "socketio"],
function(config, io){
    "use strict"

    /**
     * Function which abstracts netwokr communication
     * @alias module:app/network
     */
    var Network = function() {
        this.socket = io();
    }

    Network.prototype.init = function(game, handler) {
        this.game = game;
        this.handler = handler;

        this.socket.on("action", function(action){
            action.remote = true;
            this.handler.do(action);
        }.bind(this));
    }

    Network.prototype.send = function(action) {
        this.socket.emit("action", action);
    }

    var network = new Network();

    return network;
});
