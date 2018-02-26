window.onload = function() {
	window.playPauseBtn = document.getElementById("playPauseBtn")
	window.mainVideo = document.getElementById("mainVideo");
	window.socket = io.connect();
	socket.on('toggle', function(data){
		// var control = document.getElementById(data.Control);
		toggle();
	});
};

function trigger(){
	socket.emit('trigger', {Control: "playPauseBtn"});
}

function toggle(){
	if(mainVideo.paused){
		mainVideo.play();
		playPauseBtn.innerHTML = "Pause";
	} else {
		mainVideo.pause();
		playPauseBtn.innerHTML = "Play";
	}
}
