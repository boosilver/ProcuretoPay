
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
const CheckUser = 'CheckUser';
// const blockchain = require('../blockchain/service');
// const blockchain = require('../../service')
const INVOKE_ATTRIBUTES = ['devorgId']; 
// setup the fabric network
// var channel = fabric_client.newChannel('privatechannel1');
//  var channel2 = fabric_client.newChannel('privatechannel2');
var channelArray = []
const chaincodeid = "fabcarevent"
const chaincodeEventName = "event"

var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:' + store_path);
var tx_id = null;

async function Get_Key(getkey, company) {
    console.log(getkey)
    console.log(company)
    console.log("++-+--+-+-+Getkey-+-+-+-+--+-+-+-")
    var result = await blockchain.query(getkey.enrollID, getkey.fcnname, company, INVOKE_ATTRIBUTES)
    // blockchain.query(getkey.enrollID, getkey.fcnname, company, INVOKE_ATTRIBUTES).then((result) => {
    let resultParsed = JSON.parse(result.result.toString('utf8'));
    console.log(resultParsed.PUBLIC_KEY)
    console.log("++-+--+-+-+Affter Getkey-+-+-+-+--+-+-+-")
    return (resultParsed.PUBLIC_KEY);
}


// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
Fabric_Client.newDefaultKeyValueStore({
    path: store_path
}).then((state_store) => {
    // assign the store to the fabric client
    fabric_client.setStateStore(state_store);
    var crypto_suite = Fabric_Client.newCryptoSuite();
    // use the same location for the state store (where the users' certificate are kept)
    // and the crypto store (where the users' keys are kept)
    var crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
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

    fabric_client.queryChannels(peer).then((name) => {
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
        console.log('LOTUS');
        ChannelEventArray.forEach(ChannelEvent => {
            var ChainCodeEvent = ChannelEvent.registerChaincodeEvent(chaincodeid, chaincodeEventName,
                async (event, block_num, txnid, status) => {
                    // console.log(event)
                    // console.log(ChannelEvent.lastBlockNumber())
                    // let bufferOriginal = Buffer.from(JSON.parse(JSON.stringify(event.payload)).data); 
                    // let StringUnicod = bufferOriginal.toString('utf8')
                    // var  money =parseInt(StringUnicod, 10);
                    var results = JSON.parse(event.payload.toString('utf8'))
                    // console.log("lllll"+results)
                    // console.log("KEY : "+results.KEY)
                    // console.log("VALUE : "+results.VALUE+"\n   in block number : "+block_num)
                    const key = new NodeRSA();
                    const ciphertext = results.VALUE
                    var keyprivate = await db.DBread("lotus", "CompanyData", "lotus")   //// อันนี้ต้องทำของใครของมัน อันนี้ของโลตัส
                    // var pemFile = path.resolve(__dirname,`../../../controller/LOTUS/private_key.pem`)
                    // var keyprivate =fs.readFileSync(pemFile)
                    key.importKey(keyprivate, 'pkcs1-private-pem');

                    try {
                        var decrypted = key.decrypt(ciphertext, 'utf8');
                        // var TO = JSON.parse(decrypted.TO)
                        // console.log(TO)
                        // console.log('decrypted: ', decrypted);
                        var INFORMATION = JSON.parse(decrypted)
                        console.log('decrypted: ', INFORMATION);
                        // console.log('decrypted bank: ', INFORMATION.BANK);
                        console.log(`-------------- End ${INFORMATION.TYPE}------------------`)
                        var checkhash = "0"
                        var checkID = "0"
                        try {
                            // console.log(INFORMATION.TO)
                            checkhash = await db.DBread(INFORMATION.TO, INFORMATION.TYPE, results.KEY)  /// จะทำเฉพาะตอนที่ไม่ใช่ verify 
                            checkID = await db.DBread(INFORMATION.TO, INFORMATION.TYPE, INFORMATION.KEY)
                        } catch (error) {
                            // console.log(error)
                        }
                        ///////////////
                        if (INFORMATION.VERIFY == "Verify") {
                            var Verifyhash = await db.DBread("lotus", INFORMATION.TYPE, INFORMATION.KEY)
                            var Verifycrypt = await db.DBread("lotus", INFORMATION.TYPE, Verifyhash)
                            // console.log(Verifyhash)
                            // var keyprivate = await db.DBread("lotus", "CompanyData", "lotus")
                            key.importKey(keyprivate, 'pkcs1-private-pem');
                            var decryptedlocal = key.decrypt(Verifycrypt, 'utf8'); /// invoice
                            var Infodecryp = JSON.parse(decryptedlocal)
                            // console.log(decryptedlocal) // invoice

                            if (INFORMATION.TO == Infodecryp.TO && INFORMATION.FORM == Infodecryp.FORM && INFORMATION.TYPE == Infodecryp.TYPE
                                && INFORMATION.KEY == Infodecryp.KEY &&INFORMATION.POKEY == Infodecryp.POKEY && INFORMATION.VALUE == Infodecryp.VALUE && INFORMATION.DATE == Infodecryp.DATE
                                && INFORMATION.SALT == Infodecryp.SALT) { //// เช็คว่าที่ส่งมาตรงกับในดาต้าเบสไหม
                                // console.log("kuy")
                                var INFO
                                if (INFORMATION.TYPE == "INVOICE") {
                                    INFO = "PO"
                                } else INFO = "INVOICE"
                                var hash_PO = await db.DBread("lotus", INFO, Infodecryp.POKEY) ///ด้านหลังต้องใช้เลขใบ PO
                                var crypt_PO = await db.DBread("lotus", INFO, hash_PO)
                                decryptedlocal = key.decrypt(crypt_PO, 'utf8'); /// PO
                                // console.log("PO_INFO : "+decryptedlocal) // po


                                // var getkey = {
                                //     enrollID: "lotus",
                                //     fcnname: CheckUser,
                    
                                // };
                                // var companydata = [INFORMATION.BANK,
                                //     "lotus",
                                // ]
                                // // toBC.CreatePO(getkey)
                                // var Publickey = await Get_Key(getkey, companydata)
                                // console.log("kuy = "+Publickey)
                                /// ลงบล็อค invoke
                            }
                        } else
                            if ((checkhash && checkID) == "0") {
                                db.DBwrite(INFORMATION.TO, INFORMATION.TYPE, results.KEY, results.VALUE)
                                db.DBwrite(INFORMATION.TO, INFORMATION.TYPE, INFORMATION.KEY, results.KEY)
                            }
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
                { startBlock: 1 }
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
