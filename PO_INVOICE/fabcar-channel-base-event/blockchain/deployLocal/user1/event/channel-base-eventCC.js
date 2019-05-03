const db = require('../../../utils/utilsdb')
const onewayfunction = require('../../../utils/hash')


'use strict';

/*
 * Chaincode Invoke
 */

var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');
var ChannelEventArray = []
//
var fabric_client = new Fabric_Client();
var peer = fabric_client.newPeer('grpc://localhost:7051');
var order = fabric_client.newOrderer('grpc://localhost:7050')
const NodeRSA = require('node-rsa');
const fs = require("fs")
const db = require('../../../utils/utilsdb')
// setup the fabric network
// var channel = fabric_client.newChannel('privatechannel1');
//  var channel2 = fabric_client.newChannel('privatechannel2');
var channelArray = []
const chaincodeid = "fabcarevent"
const chaincodeEventName = "event"

var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);
var tx_id = null;

var privatekey = ""
var companyname = "peet"
var collections = "CompanyData"
getprivate()

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
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
		console.log('Successfully loaded user1 from persistence');
		member_user = user_from_store;
	} else {
		throw new Error('Failed to get user1.... run registerUser.js');
	}

return 1
}).then((results) => {
    fabric_client.queryChannels(peer).then((name)=>{
        //console.log(name.channels[0].channel_id)
        name.channels.forEach(channelName => {
          //  console.log(`${element.channel_id}`);
            channelArray.push(fabric_client.newChannel(channelName.channel_id))
            })
    channelArray.forEach(channel => {
        channel.addPeer(peer)
        channel.addOrderer(order)
        ///localhost org1 peer0 
        ChannelEventArray.push(channel.newChannelEventHub("localhost:7051"))
        })
    ChannelEventArray.forEach(ChannelEvent => {
       var ChainCodeEvent = ChannelEvent.registerChaincodeEvent(chaincodeid, chaincodeEventName,
        async(event, block_num, txnid, status) => {
           // console.log(event)
            // console.log(ChannelEvent.lastBlockNumber())
            // let bufferOriginal = Buffer.from(JSON.parse(JSON.stringify(event.payload)).data); 
            // let StringUnicod = bufferOriginal.toString('utf8')
            // var  money =parseInt(StringUnicod, 10);
            var results = JSON.parse(event.payload.toString('utf8'))
            console.log("---------------------------------------")
            // console.log(results)
            // console.log("KEY : "+results.KEY)
            // console.log("VALUE : "+results.VALUE+"\n   in block number : "+block_num)
<<<<<<< HEAD:PO_INVOICE/fabcar-channel-base-event/blockchain/deployLocal/user1/channel-base-eventCC.js
            
            //decrypt
            const key = new NodeRSA();
            var identity = onewayfunction.hash(results)
            // var pemFile = path.resolve(__dirname,`../../../controller/LOTUS/private_key.pem`)
            // var keyprivate =fs.readFileSync(pemFile)
            key.importKey(privatekey,'pkcs1-private-pem');
            
            try {
                const decrypted = key.decrypt(results.VALUE, 'utf8');
                var salt = decrypted.salt
                var id = decrypted.id
                var hash = identity
                
                console.log(salt,id,hash,'+++++++++++++++++++++++++++++++')
                
=======
            const key = new NodeRSA();
            const ciphertext = results.VALUE
            var keyprivate = await db.DBread("lotus", "CompanyData", "lotus")   //// อันนี้ต้องทำของใครของมัน อันนี้ของโลตัส
            // var pemFile = path.resolve(__dirname,`../../../controller/LOTUS/private_key.pem`)
            // var keyprivate =fs.readFileSync(pemFile)
            key.importKey(keyprivate,'pkcs1-private-pem');

            
            try {
                const decrypted = key.decrypt(ciphertext, 'utf8');
                var TO = decrypted.TO
                console.log(TO)
>>>>>>> 53dee856e45d359e61e055136f3a83747bf168fe:PO_INVOICE/fabcar-channel-base-event/blockchain/deployLocal/user1/event/channel-base-eventCC.js
                console.log('decrypted: ', decrypted);
                if (decrypted == all) {
                    console.log('--------- correct salt -----------')
                }
            
            } catch (error) {
                // console.log(error)
            }
        },
        (err) => {
            ChannelEvent.unregisterChaincodeEvent(ChainCodeEvent);
            console.log(util.format('Error %s! ChaincodeEvent listener has been ' +
                    'deregistered for %s', err, ChannelEvent.getPeerAddr()));
        },
        {startBlock:1}
    );
    ChannelEvent.connect(true)
});

// var privatekey = "-----BEGIN RSA PRIVATE KEY-----
// MIIEowIBAAKCAQEAmczrQpS+iv0bo9lN3nW1UnlLFxK0/trrDPiPPmZBV7KSZ7cm
// M1lfNqwq/r513p21lqBBEW+XNfsrLHRzgSF7DK7aG3G5PCgcBL2SKYY0tGavTiyO
// IF0NIYyt+eKBXM4bU5DPeSP3FY338XRWyQGgnikc9Meo++qjmUBYvRCOw+ZhVus/
// XTzpAahuv0/uJFagEgg9z+UwXOqq1qnxSPA+Ao+6GQBWiO9EKNyUpLyaRGffUK19
// f6im4g5tZcEpbm1A222wmN9gAKtdQPBrWofU9CPEwtCdkpB7NNy7iIauWSK+Nsnx
// wF79j01wrgSOPRsxbAsU6ReY1uACXxbENcTglQIDAQABAoIBAHYrXm8vvh8oTf5c
// TloocoLFsw4tT2epaIP0zoqRIo9xItARhoZZmrB1JCvKxuGepxDuXFA7PyE4tHlZ
// mA2VXefmyKnhfQNdhfmWdiD1frVFWFhmH2V6WUZ3woyGngJiUdipIN/g5E1pYSHh
// 03RpjbE3wYnJhmrYY46yQ/wwJqEYxrF3IGJaM03AoCw2W2o970yx0ck5piNn2pmt
// wykj1tV8WM8zh4telHAr+ppnSUvLGIC5GncAkLQdUBAGEMqkhaZz1fdWva0+wkLp
// pHRnLoWvh1eOkuvE4ckI6eFBqtXZiJi6AZ+7bOZDHIEDfLAwj6Cos6kW6DkrPoIj
// 3Yf7K8ECgYEAx3Eppl6Rdmgywv8CuzHxDzKZp+ttdgZb/iU445tESfRLXF9+ALV6
// NUIsCYPjPEUEPQeopCY8uL1TXivhYPYhOwMU0Ji5h5UUdJIeRYm1/D22VwRqIyiQ
// J7q1zP2zvZqhdt8gzvUZSkE2rGEdhLHmzues+TRjnbSQXQLpY+jors0CgYEAxWpT
// 4rSSjEYffLrjtTIvGSQpezTO2cMXOIQMveKsJYv/qMwgAb398OGfs4i3Q+QOOzaJ
// Fo9ok4hq9Ho3d8Xh4z0IjkY43+87hXcR9yJWqAivuAkvuy67oh3x69toY6z2mubd
// J1cojkEf6gNOdSdJk23dN4bP2uF2VjxZd2Hk6OkCgYAYAsWy49u7V5wU4cKgasjM
// vZjGII/TD7zvgeexbzXveVvBSTXQPAj0dHz8wEYRMXXrKwrgiEHzM8ffpITDuZ4S
// jrJo0pozen0184l1cbjZH0zeeQeWKAIC5nWQslJ7VyxtNTur7tIWoHdGlYKKQSi6
// bCXk8quzhtOCfyE+CAJLWQKBgQCVJ9zxcNU4vtKTfvEEukHzkOr2d9PBnDEzNjIa
// VeUTCU/EzVVxe4ceNJphH264ENrfyjiRnxC4R13oEV9PU2d0NWz9cfkO2MXz9R7R
// xlQK6WU6e1Zg6tJBjrZ2KXQZu1kneD6ntqahtHrUaGMjCOgCSAPYLDdnfOnYBgji
// tkgp4QKBgBco9zj0n3tzsNSI3zhQ73ijT62vk217zrqongiebnKqhov24X9s7Bbq
// bfa3hdnuQiWClrvgKFQKdSnWCyb2sY24mqDJHlu9MCMRhub8AvFFzx3eXmjLUPU/
// 2wbdsd3mFzY97/HVVTEumVQ5Batv3RnK1Kz/AsVngJV18VeDlCi7
// -----END RSA PRIVATE KEY-----"

});
return "ORG1 Privatechannel1"
}).then((results) => {
    //message start block
	console.log(results)
}).catch((err) => {
	console.error('Failed to invoke successfully :: ' + err);
});

async function getprivate(){
    privatekey = await db.DBread(companyname,collections,companyname)
    
}
