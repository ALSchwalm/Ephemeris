var connect = require('connect');
var serveStatic = require('serve-static');

var app = connect();
app.use(serveStatic(__dirname + "/../site"));
var server = app.listen(3000);

var io = require('socket.io').listen(server);

io.on('connection', function(socket){
    socket.on("action", function(msg){
        socket.broadcast.emit("action", msg);
    });
});
