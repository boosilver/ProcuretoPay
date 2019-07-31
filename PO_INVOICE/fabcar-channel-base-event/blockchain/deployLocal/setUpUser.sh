#!/bin/bash

#banka
cd banka

# clean the keystore
rm -rf ./hfc-key-store

#enrollAdmin and registerUser
node enrollAdmin.js
node registerUser.js

cd ..

#companya
cd companya

# clean the keystore
rm -rf ./hfc-key-store

#enrollAdmin and registerUser
node enrollAdmin.js
node registerUser.js

cd ..

#companyb
cd companyb

# clean the keystore
rm -rf ./hfc-key-store

#enrollAdmin and registerUser
node enrollAdmin.js
node registerUser.js

cd ..
#bankb
cd bankb

# clean the keystore
rm -rf ./hfc-key-store

#enrollAdmin and registerUser
node enrollAdmin.js
node registerUser.js





