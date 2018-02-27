window.onload = function(){
	window.playPauseBtn = document.getElementById('playPauseBtn');
	window.mainVideo = document.getElementById('mainVideo');
	window.seekSlider = document.getElementById('seekSlider');
	window.currentTime = document.getElementById('currentTime');
	window.durationTime = document.getElementById('durationTime');

	window.socket = io.connect();
	socket.on('toggle', function(data){
		toggle(data);
	});
	
	playPauseBtn.addEventListener('click', function(){ 
		trigger( {Control: "playPauseBtn"});
	}, false);
	seekSlider.addEventListener('change', function(){ 
		trigger( {Control: "seekSlider", seekSliderValue: seekSlider.value});
	}, false);
	mainVideo.addEventListener('timeupdate', function(){
		trigger( {Control: "updateSlider", curT: mainVideo.currentTime, durT: mainVideo.duration});
	}, false);
};

function trigger(data){
	socket.emit('trigger', data);
}

function toggle(data){
	switch (data.Control){
		case "playPauseBtn" :
			if(mainVideo.paused){
				mainVideo.play();
				playPauseBtn.innerHTML = "Pause";
			}
			else{
				mainVideo.pause();
				playPauseBtn.innerHTML = "Play";
			}
			break;
		case "seekSlider" :
			mainVideo.currentTime = mainVideo.duration*(data.seekSliderValue/seekSlider.max);
			seekSlider.value = data.seekSliderValue;
			break;
		case "updateSlider" :
			seekUpdate(data.curT, data.durT);
			break;
	}
}

function seekUpdate(curT, durT){
	seekSlider.value = seekSlider.max*curT/durT;
	var curmins = Math.floor(curT/60);
	var cursecs = Math.floor(curT%60);
	var durmins = Math.floor(durT/60);
	var dursecs = Math.floor(durT%60);
	if(cursecs < 10){
		cursecs = "0" + cursecs;
	}
	if(dursecs < 10){
		dursecs = "0" + dursecs;
	}
	currentTime.innerHTML = curmins + ":" + cursecs;
	durationTime.innerHTML = durmins + ":" + dursecs;
}