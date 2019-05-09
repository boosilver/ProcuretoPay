'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Chaincode Invoke
 */

var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');

//
var fabric_client = new Fabric_Client();

// setup the fabric network
var channel = fabric_client.newChannel('privatechannel1');
var peer = fabric_client.newPeer('grpc://localhost:7051');
channel.addPeer(peer);
var channel_event_hub =channel.getChannelEventHub("localhost:7051")
var order = fabric_client.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);

//
var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);
var tx_id = null;
var fullmoney =0;
var evennumber;
// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
setInterval(function() {
  //console.log("Invoke!!")
  var money = getRandomInt(10)+1
  if (money % 2 != 0){
    evennumber = money+1
    fullmoney += evennumber
  } else{
    evennumber = money
    fullmoney += evennumber
  }
  
  console.log("Random money!! = "+ evennumber +" , sum Random money : "+fullmoney);
  invoke(evennumber)
}, 1000*5);

function invoke(money)
{
  Fabric_Client.newDefaultKeyValueStore({ path: store_path
  }).then((state_store) => {
    // assign the store to the fabric client
    fabric_client.setStateStore(state_store);
    var crypto_suite = Fabric_Client.newCryptoSuite();
    // use the same location for the state store (where the users' certificate are kept)
    // and the crypto store (where the users' keys are kept)
    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
    crypto_suite.setCryptoKeyStore(crypto_store);
    fabric_client.setCryptoSuite(crypto_suite);
  
    // get the enrolled user from persistence, this user will sign all requests
    return fabric_client.getUserContext('user1', true);
  }).then((user_from_store) => {
    if (user_from_store && user_from_store.isEnrolled()) {
     // console.log('Successfully loaded user1 from persistence');
      member_user = user_from_store;
    } else {
      throw new Error('Failed to get user1.... run registerUser.js');
    }
  
    // get a transaction id object based on the current user assigned to fabric client
    let tx_object = fabric_client.newTransactionID();
  
  // get the transaction ID string for later use
  var request = {
    //targets: let default to the peer assigned to the client
    chaincodeId: 'fabcarevent',
    fcn: 'invoke',
    args: ["a","b",money.toString()],
    chainId: 'privatechannel1',
    txId: tx_object
  };
  
  return channel.sendTransactionProposal(request);
  }).then((results) => {
  // a real application would check the proposal results
  //console.log('Successfully endorsed proposal to invoke chaincode');
  
  // start block may be null if there is no need to resume or replay
  let start_block = "100"
  
  let event_monitor = new Promise((resolve, reject) => {
  
      
  });
  let send_trans = channel.sendTransaction({proposalResponses: results[0], proposal: results[1]});
  
  return Promise.all([event_monitor, send_trans]);
  }).then((results) => {
  
    console.log(results)
  }).catch((err) => {
    console.error('Failed to invoke successfully :: ' + err);
  });   
}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

//console.log(getRandomInt(11));
// expected output: 0, 1 or 2

