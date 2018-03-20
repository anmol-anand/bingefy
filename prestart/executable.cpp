#include <stdlib.h>
#include <string>

using namespace std;

int main(int argc, char const *argv[]){

	string command, imageHeight = argv[1];

	system("./prestart/inet");
	system("./prestart/buildDirTree");

	command = "./prestart/thumbsGenerator " + imageHeight;
	system( &command[0]);
}