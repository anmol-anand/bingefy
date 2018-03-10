window.onload = function(){

	window.frame = document.getElementById('frame');
	window.controlBar = document.getElementById('contorlBar');
	window.mainVideo = document.getElementById('mainVideo');
	window.seekSlider = document.getElementById('seekSlider');
	window.currentTime = document.getElementById('currentTime');
	window.durationTime = document.getElementById('durationTime');
	window.muteBtn = document.getElementById('muteBtn');
	window.volumeSlider = document.getElementById('volumeSlider');
	window.smallVol = 0.20*volumeSlider.max;
	window.preVol = smallVol;
	window.fullScreenBtn = document.getElementById('fullScreenBtn');
	window.tenSecFwd = document.getElementById('tenSecFwd');
	window.tenSecBwd = document.getElementById('tenSecBwd');
	window.cc = document.getElementById('cc');
	window.ccBtn = document.getElementById('ccBtn');
	window.ccDiv = document.getElementById('ccDiv');

	window.playPauseBtn = document.getElementById('playPauseBtn');
	window.lhalf = document.getElementById('lhalf');
	window.rhalf = document.getElementById('rhalf');
	initPlayPause();

	//sliders are not reinitialized on onload, so sync the video ac to them
	//in case of the seek slider the sliders are synced ac to the video, every moment
	mainVideo.volume = volumeSlider.value/volumeSlider.max;

	//wehn video is loaded volume slider is not reinitialized but muteBtn is so sync it
	if(volumeSlider.value==0){
		muteBtn.innerHTML = "Unmute";
	}
	else{
		muteBtn.innerHTML = "Mute";
	}

	window.firstTrigger = false; // to nullify the effect of mainVideo.play eventListener at load as the play icon is manually initialized, we don't want it to be changed again

	window.socket = io.connect();
	socket.on('movtracks', function(movtracks){

		fillMovs(movtracks);
	});
	socket.on('subtracks', function(subtracks){

		fillSubs(subtracks);
	});
	socket.on('toggle', function(data){

		toggle(data);
	});
	socket.on('get controls', function(data){

		sendControls();
	});

	playPauseBtn.addEventListener('click', function(){ 
		trigger( {Control: "playPauseBtn"});
	}, false);
	seekSlider.addEventListener('input', function(){ 
		trigger( {Control: "seekSlider", seekSliderValue: seekSlider.value});
	}, false);
	muteBtn.addEventListener('click', function(){
		trigger( {Control: "muteBtn", volumeSliderValue: volumeSlider.value});
	}, false);
	volumeSlider.addEventListener('input', function(){
		trigger( {Control: "volumeSlider", volumeSliderValue: volumeSlider.value});
	}, false);
	fullScreenBtn.addEventListener('click', function(){ 
		trigger( {Control: "fullScreenFirst"});
	}, false);
	tenSecFwd.addEventListener('click', function(){
		trigger( {Control: "tenSecFwd"});
	}, false);
	tenSecBwd.addEventListener('click', function(){
		trigger( {Control: "tenSecBwd"});
	}, false);
	ccBtn.addEventListener('click', function(){
		if(ccDiv.style.display=='none'){
			ccDiv.style.display = 'block';
		}
		else if(ccDiv.style.display=='block'){
			ccDiv.style.display = 'none';
		}
	}, false);

	mainVideo.addEventListener('pause', function(){
		firstTrigger = true;
		trigger( {Control: "playPauseVideo"});
	}, false);
	mainVideo.addEventListener('play', function(){
		if(firstTrigger){
			trigger( {Control: "playPauseVideo"});
		}
	}, false);
	mainVideo.addEventListener('timeupdate', function(){
		trigger( {Control: "updateSlider", curT: mainVideo.currentTime, durT: mainVideo.duration});
	}, false);
	mainVideo.addEventListener('ended', function(){
		trigger( {Control: "videoEnded"});
	}, false);
	mainVideo.addEventListener('click', function(){
		trigger( {Control: "playPauseBtn"});
	}, false);
	mainVideo.addEventListener('dblclick', function(){
		trigger( {Control: "fullScreenFirst"});
	}, false);
	
	document.addEventListener('webkitfullscreenchange', function(e){
		trigger( {Control: "fullScreenBtn"});
	}, false);
	document.addEventListener('mozfullscreenchange', function(e){
		trigger( {Control: "fullScreenBtn"});
	}, false);
	document.addEventListener('fullscreenchange', function(e){
		trigger( {Control: "fullScreenBtn"});
	}, false);

	document.addEventListener('keydown', keystroke, false);//see keystroke.js
	
	document.addEventListener('click', function(event){
		if(!event.target.matches('#ccBtn')){
			ccDiv.style.display = 'none';
		}
	}, false);
	
	sendControls();

};

function fillMovs(movtracks){
	var source = document.createElement('source');
	source.src = "../trailers/movs/" + movtracks[1];
	mainVideo.appendChild(source);
}

function fillSubs(subtracks){

	for(var i = 0; i<subtracks.length; i++){
		
		var name = subtracks[i];
		if(name.substring(name.length-4, name.length)!=".vtt"){
			continue;
		}

		// appending track to mainVideo
		var track = document.createElement('track');
		track.kind = 'subtitles';
		track.src = "../trailers/subs/" + subtracks[i];
		mainVideo.appendChild(track);

		// appending ccItem to dropdown ccDiv
		var ccItem = document.createElement('button');
		ccItem.class = 'ccItem';
		ccItem.innerHTML = name;
		ccDiv.appendChild(ccItem);
	}

	for(var i = 0; i<mainVideo.textTracks.length; i++){
		mainVideo.textTracks[i].mode = 'hidden';
	}
}

function sendControls(){

	socket.emit('current controls', { 
		playPauseBtn: (rhalf.style.height=='0px'?'showPlay':'showPause'), 
		seekSlider: seekSlider.value, 
		currentTime: currentTime.innerHTML, 
		durationTime: durationTime.innerHTML,
		muteBtn: muteBtn.innerHTML,
		volumeSlider: volumeSlider.value,
		fullScreenBtn: fullScreenBtn.innerHTML,
	});
}

function trigger(data){

	socket.emit('trigger', data);
}

function toggle(data){

	switch (data.Control){
		case "playPauseBtn": 
			if(mainVideo.paused){
				mainVideo.play();
			}
			else{
				mainVideo.pause();
			}
			break;
		case "playPauseVideo" :
			if(rhalf.style.height == '0px'){//currnetly showing Play, show Pause
				showPause();
			}
			else{
				showPlay();
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
			showPlay();
			break;
		case "muteBtn":
			toggleVolume(data);
			break;
		case "volumeSlider":
			toggleVolume(data);
			break;
		case "fullScreenFirst":
			fullScreenFirstfunction();
			break;
		case "fullScreenBtn":
			toggleFullScreen();
			break;
		case "tenSecFwd":
			if(mainVideo.currentTime + 10*mainVideo.playbackRate < mainVideo.duration){
				mainVideo.currentTime += 10*mainVideo.playbackRate;
			}
			else{
				mainVideo.currentTime = mainVideo.duration;
			}
			break;
		case "tenSecBwd":
			if(mainVideo.currentTime - 10*mainVideo.playbackRate > 0){
				mainVideo.currentTime -= 10*mainVideo.playbackRate;
			}
			else{
				mainVideo.currentTime = 0;
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

function fullScreenFirstfunction(){
	if(fullScreenBtn.innerHTML=="Full Screen"){
		if(mainVideo.requestFullscreen){
			mainVideo.requestFullscreen();
		}
	    else if (mainVideo.msRequestFullscreen){
			mainVideo.msRequestFullscreen();
	    }
		else if(mainVideo.webkitRequestFullScreen){
			mainVideo.webkitRequestFullScreen();
		}
		else if(mainVideo.mozRequestFullScreen){
			mainVideo.mozRequestFullScreen();
		}
		return;
	}
	else{
		if (document.exitFullscreen) {
			document.exitFullscreen();
		}
		else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
		else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		}
		else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
	}
}

function toggleFullScreen(){
	if(fullScreenBtn.innerHTML=="Full Screen"){
		fullScreenBtn.innerHTML = "Exit Full Screen";
	}
	else{
		fullScreenBtn.innerHTML = "Full Screen";
	}
}