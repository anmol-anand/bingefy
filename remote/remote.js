window.onload = function() {
	window.playPauseBtn = document.getElementById("playPauseBtn");
	window.socket = io.connect();
	socket.on('toggle', function(data){
		// var control = document.getElementById(data.Control);
		toggle();
	});
}

function trigger(){
	socket.emit('trigger', {Control: "playPauseBtn"});
}

function toggle(){
	if(playPauseBtn.innerHTML=="Pause"){
		playPauseBtn.innerHTML = "Play";
	}
	else{
		playPauseBtn.innerHTML = "Pause";	
	}
}