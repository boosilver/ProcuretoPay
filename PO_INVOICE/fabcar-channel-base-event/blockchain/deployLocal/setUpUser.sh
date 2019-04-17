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

cd ..

#user2
cd user2

# clean the keystore
rm -rf ./hfc-key-store

#enrollAdmin and registerUser
node enrollAdmin.js
node registerUser.js

cd ..

#user3
cd user3

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