#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

docker-compose -f docker-compose.yml down

docker-compose -f docker-compose.yml up -d ca1.example.com ca2.example.com ca4.example.com  orderer.example.com peer0.org1.example.com peer0.org2.example.com peer0.org4.example.com 

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
#echo ${FABRIC_START_TIMEOUT}
sleep ${FABRIC_START_TIMEOUT}

# # Create the PublicChannel
# docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel create -o orderer.example.com:7050 -c publicchannel -f /etc/hyperledger/configtx/PublicChannel.tx
# # Join peer0.org1.example.com to the PublicChannel.
# docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel join -b publicchannel.block
# # fetch peer0.org2.example.com to the PublicChannel.
# docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org2.example.com/msp" peer0.org2.example.com peer channel fetch newest publicchannel.block --channelID publicchannel --orderer orderer.example.com:7050
# # Join peer0.org2.example.com to the PublicChannel.
# docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org2.example.com/msp" peer0.org2.example.com peer channel join -b publicchannel.block
# # fetch peer0.org3.example.com to the PublicChannel.
# # docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org3.example.com/msp" peer0.org3.example.com peer channel fetch newest publicchannel.block --channelID publicchannel --orderer orderer.example.com:7050
# # # Join peer0.org3.example.com to the PublicChannel.
# # docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org3.example.com/msp" peer0.org3.example.com peer channel join -b publicchannel.block
# # fetch peer0.org4.example.com to the PublicChannel.
# docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.example.com/msp" peer0.org4.example.com peer channel fetch newest publicchannel.block --channelID publicchannel --orderer orderer.example.com:7050
# # Join peer0.org4.example.com to the PublicChannel.
# docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.example.com/msp" peer0.org4.example.com peer channel join -b publicchannel.block

# update anchors peer in PublicChannel
# docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" peer0.org1.example.com  peer channel update -o orderer.example.com:7050 -c publicchannel -f /etc/hyperledger/configtx/PublicOrg1MSPanchors.tx 
# docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org2.example.com/msp" -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" peer0.org2.example.com  peer channel update -o orderer.example.com:7050 -c publicchannel -f /etc/hyperledger/configtx/PublicOrg2MSPanchors.tx 
# docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org3.example.com/msp" -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt" peer0.org3.example.com  peer channel update -o orderer.example.com:7050 -c publicchannel -f /etc/hyperledger/configtx/PublicOrg3MSPanchors.tx 
# docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.example.com/msp" -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt" peer0.org4.example.com  peer channel update -o orderer.example.com:7050 -c publicchannel -f /etc/hyperledger/configtx/PublicOrg4MSPanchors.tx 


# Create the PrivateChannel1
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel create -o orderer.example.com:7050 -c privatechannel1 -f /etc/hyperledger/configtx/PrivateChannel1.tx
# Join peer0.org1.example.com to the PrivateChannel1.
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" peer0.org1.example.com peer channel join -b privatechannel1.block
# fetch peer0.org4.example.com to the PrivateChannel1.
docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.example.com/msp" peer0.org4.example.com peer channel fetch newest privatechannel1.block --channelID privatechannel1 --orderer orderer.example.com:7050
# Join peer0.org4.example.com to the PrivateChannel1.
docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.example.com/msp" peer0.org4.example.com peer channel join -b privatechannel1.block

# update anchors peer in PrivateChannel1
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org1.example.com/msp" -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" peer0.org1.example.com  peer channel update -o orderer.example.com:7050 -c privatechannel1 -f /etc/hyperledger/configtx/PrivateOrg1MSPanchors1.tx 
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.example.com/msp" -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt" peer0.org4.example.com  peer channel update -o orderer.example.com:7050 -c privatechannel1 -f /etc/hyperledger/configtx/PrivateOrg4MSPanchors1.tx 


# Create the PrivateChannel2
docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org2.example.com/msp" peer0.org2.example.com peer channel create -o orderer.example.com:7050 -c privatechannel2 -f /etc/hyperledger/configtx/PrivateChannel2.tx
# Join peer0.org2.example.com to the PrivateChannel2.
docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org2.example.com/msp" peer0.org2.example.com peer channel join -b privatechannel2.block
# fetch peer0.org4.example.com to the PrivateChannel2.
docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.example.com/msp" peer0.org4.example.com peer channel fetch newest privatechannel2.block --channelID privatechannel2 --orderer orderer.example.com:7050
# Join peer0.org4.example.com to the PrivateChannel2.
docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.example.com/msp" peer0.org4.example.com peer channel join -b privatechannel2.block

# update anchors peer in PrivateChannel2
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org2.example.com/msp" -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" peer0.org2.example.com  peer channel update -o orderer.example.com:7050 -c privatechannel2 -f /etc/hyperledger/configtx/PrivateOrg2MSPanchors2.tx 
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.example.com/msp" -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt" peer0.org4.example.com  peer channel update -o orderer.example.com:7050 -c privatechannel2 -f /etc/hyperledger/configtx/PrivateOrg4MSPanchors2.tx 


# # Create the PrivateChannel3
# docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org3.example.com/msp" peer0.org3.example.com peer channel create -o orderer.example.com:7050 -c privatechannel3 -f /etc/hyperledger/configtx/PrivateChannel3.tx
# # Join peer0.org3.example.com to the PrivateChannel3.
# docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org3.example.com/msp" peer0.org3.example.com peer channel join -b privatechannel3.block
# # fetch peer0.org4.example.com to the PrivateChannel3.
# docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.example.com/msp" peer0.org4.example.com peer channel fetch newest privatechannel3.block --channelID privatechannel3 --orderer orderer.example.com:7050
# # Join peer0.org4.example.com to the PrivateChannel3.
# docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.example.com/msp" peer0.org4.example.com peer channel join -b privatechannel3.block

# # # update anchors peer in PrivateChannel3
# docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org3.example.com/msp" -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt" peer0.org3.example.com  peer channel update -o orderer.example.com:7050 -c privatechannel3 -f /etc/hyperledger/configtx/PrivateOrg3MSPanchors3.tx 
# docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@org4.example.com/msp" -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt" peer0.org4.example.com  peer channel update -o orderer.example.com:7050 -c privatechannel3 -f /etc/hyperledger/configtx/PrivateOrg4MSPanchors3.tx 
