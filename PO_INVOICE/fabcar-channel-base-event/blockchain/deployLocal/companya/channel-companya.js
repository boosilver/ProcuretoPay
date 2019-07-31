
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
const PackageUser = process.env.USER;

function DATA_NOT_FOUND(INFORMATION, T_ID) {
    var getkey = {
        FROM: "companya",
        BANK: INFORMATION.BANK,
        PO: "data not found",
        SALT2: INFORMATION.SALT2,
        T_ID: T_ID
    };
    new toBC("companya").AutoPushInBlockchain(getkey).then((result) => {
    })
        .catch((error) => {
            logger.error(`${functionName} Failed to transfer new Service Request: ${error}`);

        });

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
    return fabric_client.getUserContext('companya', true);
}).then((user_from_store) => {
    if (user_from_store && user_from_store.isEnrolled()) {
        console.log('Successfully loaded companya from persistence');
        member_user = user_from_store;
    } else {
        throw new Error('Failed to get companya.... run registerUser.js');
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
        console.log('companya');
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
                    var keyprivate = await db.DBreadprivate("companya", "CompanyData", "companya")   //// อันนี้ต้องทำของใครของมัน อันนี้ของโลตัส
                    // var pemFile = path.resolve(__dirname,`../../../controller/companya/private_key.pem`)
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

                        if (INFORMATION.TYPE == "reject") {
                            var ID = "PO_BODY|" + INFORMATION.PO_KEY
                            db.SetStatusWait(PackageUser, "PO", ID)
                            ///////////////////
                            var ID = "INVOICE_BODY|" + INFORMATION.INVOICE_KEY
                            db.SetStatusReject(PackageUser, "INVOICE", ID)
                            console.log(`-------------- End ${INFORMATION.TYPE}------------------`)
                        } else {
                            if (INFORMATION.TYPE == "reject_PO") {
                                var ID = "PO_BODY|" + INFORMATION.PO_KEY
                                db.SetStatusReject(PackageUser, "PO", ID)
                                console.log(`-------------- End ${INFORMATION.TYPE}------------------`)
                            } else {
                                //////////////
                                if (INFORMATION.TYPE == "reject_endorse") {
                                    if (INFORMATION.DOC_LOAN == "INVOICE") {
                                        ///////////////////////////////
                                        var ID = `LOAN_INVOICE_BODY|${PackageUser}|${INFORMATION.FROM}|` + INFORMATION.LOAN_KEY
                                        db.SetStatusWait(PackageUser, "LOAN_INVOICE", ID)
                                    } else {
                                        if (INFORMATION.DOC_LOAN == "PO") {
                                            console.log(`-------------- End 2------------------`)
                                            var ID = `LOAN_PO_BODY|${PackageUser}|${INFORMATION.FROM}|` + INFORMATION.LOAN_KEY
                                            db.SetStatusWait(PackageUser, "LOAN_PO", ID)
                                        } else {
                                            reject("ERROR.")
                                        }
                                    }
                                    /////////////////////////////////////
                                    var ID = `ENDORSE_LOAN_BODY|${PackageUser}|${INFORMATION.FROM}|${INFORMATION.DOC_LOAN}_` + INFORMATION.LOAN_KEY
                                    db.SetStatusReject(PackageUser, "ENDORSE_LOAN", ID)
                                    console.log(`-------------- End ${INFORMATION.TYPE}------------------`)
                                } else {
                                    ///////////////
                                    if (INFORMATION.TYPE == "reject_LOAN_INVOICE") {
                                        var ID = `LOAN_INVOICE_BODY|${PackageUser}|${INFORMATION.FROM}|` + INFORMATION.LOAN_KEY
                                        db.SetStatusReject(PackageUser, "LOAN_INVOICE", ID)
                                        console.log(`-------------- End ${INFORMATION.TYPE}------------------`)
                                    } else {
                                        if (INFORMATION.TYPE == "reject_LOAN_PO") {
                                            var ID = `LOAN_PO_BODY|${PackageUser}|${INFORMATION.FROM}|` + INFORMATION.LOAN_KEY
                                            db.SetStatusReject(PackageUser, "LOAN_PO", ID)
                                            console.log(`-------------- End ${INFORMATION.TYPE}------------------`)
                                        } else {
                                            if (INFORMATION.TYPE == "succes") {
                                                var ID = "INVOICE_BODY|" + INFORMATION.INVOICE_KEY
                                                db.SetStatusComplete(PackageUser, "INVOICE", ID)
                                            } else {
                                                if (INFORMATION.TYPE == "PO") {
                                                    DATABASE = {
                                                        TO: INFORMATION.TO.toLowerCase(),
                                                        FROM: INFORMATION.FROM.toLowerCase(),
                                                        TYPE: INFORMATION.TYPE,
                                                        PO_KEY: INFORMATION.PO_KEY,
                                                        ADDRESS: INFORMATION.ADDRESS,
                                                        EMAIL: INFORMATION.EMAIL,
                                                        TEL_NUMBER: INFORMATION.TEL_NUMBER,
                                                        TAX_ID: INFORMATION.TAX_ID,
                                                        DELIVERY_ADDRESS: INFORMATION.DELIVERY_ADDRESS,
                                                        PRODUCT: INFORMATION.PRODUCT.toLowerCase(),
                                                        NUM_PRODUCT: INFORMATION.NUM_PRODUCT,
                                                        VALUE: INFORMATION.VALUE,
                                                        PRICE: INFORMATION.PRICE,
                                                        VAT: INFORMATION.VAT,
                                                        TOTAL_PRICE: INFORMATION.TOTAL_PRICE,
                                                        DATE: INFORMATION.DATE,
                                                        DELIVERY_DATE: INFORMATION.DELIVERY_DATE,
                                                        PAYMENT: INFORMATION.PAYMENT,
                                                        DETAIL: INFORMATION.DETAIL,
                                                    }
                                                } else if (INFORMATION.TYPE == "INVOICE") {
                                                    DATABASE = {
                                                        TO: INFORMATION.TO.toLowerCase(),
                                                        FROM: INFORMATION.FROM.toLowerCase(),
                                                        TYPE: INFORMATION.TYPE,
                                                        INVOICE_KEY: INFORMATION.INVOICE_KEY,
                                                        PO_KEY: INFORMATION.PO_KEY,
                                                        ADDRESS: INFORMATION.ADDRESS,
                                                        EMAIL: INFORMATION.EMAIL,
                                                        TEL_NUMBER: INFORMATION.TEL_NUMBER,
                                                        TAX_ID: INFORMATION.TAX_ID,
                                                        DELIVERY_ADDRESS: INFORMATION.DELIVERY_ADDRESS,
                                                        PRODUCT: INFORMATION.PRODUCT.toLowerCase(),
                                                        NUM_PRODUCT: INFORMATION.NUM_PRODUCT,
                                                        VALUE: INFORMATION.VALUE,
                                                        PRICE: INFORMATION.PRICE,
                                                        VAT: INFORMATION.VAT,
                                                        TOTAL_PRICE: INFORMATION.TOTAL_PRICE,
                                                        DATE: INFORMATION.DATE,
                                                        DELIVERY_DATE: INFORMATION.DELIVERY_DATE,
                                                        PAYMENT: INFORMATION.PAYMENT,
                                                        DETAIL: INFORMATION.DETAIL,
                                                    }
                                                } else if (INFORMATION.TYPE == "ENDORSE_LOAN") {
                                                    DATABASE = {
                                                        TO: INFORMATION.TO.toLowerCase(),
                                                        BANK: INFORMATION.BANK.toLowerCase(),
                                                        TYPE: INFORMATION.TYPE,
                                                        DOC_LOAN: INFORMATION.DOC_LOAN.toLowerCase(),
                                                        LOAN_KEY: INFORMATION.LOAN_KEY,
                                                        PRICE_LOAN: INFORMATION.PRICE_LOAN,
                                                        DATE: INFORMATION.DATE,
                                                    }
                                                }
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
                                                        try {
                                                            var Verify = await db.DBread("companya", INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|` + INFORMATION.INVOICE_KEY)
                                                            var SALT = await db.DBread("companya", "PO", `PO_SALT|` + Verify.PO_KEY)
                                                        } catch (error) {
                                                            // DATA_NOT_FOUND(INFORMATION)
                                                        }
                                                        try {
                                                            if (INFORMATION.TO == Verify.TO && INFORMATION.FROM == Verify.FROM && INFORMATION.TYPE == Verify.TYPE
                                                                && INFORMATION.INVOICE_KEY == Verify.INVOICE_KEY && INFORMATION.PO_KEY == Verify.PO_KEY && INFORMATION.VALUE == Verify.VALUE && INFORMATION.DATE == Verify.DATE
                                                                && INFORMATION.SALT == SALT) { //// เช็คว่าที่ส่งมาตรงกับในดาต้าเบสไหม 
                                                                var INFO = "PO"
                                                                var PO = await db.DBread("companya", INFO, `${INFO}_BODY|` + INFORMATION.PO_KEY)
                                                                var SALT = await db.DBread("companya", INFO, `${INFO}_SALT|` + INFORMATION.PO_KEY)
                                                                var getkey = {
                                                                    FROM: "companya",
                                                                    BANK: INFORMATION.BANK,
                                                                    PO: PO,
                                                                    SALT: SALT,
                                                                    SALT2: INFORMATION.SALT2,
                                                                    T_ID: results.KEY

                                                                };
                                                                var functionName = "eventcompanya"
                                                                // console.log("+++ : "+companydata)
                                                                // console.log("+++"+getkey)
                                                                new toBC("companya").AutoPushInBlockchain(getkey).then((result) => {
                                                                })
                                                                    .catch((error) => {
                                                                        logger.error(`${functionName} Failed to transfer new Service Request: ${error}`);

                                                                    });
                                                            } else {
                                                                DATA_NOT_FOUND(INFORMATION, results.KEY)
                                                            }
                                                        } catch (error) {
                                                            DATA_NOT_FOUND(INFORMATION, results.KEY)
                                                        }
                                                    } else {
                                                        // console.log("---------PO---------------1")
                                                        /////////////PO
                                                        try {
                                                            var Verify = await db.DBread("companya", INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|` + INFORMATION.PO_KEY)
                                                            var SALT = await db.DBread("companya", "PO", `PO_SALT|` + Verify.PO_KEY)
                                                        } catch (error) {
                                                            // DATA_NOT_FOUND(INFORMATION)
                                                        }
                                                        try {
                                                            if (INFORMATION.TO == Verify.TO && INFORMATION.FROM == Verify.FROM && INFORMATION.TYPE == Verify.TYPE
                                                                && INFORMATION.INVOICE_KEY == Verify.INVOICE_KEY && INFORMATION.PO_KEY == Verify.PO_KEY && INFORMATION.VALUE == Verify.VALUE && INFORMATION.DATE == Verify.DATE
                                                                && INFORMATION.SALT == SALT) { //// เช็คว่าที่ส่งมาตรงกับในดาต้าเบสไหม 
                                                                var INFO = "INVOICE"
                                                                // console.log(Verify)
                                                                // console.log("---------********---------------3")
                                                                var getkey = {
                                                                    FROM: "companya",
                                                                    BANK: INFORMATION.BANK,
                                                                    PO: Verify,
                                                                    SALT: SALT,
                                                                    SALT2: INFORMATION.SALT2,
                                                                    T_ID: results.KEY

                                                                };
                                                                var functionName = "eventcompanya"
                                                                // console.log("+++ : "+companydata)
                                                                // console.log("+++"+getkey)
                                                                new toBC("companya").AutoPushInBlockchain(getkey).then((result) => {
                                                                })
                                                                    .catch((error) => {
                                                                        logger.error(`${functionName} Failed to transfer new Service Request: ${error}`);

                                                                    });
                                                            } else {
                                                                DATA_NOT_FOUND(INFORMATION, results.KEY)
                                                            }
                                                        } catch (error) {
                                                            DATA_NOT_FOUND(INFORMATION, results.KEY)
                                                        }
                                                    }
                                                } else if (!checkID) {
                                                    if (INFORMATION.TYPE == "PO") {
                                                        await db.DBwrite5(INFORMATION.TO.toLowerCase(), INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|` + INFORMATION.PO_KEY, DATABASE, results.KEY, "WAIT", INFORMATION.FROM.toLowerCase())
                                                        await db.DBwrite(INFORMATION.TO.toLowerCase(), INFORMATION.TYPE, `${INFORMATION.TYPE}_SALT|` + INFORMATION.PO_KEY, INFORMATION.SALT)
                                                    } else if (INFORMATION.TYPE == "INVOICE") {
                                                        await db.DBwrite5(INFORMATION.TO.toLowerCase(), INFORMATION.TYPE, `${INFORMATION.TYPE}_BODY|` + INFORMATION.INVOICE_KEY, DATABASE, results.KEY, "WAIT", INFORMATION.FROM.toLowerCase())
                                                        var ID = "PO_BODY|" + INFORMATION.PO_KEY
                                                        db.SetStatusComplete(INFORMATION.TO.toLowerCase(), "PO", ID)
                                                    } else if (INFORMATION.TYPE == "ENDORSE_LOAN") {
                                                        var Check_Endorse = ""
                                                        try {
                                                            Check_Endorse = await db.DBread(INFORMATION.TO.toLowerCase(), INFORMATION.TYPE, `ENDORSE_LOAN_BODY|${INFORMATION.TO.toLowerCase()}|${INFORMATION.BANK.toLowerCase()}|` + `${INFORMATION.DOC_LOAN}_${INFORMATION.LOAN_KEY}`)
                                                            var endorse_Status = await db.DBreadStatus(INFORMATION.TO.toLowerCase(), INFORMATION.TYPE, `ENDORSE_LOAN_BODY|${INFORMATION.TO.toLowerCase()}|${INFORMATION.BANK.toLowerCase()}|` + `${INFORMATION.DOC_LOAN}_${INFORMATION.LOAN_KEY}`)
                                                            console.log(endorse_Status)
                                                            console.log("/////")
                                                            if (endorse_Status == "REJECT") {
                                                                Check_Endorse = ""
                                                                console.log(INFORMATION)
                                                                db.DBdelete(INFORMATION.TO.toLowerCase(), INFORMATION.TYPE, `ENDORSE_LOAN_BODY|${INFORMATION.TO.toLowerCase()}|${INFORMATION.BANK.toLowerCase()}|` + `${INFORMATION.DOC_LOAN}_${INFORMATION.LOAN_KEY}`)
                                                                console.log("////sss/")
                                                            }
                                                        } catch (error) {
                                                            // console.log(error)
                                                        }
                                                        if (!Check_Endorse) {
                                                            await db.DBwrite5(INFORMATION.TO.toLowerCase(), INFORMATION.TYPE, `ENDORSE_LOAN_BODY|${INFORMATION.TO.toLowerCase()}|${INFORMATION.BANK.toLowerCase()}|` + `${INFORMATION.DOC_LOAN}_${INFORMATION.LOAN_KEY}`, DATABASE, results.KEY, "WAIT", INFORMATION.BANK.toLowerCase())
                                                            if (INFORMATION.DOC_LOAN.toUpperCase() == "INVOICE") {
                                                                var ID = `LOAN_INVOICE_BODY|${INFORMATION.TO.toLowerCase()}|${INFORMATION.BANK.toLowerCase()}|` + INFORMATION.LOAN_KEY || reject("LOAN_KEY name not found")
                                                                db.SetStatusComplete(PackageUser, "LOAN_INVOICE", ID)
                                                            } else {
                                                                if (INFORMATION.DOC_LOAN.toUpperCase() == "PO") {
                                                                    var ID = `LOAN_PO_BODY|${INFORMATION.TO.toLowerCase()}|${INFORMATION.BANK.toLowerCase()}|` + INFORMATION.LOAN_KEY || reject("KEY name not found")
                                                                    db.SetStatusComplete(PackageUser, "LOAN_PO", ID)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                if (decrypted == all) {
                                                    console.log('--------- correct salt -----------')
                                                }
                                            }
                                        }
                                    }
                                    ///////////////////

                                }
                                /////////// เอาใส่ if ให้ดี และทำในเดอะมอลต่อ

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
