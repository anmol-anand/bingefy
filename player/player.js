window.onload = function(){

	window.frame = document.getElementById('frame');
	window.controlBar = document.getElementById('controlBar');
	window.rightDiv = document.getElementById('rightDiv');
	window.thumbList = document.getElementById('thumbList');
	window.mainVideo = document.getElementById('mainVideo');
	window.seekSlider = document.getElementById('seekSlider');
	window.trailerNameText = document.getElementById('trailerNameText');
	window.currentTime = document.getElementById('currentTime');
	window.durationTime = document.getElementById('durationTime');
	window.volumeBox = document.getElementById('volumeBox');
	window.muteBtn = document.getElementById('muteBtn');
	window.muteSprite = document.getElementById('muteSprite');
	window.volumeSlider = document.getElementById('volumeSlider');
	window.smallVol = 0.20*volumeSlider.max;
	window.preVol = smallVol;
	window.fullScreenBtn = document.getElementById('fullScreenBtn');
	window.fullScreenSprite = document.getElementById('fullScreenSprite');
	window.cc = document.getElementById('cc');
	window.ccBtn = document.getElementById('ccBtn');
	window.ccDiv = document.getElementById('ccDiv');
	window.next = document.getElementById('next');
	window.previous = document.getElementById('previous');
	window.previousTextTrack = 0; // Being used already

	window.seekSheet = document.createElement('style');
	document.body.appendChild(seekSheet);
	updateSeekStyle(0);
	seekSlider.value = 0;

	window.volumeSheet = document.createElement('style');
	document.body.appendChild(volumeSheet);

	window.playPauseBtn = document.getElementById('playPauseBtn');
	window.playPauseSprite = document.getElementById('playPauseSprite');

	window.b = 0.67; // frame height to window height ratio
	window.minVideoWidth = 640; // px

	//sliders are not reinitialized on onload, so sync the video ac to them
	//in case of the seek slider the sliders are synced ac to the video, every moment
	mainVideo.volume = volumeSlider.value/volumeSlider.max;
	updateVolumeStyle(100*volumeSlider.value/volumeSlider.max);

	//wehn video is loaded volume slider is not reinitialized but muteBtn is so sync it
	if(volumeSlider.value==0){
		muteSprite.src = "../sprites/vol1.png";
	}
	else{
		muteSprite.src = "../sprites/vol.png";
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
		if(!event.target.matches('#ccSprite')){ // the target is the innermost element or the element at the leaf
			ccDiv.style.display = 'none';
		}
	}, false);

	window.addEventListener('resize', function(){

		windowResized();
	}, false);
	// initial sizing of video
	// BUG$$: I have to use the setTimeout function because the following does not work
	// document.addEventListener('DOMContentLoaded', function() {

	// 	var aspectRatio = mainVideo.videoWidth / mainVideo.videoHeight;
	// 	fitVideo( Math.max( window.innerWidth, minVideoWidth), Math.max( b*window.innerHeight, minVideoWidth/aspectRatio), aspectRatio);
	// }, false);

	setTimeout(function(){

		frame.style.width = Math.min(mainVideo.offsetWidth, window.innerWidth);
		var aspectRatio = mainVideo.videoWidth / mainVideo.videoHeight;
		fitVideo( Math.max( window.innerWidth, minVideoWidth), Math.max( b*window.innerHeight, minVideoWidth/aspectRatio), aspectRatio);
		positionVideo();
	}, 1000);
	// This (ControlBar) can be positioned independently, as the only variable it requires is window.width
	positionControlBar();

	sendControls();
};

function windowResized(){ // make changes that ought to be made on window resizing, here

	// mainVideo
	frame.style.width = Math.min(mainVideo.offsetWidth, window.innerWidth);
	var aspectRatio = mainVideo.videoWidth / mainVideo.videoHeight;
	// BUG$$: position video takes effect before fitVideo in chrome when exiting full screen, fucking up the positioning of the video...
	// ... to be precise fitVideo does run before but mainVideo.offsetWidth/Height do not show the values that were set to them by mainVideo.style.width/height until later some time
	fitVideo( Math.max( window.innerWidth, minVideoWidth), Math.max( b*window.innerHeight, minVideoWidth/aspectRatio), aspectRatio);
	positionVideo();
	positionControlBar();


	// rightDiv
	rightDiv.style.width = window.innerWidth + "px";
	if( window.innerWidth >= thumbList.style.width.substring(0, thumbList.style.width.length - 2) ){ // well within

		thumbList.style.left = ( Number(rightDiv.style.left.substring(0, rightDiv.style.left.length - 2)) + Number(rightDiv.style.width.substring(0, rightDiv.style.width.length - 2)) - Number(thumbList.style.width.substring(0, thumbList.style.width.length - 2)) )/2 + "px";
		rightDiv.style.overflowX = "hidden";
	}
	else{ // overflowing

		thumbList.style.left = 0;
		rightDiv.style.overflowX = "scroll";
	}
}

function positionVideo(){

	if( mainVideo.offsetWidth < window.innerWidth){
		
		mainVideo.style.left = ( window.innerWidth - mainVideo.offsetWidth)/2 + "px";
	}
	else{

		mainVideo.style.left = "0px";
	}
}

function positionControlBar(){

	if(window.innerWidth > 640){

		controlBar.style.left = ( (window.innerWidth)/2 - 320) + "px";
	}
	else{

		controlBar.style.left = "0px";
	}
}

function fitVideo(ww, hh, aspectRatio){ // We have to fit the video in a box of wwxhh maintaining the aspect ratio

	if(ww/hh > aspectRatio){
		mainVideo.style.height = hh + "px"; // height is the deciding factor
		// mainVideo.style.width = hh*aspectRatio + "px"; // height is the deciding factor
		mainVideo.style.fontSize = (hh * 28 / 800) + "pt"; // to adjust subtitle size
	}
	else{
		mainVideo.style.height = (ww / aspectRatio) + "px"; // width is the deciding factor
		// mainVideo.style.width = ww + "px"; // width is the deciding factor
		mainVideo.style.fontSize = ((ww / aspectRatio) * 28 / 800) + "pt"; // to adjust subtitle size
	}

	// BUG$$: Do something to reposition the cues immediately on video size change, they stay on their old position until the next cue
	// ...but the below works pretty well too
	for(var i = 0; i<mainVideo.textTracks.length; i++){
		if(mainVideo.textTracks[i].mode=='showing'){
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

		var thumbnail = document.createElement('div');
		thumbnail.className = 'thumbnail';
		thumbnail.id = '' + i;

		var img = document.createElement('img');
		img.className = 'thumbImg';
		var videoPath = trailers[i].folder + "/" + trailers[i].name;
		var thumbPath = "../trailers/thumbs/";
		for(j = 11; j<videoPath.length - 4; j++){
			if(videoPath[j]=='/'){
				thumbPath = thumbPath + "__";
				continue;
			}
			thumbPath = thumbPath + videoPath[j];
		}
		thumbPath = thumbPath + ".jpg";
		img.src = thumbPath;
		thumbnail.appendChild(img);

		var thumbText = document.createElement('div');
		thumbText.innerHTML = trailers[i].name.substring(0, trailers[i].name.length - 4);
		thumbText.className = 'thumbText';

		thumbnail.appendChild(thumbText);
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

	// styling rightDiv

	thumbTexts = document.getElementsByClassName('thumbText');
	thumbImgs = document.getElementsByClassName('thumbImg');

	var i;
	for(i = 0; i<thumbTexts.length; i++){

		thumbTexts[i].style.width = thumbImgs[i].naturalWidth + "px";
		// thumbTexts[i].style.height = "20px";
		thumbnails[i].style.width = thumbImgs[i].naturalWidth + "px";

		if(i==0){
			thumbnails[i].style.left = "20px";
			thumbnails[i].style.top = "0px";
		}
		else{
			thumbnails[i].style.left = ( Number(thumbnails[i-1].style.left.substring(0, thumbnails[i-1].style.left.length - 2)) + Number(thumbnails[i-1].style.width.substring(0, thumbnails[i-1].style.width.length - 2)) + 20) + "px";
			thumbnails[i].style.top = (Number(thumbnails[i-1].style.top.substring(0, thumbnails[i-1].style.top.length - 2)) - 200) + "px";
		}
	}

	thumbList.style.width = ( Number(thumbnails[i-1].style.left.substring(0, thumbnails[i-1].style.left.length - 2)) + Number(thumbnails[i-1].style.width.substring(0, thumbnails[i-1].style.width.length - 2)) + 20) + "px";
	
	rightDiv.style.width = window.innerWidth + "px";
	if( window.innerWidth >= thumbList.style.width.substring(0, thumbList.style.width.length - 2) ){ // well within

		thumbList.style.left = ( Number(rightDiv.style.left.substring(0, rightDiv.style.left.length - 2)) + Number(rightDiv.style.width.substring(0, rightDiv.style.width.length - 2)) - Number(thumbList.style.width.substring(0, thumbList.style.width.length - 2)) )/2 + "px";
		rightDiv.style.overflowX = "hidden";
	}
	else{ // overflowing

		thumbList.style.left = 0;
		rightDiv.style.overflowX = "scroll";
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
	if(movtracks[0]){
		trailerNameText.innerHTML = movtracks[0].substring( 0, movtracks[0].length - 4);
	}
}

function fillSubs(subtracks){

	var ccItem = document.createElement('div');
	ccItem.className = 'ccItem';
	ccItem.name = 'none';
	ccItem.innerHTML = "none"; // you might change this during styling, so we will use name to store name for the backend
	ccDiv.appendChild(ccItem);

	for(var i = 0; i<subtracks.length; i++){
		
		var name = subtracks[i];

		// appending track to mainVideo
		var track = document.createElement('track');
		track.kind = 'subtitles';
		track.src = trailerPath + name;
		track.label = name;
		mainVideo.appendChild(track);

		// appending ccItem to dropdown ccDiv
		var ccItem = document.createElement('div');
		ccItem.className = 'ccItem';
		ccItem.name = name;
		ccItem.innerHTML = name; // you might change this during styling, so we will use name to store name for the backend
		ccDiv.appendChild(ccItem);
	}

	for(var i = 0; i<mainVideo.textTracks.length; i++){
		mainVideo.textTracks[i].mode = 'hidden';
	}
	topLeftDisplay('none');

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
		playPauseBtn: ( playPauseSprite.src.substring(playPauseSprite.src.length - 8, playPauseSprite.src.length - 4)), 
		seekSlider: seekSlider.value, 
		currentTime: currentTime.innerHTML, 
		durationTime: durationTime.innerHTML,
		muteBtn: muteSprite.src.substring(muteSprite.src.length - 7, muteSprite.src.length - 4),
		volumeSlider: volumeSlider.value,
		preVol: preVol,
		fullScreenBtn: fullScreenSprite.src.substring(fullScreenSprite.src.length - 20, fullScreenSprite.src.length - 4),
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
			if( playPauseSprite.src.substring(playPauseSprite.src.length - 8, playPauseSprite.src.length - 4) == "play"){//currnetly showing Play, show Pause
				playPauseSprite.src = "../sprites/pause.png";
			}
			else{
				playPauseSprite.src = "../sprites/play.png";
			}
			break;
		case "seekSlider" :
			mainVideo.currentTime = mainVideo.duration*(data.seekSliderValue/seekSlider.max);
			seekSlider.value = data.seekSliderValue;
			updateSeekStyle(100*seekSlider.value/seekSlider.max);
			break;
		case "updateSlider" :
			autoSeekUpdate(data.curT, data.durT);
			break;
		case "videoEnded":
			playPauseSprite.src = "../sprites/play.png";
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

function topLeftDisplay(str){ // Also highlighting the corresponding ccItem here
	ccItems = document.getElementsByClassName('ccItem');
	for(var i = 0; i<ccItems.length; i++){
		if(ccItems[i].name==str){
			console.log("Subtitles: " + ccItems[i].innerHTML);
			ccItems[i].style.backgroundColor = '#292929';
		}
		else{
			ccItems[i].style.backgroundColor = '#141414';
		}
	}
}

function updateSeekStyle(percentValue){

	var styleExpression = "";
	styleExpression += "\n#seekSlider::-moz-range-track{\n\tbackground: linear-gradient(90deg, #747474 " + percentValue + "%, #474747 " + percentValue + "%);\n}";
	seekSheet.textContent = styleExpression;
}

function autoSeekUpdate(curT, durT){

	seekSlider.value = seekSlider.max*curT/durT;
	updateSeekStyle( 100*curT/durT);
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

function updateVolumeStyle(percentValue){

	var styleExpression = "";
	styleExpression += "\n#volumeSlider::-moz-range-track{\n\tbackground: linear-gradient(90deg, #747474 " + percentValue + "%, #474747 " + percentValue + "%);\n}";
	volumeSheet.textContent = styleExpression;
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
		muteSprite.src = "../sprites/vol1.png";
	}
	else{
		muteSprite.src = "../sprites/vol.png";
	}

	mainVideo.volume = volumeSlider.value/volumeSlider.max;
	updateVolumeStyle( 100*volumeSlider.value/volumeSlider.max);
}

function fullScreenFirstfunction(){
	if(fullScreenSprite.src.substring(fullScreenSprite.src.length - 20, fullScreenSprite.src.length - 4)=="nter_full_screen"){
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
	if(fullScreenSprite.src.substring(fullScreenSprite.src.length - 20, fullScreenSprite.src.length - 4)=="nter_full_screen"){
		fullScreenSprite.src = "../sprites/exit_full_screen.png"
	}
	else{
		fullScreenSprite.src = "../sprites/enter_full_screen.png"
	}
}