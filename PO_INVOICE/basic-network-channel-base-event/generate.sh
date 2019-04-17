#!/bin/sh
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
export PATH=$GOPATH/src/github.com/hyperledger/fabric/build/bin:${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
CHANNEL_NAME=publicchannel
CHANNEL_NAME1=privatechannel1
CHANNEL_NAME2=privatechannel2
CHANNEL_NAME3=privatechannel3

# remove previous crypto material and config transactions
rm -fr config/*
rm -fr crypto-config/*

# generate crypto material
cryptogen generate --config=./crypto-config.yaml
if [ "$?" -ne 0 ]; then
  echo "Failed to generate crypto material..."
  exit 1
fi

# generate genesis block for orderer
configtxgen -profile OrdererGenesis -outputBlock ./config/genesis.block
if [ "$?" -ne 0 ]; then
  echo "Failed to generate orderer genesis block..."
  exit 1
fi

# generate channel configuration transaction
configtxgen -profile PublicChannel -outputCreateChannelTx ./config/PublicChannel.tx -channelID $CHANNEL_NAME
if [ "$?" -ne 0 ]; then
  echo "Failed to generate channel configuration transaction..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile PublicChannel -outputAnchorPeersUpdate ./config/PublicOrg1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org1MSP..."
  exit 1
fi
# generate anchor peer transaction
configtxgen -profile PublicChannel -outputAnchorPeersUpdate ./config/PublicOrg2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org2MSP..."
  exit 1
fi
configtxgen -profile PublicChannel -outputAnchorPeersUpdate ./config/PublicOrg3MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org3MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org3MSP..."
  exit 1
fi
# generate anchor peer transaction
configtxgen -profile PublicChannel -outputAnchorPeersUpdate ./config/PublicOrg4MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org4MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org4MSP..."
  exit 1
fi


configtxgen -profile PrivateChannel1 -outputCreateChannelTx ./config/PrivateChannel1.tx -channelID $CHANNEL_NAME1
if [ "$?" -ne 0 ]; then
  echo "Failed to generate channel configuration transaction..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile PrivateChannel1 -outputAnchorPeersUpdate ./config/PrivateOrg1MSPanchors1.tx -channelID $CHANNEL_NAME1 -asOrg Org1MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org1MSP..."
  exit 1
fi
# generate anchor peer transaction
configtxgen -profile PrivateChannel1 -outputAnchorPeersUpdate ./config/PrivateOrg4MSPanchors1.tx -channelID $CHANNEL_NAME1 -asOrg Org4MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org4MSP..."
  exit 1
fi


configtxgen -profile PrivateChannel2 -outputCreateChannelTx ./config/PrivateChannel2.tx -channelID $CHANNEL_NAME2
if [ "$?" -ne 0 ]; then
  echo "Failed to generate channel configuration transaction..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile PrivateChannel2 -outputAnchorPeersUpdate ./config/PrivateOrg2MSPanchors2.tx -channelID $CHANNEL_NAME2 -asOrg Org2MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org1MSP..."
  exit 1
fi
# generate anchor peer transaction
configtxgen -profile PrivateChannel2 -outputAnchorPeersUpdate ./config/PrivateOrg4MSPanchors2.tx -channelID $CHANNEL_NAME2 -asOrg Org4MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org4MSP..."
  exit 1
fi


configtxgen -profile PrivateChannel3 -outputCreateChannelTx ./config/PrivateChannel3.tx -channelID $CHANNEL_NAME3
if [ "$?" -ne 0 ]; then
  echo "Failed to generate channel configuration transaction..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile PrivateChannel3 -outputAnchorPeersUpdate ./config/PrivateOrg3MSPanchors3.tx -channelID $CHANNEL_NAME3 -asOrg Org3MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org1MSP..."
  exit 1
fi
# generate anchor peer transaction
configtxgen -profile PrivateChannel3 -outputAnchorPeersUpdate ./config/PrivateOrg4MSPanchors3.tx -channelID $CHANNEL_NAME3 -asOrg Org4MSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for Org4MSP..."
  exit 1
fi

