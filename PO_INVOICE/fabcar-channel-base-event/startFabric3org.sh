#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
LANGUAGE=${1:-"golang"}
# CC_SRC_PATH_PUBLIC=github.com/CCR-chaincode
CC_SRC_PATH_PRIVATE=github.com/chaincode_example_channel_base_event/go
if [ "$LANGUAGE" = "node" -o "$LANGUAGE" = "NODE" ]; then
	CC_SRC_PATH_PUBLIC=/opt/gopath/src/github.com/fabcar/node
fi

# clean the keystore
rm -rf ./hfc-key-store

# launch network; create channel and join peer to channel
cd ../basic-network-channel-base-event
./start.sh
# cd ../../basic-network
# ./start.sh
# Now launch the CLI container in order to install, instantiate chaincode
# and prime the ledger with our 10 cars
docker-compose -f ./docker-compose.yml up -d cli
# #===================== Chaincode is installed on org1 in publicchannel ===================== 
#  docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n ccrpublic -v 1.0 -p "$CC_SRC_PATH_PUBLIC" -l "$LANGUAGE"
# # #===================== Chaincode is installed on org2 in publicchannel ===================== 
#  docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_ADDRESS=peer0.org2.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"  cli peer chaincode install -n ccrpublic -v 1.0 -p "$CC_SRC_PATH_PUBLIC" -l "$LANGUAGE"
# # # #===================== Chaincode is installed on org3 in publicchannel ===================== 
# #  docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_ADDRESS=peer0.org3.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp"  cli peer chaincode install -n ccrpublic -v 1.0 -p "$CC_SRC_PATH_PUBLIC" -l "$LANGUAGE"
# # # #===================== Chaincode is installed on org4 in publicchannel =====================
# #  docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_ADDRESS=peer0.org4.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp"  cli peer chaincode install -n ccrpublic -v 1.0 -p "$CC_SRC_PATH_PUBLIC" -l "$LANGUAGE"
#  # #===================== Chaincode is instantiate in publicchannel =====================
#  docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050  -C publicchannel -n ccrpublic -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member','Org3MSP.member','Org4MSP.member')"

# #===================== Chaincode is installed on org1 in privatechannel1 ===================== 
 docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n fabcarevent -v 1.0 -p "$CC_SRC_PATH_PRIVATE" -l "$LANGUAGE"
# #===================== Chaincode is installed on org4 in privatechannel1 =====================
 docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_ADDRESS=peer0.org4.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp"  cli peer chaincode install -n fabcarevent -v 1.0 -p "$CC_SRC_PATH_PRIVATE" -l "$LANGUAGE"
# #===================== Chaincode is instantiate in privatechannel1 =====================
 docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050  -C privatechannel1 -n fabcarevent -l "$LANGUAGE" -v 1.0 -c '{"Args":[]}' -P "OR ('Org1MSP.member','Org4MSP.member')"

# #===================== Chaincode is installed on org2 in privatechannel2 ===================== 
 docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_ADDRESS=peer0.org2.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"  cli peer chaincode install -n fabcarevent -v 1.0 -p "$CC_SRC_PATH_PRIVATE" -l "$LANGUAGE"
# #===================== Chaincode is installed on org4 in privatechannel2 =====================
#  docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_ADDRESS=peer0.org4.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp"  cli peer chaincode install -n ccrprivate -v 1.0 -p "$CC_SRC_PATH_PRIVATE" -l "$LANGUAGE"
# #===================== Chaincode is instantiate in privatechannel2 =====================
 docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_ADDRESS=peer0.org2.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050  -C privatechannel2 -n fabcarevent -l "$LANGUAGE" -v 1.0 -c '{"Args":[]}' -P "OR ('Org2MSP.member','Org4MSP.member')"

# #===================== Chaincode is installed on org3 in publicchannel ===================== 
#  docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_ADDRESS=peer0.org3.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp"  cli peer chaincode install -n ccrprivate -v 1.0 -p "$CC_SRC_PATH_PRIVATE" -l "$LANGUAGE"
# #===================== Chaincode is instantiate in privatechannel3 =====================
#  docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_ADDRESS=peer0.org3.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050  -C privatechannel3 -n ccrprivate -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org3MSP.member','Org4MSP.member')"




printf "\nTotal setup execution time : $(($(date +%s) - starttime)) secs ...\n\n\n"
printf "Start by installing required packages run 'npm install'\n"
printf "Then run 'node enrollAdmin.js', then 'node registerUser'\n\n"
printf "The 'node invoke.js' will fail until it has been updated with valid arguments\n"
printf "The 'node query.js' may be run at anytime once the user has been registered\n\n"
