var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var srt2vtt = require('srt-to-vtt');
var height = "85";
var fs = require('fs');
var trailerFolder = require("./trailers/info.json").trailers[0].folder;
var trailerName = require("./trailers/info.json").trailers[0].name;
var movtracks = [];
var subtracks = [];
var trailerPath = "./trailers";

function movieDetails(){

	if(!trailerFolder)return;
	trailerPath = trailerFolder + "/";
	var files = fs.readdirSync(trailerPath);
	movtracks = [trailerName];
	subtracks = [];
	for(var i = 0; i<files.length; i++){
		if(files[i].substring( files[i].length - 4, files[i].length)==".vtt"){
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
	  		heightAdjust(trailerPath + files[i], trailerPath + out);
	  		subtracks.push(out);
		}
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

	movieDetails();
	socket.emit('trailer', {trailerPath: trailerPath, movtracks: movtracks, subtracks: subtracks});
	socket.on('changeDetails', function(data){
		trailerFolder = data.trailerFolder;
		trailerName = data.trailerName;
	});

	socket.emit('inet', require("./prestart/inet.json"));

	socket.emit('info', require("./trailers/info.json"));

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

function match(line){

	if( line.length<29) return false;
	if( line[0].charCodeAt(0) < 48 || line[0].charCodeAt(0) > 57) return false;
	if( line[1].charCodeAt(0) < 48 || line[1].charCodeAt(0) > 57) return false;
	if( line[2].charCodeAt(0) != ':'.charCodeAt(0)) return false;
	if( line[3].charCodeAt(0) < 48 || line[3].charCodeAt(0) > 57) return false;
	if( line[4].charCodeAt(0) < 48 || line[4].charCodeAt(0) > 57) return false;
	if( line[5].charCodeAt(0) != ':'.charCodeAt(0)) return false;
	if( line[6].charCodeAt(0) < 48 || line[6].charCodeAt(0) > 57) return false;
	if( line[7].charCodeAt(0) < 48 || line[7].charCodeAt(0) > 57) return false;
	if( line[8].charCodeAt(0) != ','.charCodeAt(0)) return false;
	if( line[9].charCodeAt(0) < 48 || line[9].charCodeAt(0) > 57) return false;
	if( line[10].charCodeAt(0) < 48 || line[10].charCodeAt(0) > 57) return false;
	if( line[11].charCodeAt(0) < 48 || line[11].charCodeAt(0) > 57) return false;

	if( line[12].charCodeAt(0) != ' '.charCodeAt(0)) return false;
	if( line[13].charCodeAt(0) != '-'.charCodeAt(0)) return false;
	if( line[14].charCodeAt(0) != '-'.charCodeAt(0)) return false;
	if( line[15].charCodeAt(0) != '>'.charCodeAt(0)) return false;
	if( line[16].charCodeAt(0) != ' '.charCodeAt(0)) return false;
	
	if( line[17].charCodeAt(0) < 48 || line[0].charCodeAt(0) > 57) return false;
	if( line[18].charCodeAt(0) < 48 || line[1].charCodeAt(0) > 57) return false;
	if( line[19].charCodeAt(0) != ':'.charCodeAt(0)) return false;
	if( line[20].charCodeAt(0) < 48 || line[3].charCodeAt(0) > 57) return false;
	if( line[21].charCodeAt(0) < 48 || line[4].charCodeAt(0) > 57) return false;
	if( line[22].charCodeAt(0) != ':'.charCodeAt(0)) return false;
	if( line[23].charCodeAt(0) < 48 || line[6].charCodeAt(0) > 57) return false;
	if( line[24].charCodeAt(0) < 48 || line[7].charCodeAt(0) > 57) return false;
	if( line[25].charCodeAt(0) != ','.charCodeAt(0)) return false;
	if( line[26].charCodeAt(0) < 48 || line[9].charCodeAt(0) > 57) return false;
	if( line[27].charCodeAt(0) < 48 || line[10].charCodeAt(0) > 57) return false;
	if( line[28].charCodeAt(0) < 48 || line[11].charCodeAt(0) > 57) return false;

	return true;
}

function heightAdjust(srcPath, dstPath) {
    fs.readFile(srcPath, 'utf8', function (err, data) {
            if(err){
            	throw err;
            }
            var array = data.toString().split('\n');
            for(var i = 0; i<array.length; i++){
            	if(match(array[i])){
            		array[i] = array[i].substring(0, 8) + "." + array[i].substring(9, 25) + "." + array[i].substring(26, 29) + " line:" + height + "%";
            	}
            }
            data = array.join('\n');
            data = "WEBVTT\n\n" + data;
            fs.writeFile (dstPath, data, function(err) {
                if(err){
                	throw err;
                }
            });
	});
}