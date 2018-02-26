var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(process.env.port || 3000);
console.log("Server running..")

app.use(express.static(__dirname));
app.get('/player', function(req, res) {
	res.sendFile(__dirname + "/player/player.html");
});
app.get('/remote', function(req, res) {
	res.sendFile(__dirname + "/remote/remote.html");
});

var connections = [];
io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log("Connected: %s Sockets Connected", connections.length);

	socket.on('disconnect', function(data){
		connections.splice(connections.indexOf(socket), 1);
		console.log("Disconnected: %s Sockets Connected", connections.length);
	});

	socket.on('trigger', function(data){
		io.sockets.emit("toggle", data);
	});
});