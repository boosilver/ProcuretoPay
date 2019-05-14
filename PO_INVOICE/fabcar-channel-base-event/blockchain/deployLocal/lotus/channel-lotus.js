
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
var peer = fabric_client.newPeer('grpc://localhost:8051');
var order = fabric_client.newOrderer('grpc://localhost:7050')
const NodeRSA = require('node-rsa');
const fs = require("fs")
const db = require('../../../utils/utilsdb')
const CheckUser = 'CheckUser';
const toBC = require('../../../controller/toBC')
// const blockchain = require('../blockchain/service');
const blockchain = require('../../service')
const INVOKE_ATTRIBUTES = ['devorgId'];
const logger = require('../../../utils/logger');
// setup the fabric network
// var channel = fabric_client.newChannel('privatechannel1');
//  var channel2 = fabric_client.newChannel('privatechannel2');
var channelArray = []
const chaincodeid = "fabcar"
const chaincodeEventName = "event"
blockchain.init();
var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:' + store_path);
var tx_id = null;

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
    return fabric_client.getUserContext('lotus', true);
}).then((user_from_store) => {
    if (user_from_store && user_from_store.isEnrolled()) {
        console.log('Successfully loaded lotus from persistence');
        member_user = user_from_store;
    } else {
        throw new Error('Failed to get lotus.... run registerUser.js');
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
            ChannelEventArray.push(channel.newChannelEventHub("localhost:8051"))
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
                        var DATABASE = {}
                        if (INFORMATION.TYPE == "PO") {
                            DATABASE = {
                                TO: INFORMATION.TO,
                                FORM: INFORMATION.FORM,
                                TYPE: INFORMATION.TYPE,
                                PO_KEY: INFORMATION.PO_KEY,
                                VALUE: INFORMATION.VALUE,
                                DATE: INFORMATION.DATE,
                            }
                        } else if (INFORMATION.TYPE == "INVOICE") {
                            DATABASE = {
                                TO: INFORMATION.TO,
                                FORM: INFORMATION.FORM,
                                TYPE: INFORMATION.TYPE,
                                INVOICE_KEY: INFORMATION.INVOICE_KEY,
                                PO_KEY: INFORMATION.PO_KEY,
                                VALUE: INFORMATION.VALUE,
                                DATE: INFORMATION.DATE,
                            }
                        } else if (INFORMATION.TYPE == "ENDORSE_LOAN") {
                            DATABASE = {
                                TO: INFORMATION.TO,
                                BANK: INFORMATION.BANK,
                                TYPE: INFORMATION.TYPE,
                                DOC_LOAN: INFORMATION.DOC_LOAN,
                                KEY: INFORMATION.KEY,
                                PRICE_BORROW: INFORMATION.PRICE_BORROW,
                                DATE: INFORMATION.DATE,
                            }
                        }
                        // console.log('decrypted bank: ', INFORMATION.BANK);
                        if (INFORMATION.VERIFY == "Verify") {
                            console.log(`-------------- End ${INFORMATION.VERIFY}------------------`)
                        } else console.log(`-------------- End ${INFORMATION.TYPE}------------------`)
                        var checkID = ""
                        if (!INFORMATION.INVOICE_KEY) {
                            try {
                                checkID = await db.DBread(INFORMATION.TO, INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|` + INFORMATION.PO_KEY)
                            } catch (error) {
                                // console.log(error)
                            }
                        } else {
                            try {
                                checkID = await db.DBread(INFORMATION.TO, INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|` + INFORMATION.INVOICE_KEY)
                            } catch (error) {
                                // console.log(error)
                            }
                        }
                        if (INFORMATION.VERIFY == "Verify") {
                            if (INFORMATION.TYPE == "INVOICE") {
                                ///////////INVOICE
                                var Verify = await db.DBread("lotus", INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|` + INFORMATION.INVOICE_KEY)
                                var SALT = await db.DBread("lotus", "PO", `PO_SALT|` + Verify.PO_KEY)
                                if (INFORMATION.TO == Verify.TO && INFORMATION.FORM == Verify.FORM && INFORMATION.TYPE == Verify.TYPE
                                    && INFORMATION.INVOICE_KEY == Verify.INVOICE_KEY && INFORMATION.PO_KEY == Verify.PO_KEY && INFORMATION.VALUE == Verify.VALUE && INFORMATION.DATE == Verify.DATE
                                    && INFORMATION.SALT == SALT) { //// เช็คว่าที่ส่งมาตรงกับในดาต้าเบสไหม 
                                    var INFO = "PO"
                                    var PO = await db.DBread("lotus", INFO, `${INFO}_BODY|` + INFORMATION.PO_KEY)
                                    var SALT = await db.DBread("lotus", INFO, `${INFO}_SALT|` + INFORMATION.PO_KEY)
                                    var getkey = {
                                        FORM: "lotus",
                                        BANK: INFORMATION.BANK,
                                        PO: PO,
                                        SALT: SALT,
                                        SALT2: INFORMATION.SALT2,
                                    };
                                    var functionName = "eventlotus"
                                    // console.log("+++ : "+companydata)
                                    // console.log("+++"+getkey)
                                    new toBC("lotus").AutoPushInBlockchain(getkey).then((result) => {
                                    })
                                        .catch((error) => {
                                            logger.error(`${functionName} Failed to transfer new Service Request: ${error}`);

                                        });
                                }
                            } else {
                                console.log("---------PO---------------1")
                                /////////////PO
                                var Verify = await db.DBread("lotus", INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|` + INFORMATION.PO_KEY)
                                var SALT = await db.DBread("lotus", "PO", `PO_SALT|` + Verify.PO_KEY)
                                if (INFORMATION.TO == Verify.TO && INFORMATION.FORM == Verify.FORM && INFORMATION.TYPE == Verify.TYPE
                                    && INFORMATION.INVOICE_KEY == Verify.INVOICE_KEY && INFORMATION.PO_KEY == Verify.PO_KEY && INFORMATION.VALUE == Verify.VALUE && INFORMATION.DATE == Verify.DATE
                                    && INFORMATION.SALT == SALT) { //// เช็คว่าที่ส่งมาตรงกับในดาต้าเบสไหม 
                                    var INFO = "INVOICE"
                                    console.log(Verify)
                                    console.log("---------********---------------3")
                                    var getkey = {
                                        FORM: "lotus",
                                        BANK: INFORMATION.BANK,
                                        PO: Verify,
                                        SALT: SALT,
                                        SALT2: INFORMATION.SALT2,
                                    };
                                    var functionName = "eventlotus"
                                    // console.log("+++ : "+companydata)
                                    // console.log("+++"+getkey)
                                    new toBC("lotus").AutoPushInBlockchain(getkey).then((result) => {
                                    })
                                        .catch((error) => {
                                            logger.error(`${functionName} Failed to transfer new Service Request: ${error}`);

                                        });
                                }
                            }
                        } else if (!checkID) {
                            if (INFORMATION.TYPE == "PO") {
                                await db.DBwrite3(INFORMATION.TO, INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|` + INFORMATION.PO_KEY, DATABASE, results.KEY)
                                await db.DBwrite(INFORMATION.TO, INFORMATION.TYPE, `${INFORMATION.TYPE}_SALT|` + INFORMATION.PO_KEY, INFORMATION.SALT)
                            } else if (INFORMATION.TYPE == "INVOICE") {
                                await db.DBwrite3(INFORMATION.TO, INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|` + INFORMATION.INVOICE_KEY, DATABASE, results.KEY)
                            } else if (INFORMATION.TYPE == "ENDORSE_LOAN") {
                                var Check_Endorse = ""
                                try {
                                    Check_Endorse = await db.DBread(INFORMATION.TO, INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|${INFORMATION.BANK}|` + `${INFORMATION.DOC_LOAN}_${INFORMATION.KEY}`)
                                } catch (error) {
                                    // console.log(error)
                                }
                                if (!Check_Endorse) {
                                    await db.DBwrite3(INFORMATION.TO, INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|${INFORMATION.BANK}|` + `${INFORMATION.DOC_LOAN}_${INFORMATION.KEY}`, DATABASE, results.KEY)
                                }
                            }
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
