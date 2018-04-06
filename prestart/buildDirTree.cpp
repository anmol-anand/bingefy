#include <dirent.h>
#include <string.h>
#include <iostream>
#include <vector>

using namespace std;

// vector<pair<string, string> >

bool first = true;

bool cmp(const char* a, const char* b){
	
	int i = 0;
	while( a[i]!='\0' && b!='\0'){
		if(a[i]!=b[i])return false;
		i++;
	}
	if( a[i]=='\0' && b[i]=='\0'){
		return true;
	}
	return false;
}

bool endingIn(string Aa, string a){

	int i = Aa.size(), j = a.size();
	if(i < j){
		return false;
	}
	while(j>=0){
		if(Aa[i]!=a[j]){
			return false;
		}
		i--; j--;
	}
	return true;
}

void exploit( string folder, string name){

	string path = folder + "/" + name;

	DIR* dir;
	struct dirent* ent;

	vector<string> toChronolog;

	if( ( dir = opendir( &path[0]))!=NULL){

		toChronolog.clear();
		while((ent = readdir (dir)) != NULL){
			if( cmp( ent->d_name, ".") || cmp( ent->d_name, "..")){
				continue;
			}
			// exploit( path, ent->d_name);
			toChronolog.push_back(ent->d_name);
		}
		sort(toChronolog.begin(), toChronolog.end());
		for(int i = 0; i<toChronolog.size(); i++){
			exploit(path, toChronolog[i]);
		}
		closedir(dir);
	}
	else{ // This is a file

		if( endingIn( name, ".mp4")){
			
			if(first){
				first = false;
			}
			else{
				cout<<",";
			}
			cout<<"\n\t\t{ \n\t\t\t\"folder\": \""<<folder<<"\", \n\t\t\t\"name\": \""<<name<<"\"\n\t\t}";
		}
	}
}

int main(){

	freopen("./trailers/info.json", "w", stdout);
	cout<<"{\n\t\"trailers\": [";

	exploit( ".", "trailers");

	cout<<"\n\t]\n}";
}