window.onload = function(){

	window.playPauseBtn = document.getElementById('playPauseBtn');
	window.mainVideo = document.getElementById('mainVideo');
	window.seekSlider = document.getElementById('seekSlider');
	window.currentTime = document.getElementById('currentTime');
	window.durationTime = document.getElementById('durationTime');
	window.muteBtn = document.getElementById('muteBtn');
	window.volumeSlider = document.getElementById('volumeSlider');
	window.preVol = volumeSlider.value;
	window.smallVol = 0.20*volumeSlider.max;
	window.fullScreenBtn = document.getElementById('fullScreenBtn');

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
	mainVideo.addEventListener('ended', function(){
		trigger( {Control: "videoEnded"});
	}, false);
	muteBtn.addEventListener('click', function(){
		trigger( {Control: "muteBtn", volumeSliderValue: volumeSlider.value});
	}, false);
	volumeSlider.addEventListener('change', function(){
		trigger( {Control: "volumeSlider", volumeSliderValue: volumeSlider.value});
	}, false);
	fullScreenBtn.addEventListener('click', function(){ 
		trigger( {Control: "fullScreenBtn"});
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
			autoSeekUpdate(data.curT, data.durT);
			break;
		case "videoEnded":
			playPauseBtn.innerHTML = "Play";
			break;
		case "muteBtn":
			toggleVolume(data);
			break;
		case "volumeSlider":
			toggleVolume(data);
			break;
		case "fullScreenBtn":
			toggleVideoFullScreen();
			if(fullScreenBtn.innerHTML=="Full Screen"){
				fullScreenBtn.innerHTML = "Exit Full Screen";
			}
			else{
				fullScreenBtn.innerHTML = "Full Screen";
			}
			break;
	}
}

function autoSeekUpdate(curT, durT){

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

function toggleVolume(data){

	volumeSlider.value = data.volumeSliderValue;
	if(data.Control=="volumeSlider"){
		preVol = smallVol;
	}
	else{
		if(volumeSlider.value==0){
			volumeSlider.value = preVol;
		}
		else{
			preVol = volumeSlider.value;
			volumeSlider.value = 0;
		}
	}
	
	if(volumeSlider.value==0){
		muteBtn.innerHTML = "Unmute";
	}
	else{
		muteBtn.innerHTML = "Mute";
	}

	mainVideo.volume = volumeSlider.value/volumeSlider.max;
}

function toggleVideoFullScreen(){

}