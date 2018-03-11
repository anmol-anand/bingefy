var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var trailerPath = "./trailers/" + require("./trailers/info.json").which + "/";
var srt2vtt = require('srt-to-vtt');
var fs = require('fs');
var files = fs.readdirSync(trailerPath);
var movtracks = [];
var subtracks = [];
for(var i = 0; i<files.length; i++){
	if(files[i].substring( files[i].length - 4, files[i].length)==".mp4"){
		movtracks.push(files[i]);
	}
	else if(files[i].substring( files[i].length - 4, files[i].length)==".vtt"){
		subtracks.push(files[i]);
	}
	else if(files[i].substring( files[i].length - 4, files[i].length)==".srt"){
  		var out = files[i].substring( 0, files[i].length - 4) + "$$" + ".vtt";
  		var exists = false;
  		for(var j = 0; j<files.length; j++){
  			if(files[j]==out){
  				exists = true;
  				break;
  			}
  		}
  		if(exists){
  			continue;
  		}
		fs.createReadStream(trailerPath + files[i])
  			.pipe(srt2vtt())
  			.pipe( fs.createWriteStream( trailerPath + out));
  		subtracks.push(out);
	}
}

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

	socket.emit('trailer', {trailerPath: trailerPath, movtracks: movtracks, subtracks: subtracks});

	connections.push(socket);
	console.log("Connected: %s Sockets Connected", connections.length);

	socket.on('disconnect', function(data){
		connections.splice(connections.indexOf(socket), 1);
		console.log("Disconnected: %s Sockets Connected", connections.length);
	});

	socket.on('trigger', function(data){
		for(var i = 0; i<connections.length; i++){
			connections[i].emit('toggle', data);
		}
	});
	socket.on('get controls', function(data){
		for(var i = 0; i<connections.length; i++){
			connections[i].emit('get controls', data);
		}
	});
	socket.on('current controls', function(data){
		for(var i = 0; i<connections.length; i++){
			connections[i].emit('current controls', data);
		}
	});
});