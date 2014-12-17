#!/bin/bash

#setting up the mongodb
if [[ "$MONGO_URL" != "" ]]; then
  #if the MONGO_URL provided via an env variable use that
  echo "[Mongo] Using MONGO_URL";
elif [[ "$MONGO_PORT_27017_TCP_ADDR" != "" ]]; then
  #if there is an mongo container linked, use it
  echo "[Mongo] Using a linked Mongo container"
  export MONGO_URL="mongodb://$MONGO_PORT_27017_TCP_ADDR/shinify"
else
  #otherwise start an local mongo server
  echo "[Mongo] Using local mongodb server(not recommended)"
  mongod &
  sleep 5
fi

#starting the app
cd shinify
node server.js
