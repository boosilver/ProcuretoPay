#!/bin/bash

#superuser
cd bankA

# clean the keystore
rm -rf ./hfc-key-store

#enrollAdmin and registerUser
node enrollAdmin.js
node registerUser.js

cd ..

#lotus
cd lotus

# clean the keystore
rm -rf ./hfc-key-store

#enrollAdmin and registerUser
node enrollAdmin.js
node registerUser.js

cd ..

#themall
cd themall

# clean the keystore
rm -rf ./hfc-key-store

#enrollAdmin and registerUser
node enrollAdmin.js
node registerUser.js

cd ..

#bank
cd bankB

# clean the keystore
rm -rf ./hfc-key-store

#enrollAdmin and registerUser
node enrollAdmin.js
node registerUser.js

# cd ..

# #user5
# cd user5

# # clean the keystore
# rm -rf ./hfc-key-store

# #enrollAdmin and registerUser
# node enrollAdmin.js
# node registerUser.js

# cd ..

# #user6
# cd user6

# # clean the keystore
# rm -rf ./hfc-key-store

# #enrollAdmin and registerUser
# node enrollAdmin.js
# node registerUser.js

