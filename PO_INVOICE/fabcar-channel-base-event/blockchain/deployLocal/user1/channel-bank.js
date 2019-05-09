
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
        console.log('bank');
    ChannelEventArray.forEach(ChannelEvent => {
       var ChainCodeEvent = ChannelEvent.registerChaincodeEvent(chaincodeid, chaincodeEventName,
        async(event, block_num, txnid, status) => {
           // console.log(event)
            // console.log(ChannelEvent.lastBlockNumber())
            // let bufferOriginal = Buffer.from(JSON.parse(JSON.stringify(event.payload)).data); 
            // let StringUnicod = bufferOriginal.toString('utf8')
            // var  money =parseInt(StringUnicod, 10);
            var results = JSON.parse(event.payload.toString('utf8'))
            
            // console.log(results)
            // console.log("KEY : "+results.KEY)
            // console.log("VALUE : "+results.VALUE+"\n   in block number : "+block_num)
            const key = new NodeRSA();
            // console.log(event.payload.toString('utf8'))
            const ciphertext = results.VALUE
            var keyprivate = await db.DBread("bank", "CompanyData", "bank")  
            key.importKey(keyprivate,'pkcs1-private-pem');

            
            try {
                const decrypted = key.decrypt(ciphertext, 'utf8');
                // var TO = JSON.parse(decrypted.TO)
                // console.log(TO)
                // console.log('decrypted: ', decrypted);


                var INFORMATION = JSON.parse(decrypted)
                console.log('decrypted: ', JSON.parse(decrypted)); 
                console.log(`-------------- End ${INFORMATION.TYPE}------------------`)
                var BORROW = JSON.parse(decrypted) //ค่าใบขอกู้ทั้งหมด
                // console.log(BORROW.INVOICE) /// ค่าใบอินวอย
                
                var publckey = await db.DBreadPublic("bank","CompanyData" , "bank")
                key.importKey(publckey, 'pkcs1-public-pem');
                // console.log(INFORMATION.TYPE)

                if (INFORMATION.TYPE == "Auto Verify") {
                    // console.log(INFORMATION.PO)
                    var PO = JSON.parse(INFORMATION.PO)
                    
                    ////////////////////////////////////////////
                    const Autociphertext = key.encrypt(PO, 'base64', 'utf8'); //เอ็นคลิบแต่ละครั้ง จะได้คนละตัว
                    // console.log(INFORMATION.BANK)
                    // console.log(PO.TYPE)
                    // console.log(PO.KEY)
                    // console.log(Autociphertext)
                    // console.log("--------------------")
                    var checkPO ="0"
                    try {
                        checkPO = await db.DBread(INFORMATION.BANK,PO.TYPE,PO.PO_KEY)
                      
                    } catch (error) {
                        // console.log(error)
                    }
                    // console.log(checkPO)
                    if (checkPO == "0"){
                        // console.log("aiaiaiaiai")
                        db.DBwrite(INFORMATION.BANK,PO.TYPE , PO.PO_KEY, Autociphertext)
                    }
                    // db.DBwrite(INFORMATION.BANK,PO.TYPE , PO.KEY, Autociphertext)
                    ////////////////////////////////////////////////
                }else {
                    const ciphertext2 = key.encrypt(BORROW.INVOICE, 'base64', 'utf8');
                // console.log(ciphertext2)
                
                var checkID = ""
                try {
                    // checkhash = await db.DBread(INFORMATION.BANK,INFORMATION.TYPE,results.KEY)
                    // checkID = await db.DBread(INFORMATION.TO, INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|`+INFORMATION.KEY)
                    checkID = await db.DBread(INFORMATION.BANK,INFORMATION.TYPE,`${INFORMATION.TYPE}_BODY|`+INFORMATION.BORROWKEY)  
                    // checkinvoice = await db.DBread(INFORMATION.BANK,INVOICE.INVOICE.TYPE,INVOICE.INVOICE.KEY)  
                } catch (error) {
                    // console.log(error)
                }
                 if (!checkID){
                    // db.DBwrite(INFORMATION.BANK,INFORMATION.TYPE , results.KEY, results.VALUE) //เก็บแฮด คู่ เอ็นคลิบ
                    db.DBwrite3(INFORMATION.BANK,INFORMATION.TYPE , `${INFORMATION.TYPE}_BODY|`+INFORMATION.BORROWKEY, INFORMATION,results.KEY) //เก็บข้อมูลใบกู้
                    db.DBwrite(INFORMATION.BANK,BORROW.INVOICE.TYPE , `${BORROW.INVOICE.TYPE}_BODY|`+BORROW.INVOICE.INVOICE_KEY, BORROW.INVOICE) // เก็บข้อมูลใบอินวอย
                    db.DBwrite(INFORMATION.BANK,"PO" , `PO_SALT|`+BORROW.INVOICE.PO_KEY, BORROW.SALT)
                }
                if (decrypted == all) {
                    console.log('--------- correct salt -----------')
                }
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


});
return "ORG1 Privatechannel1"
}).then((results) => {
    //message start block
	console.log(results)
}).catch((err) => {
	console.error('Failed to invoke successfully :: ' + err);
});
