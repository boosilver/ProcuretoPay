
const valueEvent = require('../util/valueEvent')

'use strict';
/*
* Copyright IBM Corp All RighChannelEvent Reserved
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
var ChannelEventArray = []
//
var fabric_client = new Fabric_Client();
var peer = fabric_client.newPeer('grpc://localhost:10051');
var order = fabric_client.newOrderer('grpc://localhost:7050')

// setup the fabric network
// var channel = fabric_client.newChannel('privatechannel1');
//  var channel2 = fabric_client.newChannel('privatechannel2');
var channelArray = []



var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);
var tx_id = null;

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

	// get the enrolled user from persistence, this user will sign all requesChannelEvent
	return fabric_client.getUserContext('user4', true);
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		console.log('Successfully loaded user4 from persistence');
		member_user = user_from_store;
	} else {
		throw new Error('Failed to get user4.... run registerUser.js');
	}

return 1
}).then((resulChannelEvent) => {
    fabric_client.queryChannels(peer).then((name)=>{
        //console.log(name.channels[0].channel_id)
        name.channels.forEach(channelName => {
            console.log(`${channelName.channel_id}`);
            channelArray.push(fabric_client.newChannel(channelName.channel_id))
            })
    channelArray.forEach(element => {
        element.addPeer(peer)
        element.addOrderer(order)
        ChannelEventArray.push(element.newChannelEventHub("localhost:10051"))
        })
    
        var total = 0 ;
        var count = 0 ;
    ChannelEventArray.forEach(ChannelEvent => {        
        ChannelEvent.registerBlockEvent( // this listener will be notificed of BLOCK INFO (all transactions)
                (block) => {
                   // console.log(JSON.stringify(block)); //PRINT FULL BLOCK INFO EVENT
                    //console.log(block); //PRINT BLOCK INFO ZOOM OUT

                    //@ LOOP (1) FOR ARRAY TRANSACTION IN BLOCK
                    block.data.data.forEach(dataInput => { 
                        let money = 0;
                        let countIn = 1;
                        //@ LOOP (2) FOR ARRAY ARGS INPUT IN TRANSACTION
                        dataInput.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args.forEach(element => {
                            
                            money = 0;
                            element = valueEvent.eventToJsonAttr(element); // Buffer to string
                            if (countIn % 4 == 0) { 
                                total += Number(element);
                                money = element;
                            }
                        //    console.log(element);
                        // console.log(total);
                            countIn++;
                        });
                        console.log("transfer  : " + money + "  ,   sum transfer    : " + total + "   in block number : " + block.header.number)
                        
                        count++;
            
                    });
            
                },
                (err) => {
                    ChannelEvent.unregisterBlockEvent(blockid);
                    console.log(util.format('Error %s! Transaction listener has been ' +
                        'deregistered for %s', err, ChannelEvent.getPeerAddr()));
                }
                //{startBlock:4}
            );
            ChannelEvent.connect(true);

});


});
return "ChannelEvent OK => "
}).then((resulChannelEvent) => {

	console.log(resulChannelEvent)
}).catch((err) => {
	console.error('Failed to invoke successfully :: ' + err);
});


// ChannelEvent.registerBlockEvent( // this listener will be notificed of all transactions
//     (block) => {
//        // console.log(JSON.stringify(block));
//        //console.log(block);
//         block.data.data.forEach(dataInput => {
//             // 	let args = [] ;
//             let money = 0;
//             let countIn = 1;
//             dataInput.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args.forEach(element => {
                
//                 money = 0;
//                 element = valueEvent.eventToJsonAttr(element);
//                 //console.log(countIn+":"+element);
//                 //args.push(args, element);
//                 if (countIn % 4 == 0) {
//                    // console.log("MONEY : "+element);
//                     total += Number(element);
//                     money = element;
//                 }
//                 countIn++;
//             });
//             console.log("transfer  : " + money + "  ,   sum transfer    : " + total + "   in block number : " + block.header.number)
//             //console.log("******* Invock ******"+count);
//             //console.log(args[count]);
//             count++;

//         });
//         //console.log("******* TOTAL ****** : " + total);

//     },
//     (err) => {
//         ChannelEvent.unregisterTxEvent('all');
//         //reportError(err);
//         console.log(util.format('Error %s! Transaction listener has been ' +
//             'deregistered for %s', err, ChannelEvent.getPeerAddr()));
//     },
//     //{startBlock:4}
// );
// ChannelEvent.connect(true);

