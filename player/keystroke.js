function keystroke(event){

	var x = event.which;
	switch (x){
		case 32:
			trigger( {Control: "playPauseBtn"});
			break;
		case 70:
			trigger( {Control: "fullScreenBtn"});
			break;
		case 38:
			trigger( {Control: "volumeSlider", volumeSliderValue: Number(volumeSlider.value) + 1});
		 	break;
		case 40:
			trigger( {Control: "volumeSlider", volumeSliderValue: Number(volumeSlider.value) - 1});
			break;
		case 77:
			trigger( {Control: "muteBtn", volumeSliderValue: volumeSlider.value});
			break;
		case 39:
			trigger( {Control: "tenSecFwd"});
			break;
		case 37:
			trigger( {Control: "tenSecBwd"});
			break;
		default:
			if(48<=x && x<=57){
				trigger( {Control: "seekSlider", seekSliderValue: seekSlider.max*(x-48)/10});
			}
	}
}