#!/bin/bash
npm install
docker run -d --rm -v sec_database:/data/db -p 4000:27017 --name mongosec mongo
npm run server
