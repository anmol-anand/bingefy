function initPlayPause(){
	colorPPB = '#000000';
	heightPPB = 20;
	transitionTimePPB = '0s';
	toPlay();
	transitionTimePPB = '0.15s';
}

function toPlay(){//show Pause
	lhalf.style.transition = 'all ' + transitionTimePPB;
	lhalf.style.position = 'relative';
	lhalf.style.left = '0px';
	lhalf.style.top = '0px';
	w = 0.38*heightPPB;
	lhalf.style.borderLeft = w.toString() + 'px solid ' + colorPPB;
	lhalf.style.borderTop = '0px solid transparent';
	lhalf.style.borderBottom = '0px solid transparent';
	lhalf.style.height = heightPPB.toString() + 'px';

	rhalf.style.transition = 'all ' + transitionTimePPB;
	rhalf.style.position = 'relative';
	w = 0.62*heightPPB;
	rhalf.style.left = w.toString() + 'px';
	rhalf.style.top = '-' + heightPPB.toString() + 'px';
	w = 0.38*heightPPB;
	rhalf.style.borderLeft = w.toString() + 'px solid ' + colorPPB;
	rhalf.style.borderTop = '0px solid transparent';
	rhalf.style.borderBottom = '0px solid transparent';
	rhalf.style.height = heightPPB.toString() + 'px';
}

function toPause(){//show Play
	lhalf.style.transition = 'all ' + transitionTimePPB;
	lhalf.style.position = 'relative';
	lhalf.style.left = '0px';
	lhalf.style.top = '0px';
	w = 0.5*heightPPB;
	lhalf.style.borderLeft = w.toString() + 'px solid ' + colorPPB;
	w = 0.25*heightPPB;
	lhalf.style.borderTop = w.toString() + 'px solid transparent';
	lhalf.style.borderBottom = w.toString() + 'px solid transparent';
	w = 0.5*heightPPB;
	lhalf.style.height = w.toString() + 'px';

	rhalf.style.transition = 'all ' + transitionTimePPB;
	rhalf.style.position = 'relative';
	w = 0.5*heightPPB;
	rhalf.style.left = w.toString() + 'px';
	w = 0.75*heightPPB;
	rhalf.style.top = '-' + w.toString() + 'px';
	w = 0.5*heightPPB;
	rhalf.style.borderLeft = w.toString() + 'px solid ' + colorPPB;
	w = 0.25*heightPPB;
	rhalf.style.borderTop = w.toString() + 'px solid transparent';
	w = 0.25*heightPPB;
	rhalf.style.borderBottom = w.toString() + 'px solid transparent';
	rhalf.style.height =  '0px';
}