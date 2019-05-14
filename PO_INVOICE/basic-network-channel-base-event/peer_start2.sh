set -ev

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
CC_SRC_PATH=github.com/chaincode_example_channel_base_event/go

export FABRIC_START_TIMEOUT=10
#echo ${FABRIC_START_TIMEOUT}
sleep ${FABRIC_START_TIMEOUT}

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "golang"

# #===================== Chaincode is installed on org1 peer 1 ===================== 
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_ADDRESS=peer1.org1.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "golang"

# #===================== Chaincode is installed on org2 peer 0===================== 
docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_ADDRESS=peer0.org2.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "golang"

# #===================== Chaincode is installed on org2 peer 1 ===================== 
docker exec -e "CORE_PEER_LOCALMSPID=Org2MSP" -e "CORE_PEER_ADDRESS=peer1.org2.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "golang"

# #===================== Chaincode is installed on org3 peer 0 ===================== 
docker exec -e "CORE_PEER_LOCALMSPID=Org3MSP" -e "CORE_PEER_ADDRESS=peer0.org3.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "golang"

# #===================== Chaincode is installed on org4 peer0===================== 
docker exec -e "CORE_PEER_LOCALMSPID=Org4MSP" -e "CORE_PEER_ADDRESS=peer0.org4.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "golang"

#docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_ADDRESS=peer0.org1.example.com:7051" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabcar -l "golang" -v 1.0 -c '{"Args":[]}' -P "OR ('Org1MSP.member','Org2MSP.member')"








