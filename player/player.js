window.onload = function(){

	window.frame = document.getElementById('frame');
	window.controlBar = document.getElementById('contorlBar');
	window.rightDiv = document.getElementById('rightDiv');
	window.thumbList = document.getElementById('thumbList');
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
	window.next = document.getElementById('next');
	window.previous = document.getElementById('previous');
	window.previousTextTrack = 0; // Being used already

	window.playPauseBtn = document.getElementById('playPauseBtn');
	window.lhalf = document.getElementById('lhalf');
	window.rhalf = document.getElementById('rhalf');
	initPlayPause();

	window.a = 0.16; // tape height to window height ratio
	window.b = 0.67; // frame height to window height ratio
	window.minVideoWidth = 640; // px

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
	socket.on('trailer', function(data){

		window.trailerPath = "." + data.trailerPath;
		fillMovs(data.movtracks);
		fillSubs(data.subtracks);
	});
	socket.on('inet', function(data){

		document.getElementById('inet').innerHTML = data.ethernet + "<br>" + data.wifi;
	}, false);
	socket.on('toggle', function(data){

		toggle(data);
	});
	socket.on('get controls', function(data){

		sendControls();
	});
	socket.on('info', function(data){

		window.trailers = data.trailers;
		fillRightDiv();
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
	next.addEventListener('click', function(){
		trigger( {Control: 'next'});
	}, false);
	previous.addEventListener('click', function(){
		trigger( {Control: 'previous'});
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
		adjustSubs();
	}, false);
	document.addEventListener('mozfullscreenchange', function(e){
		trigger( {Control: "fullScreenBtn"});
		adjustSubs();
		// console.log(mainVideo.videoWidth + "x" + mainVideo.videoHeight); // dimensions of the actual video
		// console.log(mainVideo.offsetWidth + "x" + mainVideo.offsetHeight); // dimensions of the video tag
	}, false);
	document.addEventListener('fullscreenchange', function(e){
		trigger( {Control: "fullScreenBtn"});
		adjustSubs();
	}, false);

	document.addEventListener('keydown', keystroke, false);//see keystroke.js
	
	document.addEventListener('click', function(event){
		if(!event.target.matches('#ccBtn')){
			ccDiv.style.display = 'none';
		}
	}, false);

	window.addEventListener('resize', function(){

		var aspectRatio = mainVideo.videoWidth / mainVideo.videoHeight;
		fitVideo( Math.max( window.innerWidth, minVideoWidth), Math.max( b*window.innerHeight, minVideoWidth/aspectRatio), aspectRatio);
	}, false);
	// initial sizing of video
	// BUG$$: I have to use the setTimeout function because the following does not work
	// document.addEventListener('DOMContentLoaded', function() {

	// 	var aspectRatio = mainVideo.videoWidth / mainVideo.videoHeight;
	// 	fitVideo( Math.max( window.innerWidth, minVideoWidth), Math.max( b*window.innerHeight, minVideoWidth/aspectRatio), aspectRatio);
	// }, false);
	setTimeout(function(){

		var aspectRatio = mainVideo.videoWidth / mainVideo.videoHeight;
		fitVideo( Math.max( window.innerWidth, minVideoWidth), Math.max( b*window.innerHeight, minVideoWidth/aspectRatio), aspectRatio);
	}, 1000);

	sendControls();
};

function fitVideo(ww, hh, aspectRatio){ // We have to fit the video in a box of wwxhh maintaining the aspect ratio

	if(ww/hh > aspectRatio){

		mainVideo.style.height = hh + "px"; // height is the deciding factor
		mainVideo.style.fontSize = (hh * 28 / 800) + "pt"; // to adjust subtitle size
	}
	else{

		mainVideo.style.height = (ww / aspectRatio) + "px"; // width is the decidinf=g factor
		mainVideo.style.fontSize = ((ww / aspectRatio) * 28 / 800) + "pt"; // to adjust subtitle size
	}

	// BUG$$: Do something to reposition the cues immediately on video size change, they stay on their old position until the next cue
	// ...but the below works pretty well too
	for(var i = 0; i<mainVideo.textTracks.length; i++){
		if(mainVideo.textTracks[i].mode = 'showing'){
			mainVideo.textTracks[i].mode = 'hidden';
			previousTextTrack = i;
			setTimeout(function(){
				mainVideo.textTracks[previousTextTrack].mode = 'showing';
			}, 1000);
		}
	}
}

function adjustSubs(){ // adjust the subitle size on entering/exiting full screen

	if( (mainVideo.offsetHeight/mainVideo.videoHeight) < (mainVideo.offsetWidth/mainVideo.videoWidth)){

		mainVideo.style.fontSize = (mainVideo.offsetHeight * 28 / 800) + "pt";
	}
	else{

		mainVideo.style.fontSize = ( ( mainVideo.offsetWidth * mainVideo.videoHeight / mainVideo.videoWidth) * 28 / 800) + "pt";
	}
}

function curTrailerIndex(){

	for(var i = 0; i<trailers.length; i++){
		if( "." + trailers[i].folder + "/" + trailers[i].name == sourcePath){
			return i;
		}
	}
}

function fillRightDiv(){

	for(var i = 0; i<trailers.length; i++){		
		
		var thumbnail = document.createElement('button');
		thumbnail.className = 'thumbnail';
		thumbnail.id = '' + i;
		thumbnail.innerHTML = trailers[i].name;
		thumbList.appendChild(thumbnail);
	}

	window.thumbnails = document.getElementsByClassName('thumbnail');

	for(var i = 0; i<thumbnails.length; i++){
	
		var thumbnail = thumbnails[i];
		thumbnail.addEventListener('click', function(){

			changeDetails( trailers[Number(this.id)].folder, trailers[Number(this.id)].name);
			trigger({ Control: "reload"});
		}, false);
	}
}

function changeDetails(folder, name){
	
	socket.emit( 'changeDetails', {trailerFolder: folder, trailerName: name});
}

function reload(){

	window.location.replace(window.location.pathname + window.location.search + window.location.hash);
}

function fillMovs(movtracks){

	var source = document.createElement('source');
	window.sourcePath = trailerPath + movtracks[0]; // will be needed later in curTrailerIndex
	source.src = sourcePath;
	mainVideo.appendChild(source);
}

function fillSubs(subtracks){

	for(var i = 0; i<subtracks.length; i++){
		
		var name = subtracks[i];

		// appending track to mainVideo
		var track = document.createElement('track');
		track.kind = 'subtitles';
		track.src = trailerPath + name;
		track.label = name;
		mainVideo.appendChild(track);

		// appending ccItem to dropdown ccDiv
		var ccItem = document.createElement('button');
		ccItem.className = 'ccItem';
		ccItem.name = name;
		ccItem.innerHTML = name; // you might change this during styling, so we will use name to store name for the backend
		ccDiv.appendChild(ccItem);
	}

	for(var i = 0; i<mainVideo.textTracks.length; i++){
		mainVideo.textTracks[i].mode = 'hidden';
	}

	// BUG$$: On reload all textTracks were hidden ac to me, but this is not the case a textTrack is showing in the beginning

	window.ccItems = document.getElementsByClassName('ccItem');

	for(var i = 0; i < ccItems.length; i++){

		var ccItem = ccItems[i];
		ccItem.addEventListener('click', function(){

			trigger( {Control: 'cc', name: this.name});
		}, false);
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
		case "cc":
			var subsOff = true;
			for(var j = 0; j < mainVideo.textTracks.length; j++){
				if(mainVideo.textTracks[j].label == data.name){
					subsOff = false;
					mainVideo.textTracks[j].mode = 'showing';
					topLeftDisplay(mainVideo.textTracks[j].label);
				}
				else{
					mainVideo.textTracks[j].mode = 'hidden';
				}
			}
			if(subsOff){
				topLeftDisplay("none");
			}
			break;
		case "nextSubtrack":
			var brokenOut = false;
			for(var j = 0; j < mainVideo.textTracks.length; j++){
				if(mainVideo.textTracks[j].mode=='showing'){
					mainVideo.textTracks[j].mode = 'hidden';
					if( j+1 < mainVideo.textTracks.length){
						mainVideo.textTracks[j+1].mode = 'showing';
						topLeftDisplay(mainVideo.textTracks[j+1].label);
					}
					else{
						topLeftDisplay("none");
					}
					brokenOut = true;
					break;
				}
			}
			if((!brokenOut) && (mainVideo.textTracks.length > 0)){
				mainVideo.textTracks[0].mode = 'showing';
				topLeftDisplay(mainVideo.textTracks[0].label);
			}
			break;
		case "reload":
			reload();
			break;
		case "next":
			var changedTrailerIndex = (curTrailerIndex()+1)%(trailers.length);
			changeDetails( trailers[changedTrailerIndex].folder, trailers[changedTrailerIndex].name);
			trigger( {Control: 'reload'});
			break;
		case "previous":
			var changedTrailerIndex = (curTrailerIndex()+(trailers.length)-1)%(trailers.length);
			changeDetails( trailers[changedTrailerIndex].folder, trailers[changedTrailerIndex].name);
			trigger( {Control: 'reload'});
			break;
	}
}

function topLeftDisplay(str){
	ccItems = document.getElementsByClassName('ccItem');
	for(var i = 0; i<ccItems.length; i++){
		if(ccItems[i].name==str){
			console.log("Subtitles: " + ccItems[i].innerHTML);
			return;
		}
	}
}

function autoSeekUpdate(curT, durT){

	seekSlider.value = seekSlider.max*curT/durT;
	var curhrs = Math.floor(curT/3600);
	var curmins = Math.floor((curT%3600)/60);
	var cursecs = Math.floor(curT%60);
	var durhrs = Math.floor(durT/3600);
	var durmins = Math.floor((durT%3600)/60);
	var dursecs = Math.floor(durT%60);

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