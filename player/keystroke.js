function keystroke(event){

	var x = event.which;
	switch (x){
		case 32:
			event.preventDefault(); // preventing scroll-down
			trigger( {Control: "playPauseBtn"});
			break;
		case 70:
			trigger( {Control: "fullScreenFirst"});
			break;
		case 38:
			event.preventDefault(); // preventing scroll
			trigger( {Control: "volumeSlider", volumeSliderValue: Number(volumeSlider.value) + 1});
		 	break;
		case 40:
			event.preventDefault(); // preventing scroll
			trigger( {Control: "volumeSlider", volumeSliderValue: Number(volumeSlider.value) - 1});
			break;
		case 77:
			trigger( {Control: "muteBtn", volumeSliderValue: volumeSlider.value});
			break;
		case 39:
			event.preventDefault(); // preventing scroll
			trigger( {Control: "tenSecFwd"});
			break;
		case 37:
			event.preventDefault(); // preventing scroll
			trigger( {Control: "tenSecBwd"});
			break;
		case 67:
			trigger( {Control: "nextSubtrack"});
			break;
		default:
			if(48<=x && x<=57){
				trigger( {Control: "seekSlider", seekSliderValue: seekSlider.max*(x-48)/10});
			}
	}
}