window.onload = function() {

	window.controlBar = document.getElementById('contorlBar');
	window.rightDiv = document.getElementById('rightDiv');
	window.thumbList = document.getElementById('thumbList');
	window.seekSlider = document.getElementById('seekSlider');
	window.currentTime = document.getElementById('currentTime');
	window.durationTime = document.getElementById('durationTime');
	window.muteBtn = document.getElementById('muteBtn');
	window.volumeSlider = document.getElementById('volumeSlider');
	window.preVol = volumeSlider.value;
	window.smallVol = 0.20*volumeSlider.max;
	window.fullScreenBtn = document.getElementById('fullScreenBtn');
	window.tenSecFwd = document.getElementById('tenSecFwd');
	window.tenSecBwd = document.getElementById('tenSecBwd');
 	window.cc = document.getElementById('cc');
 	window.ccBtn = document.getElementById('ccBtn');
 	window.ccDiv = document.getElementById('ccDiv');
	window.next = document.getElementById('next');
	window.previous = document.getElementById('previous');

	window.playPauseBtn = document.getElementById('playPauseBtn');
	window.playPauseSprite = document.getElementById('playPauseSprite');

	window.socket = io.connect();
	socket.on('toggle', function(data){

		toggle(data);
	});
	socket.on('trailer', function(data){

		window.trailerPath = "." + data.trailerPath;
		fillMovs(data.movtracks);
		fillSubs(data.subtracks);
	});
	socket.on('current controls', function(data){
		
		if(data.playPauseBtn=='play'){
			playPauseSprite.src = "../sprites/play.png"
		}
		else{
			playPauseSprite.src = "../sprites/pause.png"
		}
		seekSlider.value = data.seekSlider;
		currentTime.innerHTML = data.currentTime;
		durationTime.innerHTML = data.durationTime;
		muteBtn.innerHTML = data.muteBtn;
		volumeSlider.value = data.volumeSlider;
		fullScreenBtn.innerHTML = data.fullScreenBtn;
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

	document.addEventListener('click', function(event){
		if(!event.target.matches('#ccBtn')){
			ccDiv.style.display = 'none';
		}
	}, false);
	
	socket.emit('get controls', {});
};

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
			trigger( { Control: "reload"});
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

}

function fillSubs(subtracks){
	
	for(var i = 0; i<subtracks.length; i++){

		var name = subtracks[i];

		// appending ccItem to dropdown ccDiv
		var ccItem = document.createElement('button');
		ccItem.className = 'ccItem';
		ccItem.name = name;
		ccItem.innerHTML = name; // you might change this during styling, so we will use name to store name for the backend
		ccDiv.appendChild(ccItem);
	}

	window.ccItems = document.getElementsByClassName('ccItem');

	for(var i = 0; i < ccItems.length; i++){

		var ccItem = ccItems[i];
		ccItem.addEventListener('click', function(){

			trigger( {Control: 'cc', name: this.name});
		}, false);
	}
}

function trigger(data){

	socket.emit('trigger', data);
}

function toggle(data){
	
	switch (data.Control){
		case "playPauseVideo" :
			if( playPauseSprite.src.substring(playPauseSprite.src.length - 8, playPauseSprite.src.length - 4) == "play"){//currnetly showing Play, show Pause
 				playPauseSprite.src = "../sprites/pause.png";
			}
			else{
				playPauseSprite.src = "../sprites/play.png";
			}
			break;
		case "seekSlider" : 
			seekSlider.value = data.seekSliderValue;
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
		case "fullScreenBtn":
			toggleFullScreen();
			break;
		case "reload":
			reload();
			break;
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
}

function toggleFullScreen(){
	
	if(fullScreenBtn.innerHTML=="Full Screen"){
		fullScreenBtn.innerHTML = "Exit Full Screen";
	}
	else{
		fullScreenBtn.innerHTML = "Full Screen";
	}
}