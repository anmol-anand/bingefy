window.onload = function() {
	window.playPauseBtn = document.getElementById('playPauseBtn');
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
	
};

function trigger(data){
	socket.emit('trigger', data);
}

function toggle(data){
	switch (data.Control){
		case "playPauseBtn" :
			if(playPauseBtn.innerHTML=="Pause"){
				playPauseBtn.innerHTML = "Play";
			}
			else{
				playPauseBtn.innerHTML = "Pause";	
			}
			break;
		case "seekSlider" : 
			seekSlider.value = data.seekSliderValue;
			break;
		case "updateSlider" :
			seekSlider.value = data.seekSliderValue;
	}
}