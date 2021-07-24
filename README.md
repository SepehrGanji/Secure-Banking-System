# Secure Banking System
![version](https://img.shields.io/badge/version-1.0.0-important.svg)


### Introduction:
Project for the fundamentals of secure computing course at
Isfahan University of Technology.\
It is a simple banking system with database and symmetric
and asymmetric encryption for the client-server
message exchanges.


### Requirements:
* node.js
* npm
* Docker


### Running the project:
You can easily run client by running `run_client.sh`
and server by running `run_server.sh` files.\
If you must run the project manually, follow the instruction
bellow:\
1- Create a mongodb container and expose port 4000:
~~~~
docker run -d --rm -v sec_database:/data/db -p 4000:27017 mongo
~~~~
The -d flag is to run container in detach mode and
not blocking your shell, the --rm flag is to remove container
after it stops, the -v flag is for persisting data
with the help of named volumes.\
2- Installing the required packages
~~~~
npm install
~~~~
3- Running client and server
~~~~
npm run server
npm run client
~~~~
