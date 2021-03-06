#include <iostream>
#include <stdlib.h>

using namespace std;

string embedBackSlashes(string name){

	string ret = "";
	for(int i = 0; i<name.size(); i++){

		if( name[i]=='.' || name[i]=='/'){
			ret = ret + name[i];
		}
		else{
			ret = ret + "\\" + name[i];
		}
	}
	return ret;
}

int main(int argc, char const *argv[])
{
	freopen("./trailers/info.json", "r", stdin);
	freopen("./trailers/thumbs/thumbGenerator_log", "w", stdout);

	string line, videoPath, thumbPath, command, size = argv[1];
	int i;

	do{

		getline(cin, line);
		if( line[0]!='\t' || line[1]!='\t' || line[2]!='\t' ){
			continue;
		}
		videoPath = line.substr( 14, line.size() - 17);
		getline(cin, line);
		videoPath = videoPath + "/" + line.substr(12, line.size() - 13);
		
		thumbPath = "./trailers/thumbs/";
		for(i = 11; i < videoPath.size() - 4; i++){
			if(videoPath[i]=='/'){
				thumbPath = thumbPath + "__";
				continue;
			}
			thumbPath = thumbPath + videoPath[i];
		}
		thumbPath = thumbPath + ".jpg";

		command = "ffmpeg -ss 00:00:13 -i " + embedBackSlashes(videoPath) + " -vf scale=-1:" + size + " -vframes 1 " + embedBackSlashes(thumbPath);
		system( &command[0]);
	}while(line[0]!='}');
}