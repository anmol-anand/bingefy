#include <iostream>
using namespace std;

int main(){

	freopen("ifconfig", "w", stdout);
	system("ifconfig");
	
	freopen("ifconfig", "r", stdin);
	freopen("inet.json", "w", stdout);
	
	string line;
	bool locaten0 = false, locaten5 = false, onedone = false;

	cout<<"{";
	getline(cin, line);
	do{
		if(line[0]!='\t'){ // new beginning
			if(line[0]=='e'&&line[1]=='n'&&line[2]=='0'){
				locaten0 = true;
				locaten5 = false;
			}
			else if(line[0]=='e'&&line[1]=='n'&&line[2]=='5'){
				locaten0 = false;
				locaten5 = true;
			}
			else{
				locaten0 = false;
				locaten5 = false;
			}
		}
		else if(locaten0 || locaten5){
			if(line[1]=='i'&&line[2]=='n'&&line[3]=='e'&&line[4]=='t'&&line[5]==' '){
				if(locaten5){
					if(onedone){
						cout<<"\",";
					}
					cout<<"\n\t\"ethernet\": \"";
					onedone = true;
				}
				else if(locaten0){
					if(onedone){
						cout<<"\",";
					}
					cout<<"\n\t\"wifi\": \"";
					onedone = true;
				}
				for(int i = 6; line[i]!=' '; i++){
					cout<<line[i];
				}
			}
		}
		getline(cin, line);
	}while(line.size());
	if(onedone){
		cout<<"\"\n}";
	}
	else{
		cout<<"\n}";
	}
}