/**
 * The game messenger
 * @module app/messenger
 */
define(["app/config", "Phaser", "app/player"],
function(config, Phaser, player){
    "use strict"

    /**
     * The game messenger
     * @alias module:app/messenger
     */
    var Messenger = function() {}
    Messenger.prototype.init = function(game, network){
        this.game = game;
        this.network = network;

        this.network.socket.on("message", function(msg){
            this.receivedMessage(msg);
        }.bind(this));

        $(document).ready(function(){
            $('#chat-input').keypress( function(e) {
                if (e.which == 13) {
                    $('#chat-input').submit();
                    $('#chat-input').blur()
                }
            });
            $("#chat-input").submit(function(){
                this.sendMessage($("#chat-input").val());
                $("#chat-input").val("");
            }.bind(this));
        }.bind(this));
    }

    Messenger.prototype.sendMessage = function(message) {
        this.network.socket.send({
            number : (player.number + 1),
            message : message
        });
    }

    Messenger.prototype.receivedMessage = function(message) {
        var playerName = $("<span>")
            .addClass("player-name-" + message.number)
            .html("Player" + message.number + ": ");
        var item = $("<li>").append(playerName).append(message.message);
        $("#notification-text").append(item);

        var notificationBox = $("#notification-box")[0];
        if (notificationBox.scrollHeight >
            notificationBox.clientHeight) {
            $("#notification-text li:first").remove();
        }

        setTimeout(function(){
            item.remove();
        }, 5000);
    }

    Messenger.prototype.displayNotification = function(notification) {

    }

    var messenger = new Messenger();
    return messenger;
});
