#!/bin/bash

#user1
cd user1

# clean the keystore
rm -rf ./hfc-key-store

#enrollAdmin and registerUser
node enrollAdmin.js
node registerUser.js
node registerUser2.js
node registerUser3.js
node registerUser4.js
node registerUser5.js
node registerUser6.js
node registerUser7.js
node registerUser8.js

cd ..

#user2
cd user2

# clean the keystore
rm -rf ./hfc-key-store

#enrollAdmin and registerUser
node enrollAdmin.js
node registerUser.js

cd ..

#user4
cd user4

# clean the keystore
rm -rf ./hfc-key-store

#enrollAdmin and registerUser
node enrollAdmin.js
node registerUser.js