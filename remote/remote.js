window.onload = function() {
	window.playPauseBtn = document.getElementById('playPauseBtn');
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
			seekUpdate(data.curT, data.durT);
			break;
		case "stop":
			playPauseBtn.innerHTML = "Replay";
	}
}

function seekUpdate(curT, durT){
	seekSlider.value = seekSlider.max*curT/durT;
	var curhrs = Math.floor(curT/3600);
	var curmins = Math.floor((curT%3600)/60);
	var cursecs = Math.ceil(curT%60);
	var durhrs = Math.floor(durT/3600);
	var durmins = Math.floor((durT%3600)/60);
	var dursecs = Math.ceil(durT%60);

	if(cursecs < 10){
		cursecs = "0" + cursecs;
	}
	var extcurmins = curmins;
	if(extcurmins < 10){
		extcurmins = "0" + extcurmins;
	}
	if(dursecs < 10){
		dursecs = "0" + dursecs;
	}
	var extdurmins = durmins;
	if(extdurmins < 10){
		extdurmins = "0" + extdurmins;
	}
	currentTime.innerHTML = ((curhrs > 0)?(curhrs + ":" + extcurmins):curmins) + ":" + cursecs;
	durationTime.innerHTML = ((durhrs > 0)?(durhrs + ":" + extdurmins):durmins) + ":" + dursecs;
}