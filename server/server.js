var express = require('express');
var path = require('path');
var compress = require('compression');
var uuid = require("node-uuid");

var sitePath = path.join(__dirname, "/../site");

var app = express();
app.use(compress());
app.use("/", express.static(sitePath));

var createGame = function() {
    var id = uuid.v4();
    games[id] = [];
    return id;
}

// For the time being, just redirect from index to a game
app.use(["/", "/index", "/index.html"], function(req, res){
    res.redirect("/game.html?id=" + createGame());
});

var server = app.listen(3000);

var io = require('socket.io').listen(server);

var games = {};
io.on('connection', function(socket){
    try {
        var gameID = socket.handshake.query.gameID;

        var playerNumber = null;
        if (typeof(games[gameID]) !== "undefined") {
            playerNumber = games[gameID].length;
            games[gameID].push(socket);
        }

        socket.emit("connected", {
            playerNumber : playerNumber
        });

        // TODO support for arbitrary numbers of players
        if (games[gameID].length == 2) {
            var startMessage = {
                players : []
            };
            games[gameID].map(function(s, i){
                startMessage.players.push({
                    id : s.id,
                    number : i
                });
            });
            games[gameID].map(function(s){
                s.emit("start", startMessage);
            });
        }

        socket.on("action", function(msg){
            games[gameID].map(function(s){
                if (s != socket) {
                    s.emit("action", msg);
                }
            });
        });

        socket.on('disconnect', function () {
            if (games[gameID] && games[gameID][playerNumber]) {
                games[gameID].splice(playerNumber, 1);

                games[gameID].map(function(s){
                    s.emit("disconnected", {
                        playerNumber : playerNumber
                    });
                });
            }
        });
    } catch (err) {
        console.log(err);
    }
});
