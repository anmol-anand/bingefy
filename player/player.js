window.onload = function(){
	window.playPauseBtn = document.getElementById('playPauseBtn');
	window.mainVideo = document.getElementById('mainVideo');
	window.seekSlider = document.getElementById('seekSlider');

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
		trigger( {Control: "updateSlider", seekSliderValue: seekSlider.max*mainVideo.currentTime/mainVideo.duration});
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
			seekSlider.value = data.seekSliderValue;
	}
}
