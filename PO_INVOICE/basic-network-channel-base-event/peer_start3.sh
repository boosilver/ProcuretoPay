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
CC_SRC_PATH=github.com/chaincode_example_channel_base_event/go



# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
export FABRIC_START_TIMEOUT=10
#echo ${FABRIC_START_TIMEOUT}
sleep ${FABRIC_START_TIMEOUT}



docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_ADDRESS=peer0.org4.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabcar -l "golang" -v 1.0 -c '{"Args":[]}' -P "OR ('Org1MSP.member','Org2MSP.member','Org3MSP.member','Org4MSP.member')"








