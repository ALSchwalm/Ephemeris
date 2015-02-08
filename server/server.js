var connect = require('connect');
var serveStatic = require('serve-static');

var app = connect();
app.use(serveStatic(__dirname + "/../site"));
var server = app.listen(3000);

var io = require('socket.io').listen(server);

var rngSeed = Math.random().toString();
io.on('connection', function(socket){
    socket.emit("connected", {
        rngSeed : rngSeed
    });

    socket.on("action", function(msg){
        socket.broadcast.emit("action", msg);
    });
});
