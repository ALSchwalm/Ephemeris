var express     = require('express');
var path        = require('path');
var compress    = require('compression');
var uuid        = require("node-uuid");
var bodyParser  = require('body-parser');
var multer      = require('multer');

var sitePath = path.join(__dirname, "/../site");

var app = express();

// Serve static content
app.use("/assets", express.static(path.join(sitePath, "assets")));
app.use("/js", express.static(path.join(sitePath, "js")));
app.use("/css", express.static(path.join(sitePath, "css")));

app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({inMemory : true}));
app.set('views', path.join(sitePath, "view"))
app.set('view engine', 'ejs');
app.engine('html', require('ejs').__express);

var createGame = function(gamename, username, map, replay, player) {
    var id = uuid.v4();
    games[id] = [];
    games[id].ready = 0;
    games[id].gamename = gamename;
    games[id].mapName = map;
    games[id].mapFile = map + ".json";
    games[id].replay = replay;
    games[id].player = player;
    return id;
}

// For the time being, just redirect from index to game creation
app.get(["/", "/index", "/index.html"], function(req, res){
    res.redirect("newgame");
});

app.get("/newgame", function(req, res){
    res.render("newgame.html");
});

app.get("/lobby", function(req, res){
    res.render("lobby.html", {games : games});
});

app.post("/create", function(req, res) {
    var id = null;
    if (req.body.gametype === "replay") {
        var replay = JSON.parse(req.files["file-input"].buffer.toString());
        var map = replay.map;
        id = createGame(null, req.body.username, map, replay.data, replay.player);
    } else {
        id = createGame(req.body.gamename, req.body.username, req.body.map);
    }
    res.redirect("/game?id=" + id);
});

app.get("/game", function(req, res) {
    if (games[req.query.id] && games[req.query.id].length == 2) {
        res.send("This game is already full");
    } else if (games[req.query.id]) {
        res.render("game.html");
    } else {
        //TODO make a nice page for this
        res.send("Invalid game id");
    }
});

var server = app.listen(3000);

var io = require('socket.io').listen(server);

var games = {};
io.on('connection', function(socket){
    try {
        var gameID = socket.handshake.query.gameID;
        var playerNumber = null;
        var map = require(path.join(sitePath, "assets/maps/",
                                    games[gameID].mapFile));

        if (typeof(games[gameID]) !== "undefined") {
            playerNumber = games[gameID].length;
            games[gameID].push(socket);
        }

        socket.emit("connected", {
            playerNumber : playerNumber,
            map : map,
            mapName : games[gameID].mapName,
            replay : games[gameID].replay,
            player : games[gameID].player
        });

        // TODO support for arbitrary numbers of players
        if (games[gameID].length == 2 || games[gameID].replay) {
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
                s.emit("joined", startMessage);
            });
        }

        socket.on("ready", function(msg){
            games[gameID].ready++;
            if (games[gameID].ready == 2 || games[gameID].replay) {
                games[gameID].map(function(s){
                    s.emit("ready", {});
                });
            }
        });

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
