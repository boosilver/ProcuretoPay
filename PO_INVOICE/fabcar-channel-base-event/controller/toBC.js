const logger = require('../utils/logger');
const keypair = require('../utils/generatekeypair');
const hash = require('../utils/hash');
const blockchain = require('../blockchain/service');
const NodeRSA = require('node-rsa');
const key = new NodeRSA({ b: 2048 }); //Key pair For Seller

//const UUID = require('../../utils/UUID');

//Chaincode functions names
const CreatePO = 'CreatePO'; //func
const CheckPO = 'CheckPO'; //func
const CheckInvoice = 'CheckInvoice'; //func
const CreateInvoice = 'CreateInvoice'; //func
const CheckUser = 'CheckUser'; //func
const INVOKE_ATTRIBUTES = ['devorgId']; //base
const StoreKey = 'StoreKey'; //func



var fs = require('fs');
var file = __dirname + '/config.json';
/**
 * Parsing parameters from the object received
 * from client and using default values
 * where needed/possible
 * @function
 * @param {object} unparsedAttrs - New ServiceRequest Object

 */
var day = new Date();

let private_key = key.exportKey('pkcs1-private-pem'); //format
// console.log('private_key : '+private_key)

let public_key = key.exportKey('pkcs1-public-pem'); //format
// console.log('public_key : '+public_key)

function getRandomInt() {
    return Math.floor(Math.random() * Math.random() * Math.random() * 1000000000000000000);
}

function ParseCreatePO(unparsedAttrs) { // for transfer 
    let functionName = '[toBC.CreatePO(unparsedAttrs)]';
    var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
    var SALT = getRandomInt();
    // console.log(SALT)
    // console.log("///////////////***************//////////////////////")
    return new Promise((resolve, reject) => {

        let parsedAttrs = {};
        //new kvs().putStore(inv_identity,unparsedAttrs)

        try {
            parsedAttrs = {
                TO: unparsedAttrs.TO || '',
                FORM: unparsedAttrs.FORM || '',
                TYPE: unparsedAttrs.TYPE || '',
                KEY: unparsedAttrs.KEY || '',
                VALUE: unparsedAttrs.VALUE || '',
                DATE: DATE,
                SALT: SALT,
            }
            resolve([
                parsedAttrs.TO.toString().toLowerCase(),
                parsedAttrs.FORM.toString().toLowerCase(),
                parsedAttrs.TYPE.toString().toUpperCase(),
                ("PO_" + parsedAttrs.KEY).toString(),
                parsedAttrs.VALUE.toString(),
                parsedAttrs.DATE.toString(),
                parsedAttrs.SALT.toString(),
            ])

        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}

function ParseCreateInvoice(unparsedAttrs) { // for transfer 
    let functionName = '[toBC.CreateInvoice(unparsedAttrs)]';

    return new Promise((resolve, reject) => {

        let parsedAttrs = {};
        var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
        //new kvs().putStore(inv_identity,unparsedAttrs)

        try {
            parsedAttrs = {
                TO: unparsedAttrs.TO || '',
                FORM: unparsedAttrs.FORM || '',
                TYPE: unparsedAttrs.TYPE || '',
                KEY: unparsedAttrs.KEY || '',
                VALUE: unparsedAttrs.VALUE || '',
                DATE: DATE,
            }
            resolve([
                parsedAttrs.TO.toString().toLowerCase(),
                parsedAttrs.FORM.toString().toLowerCase(),
                parsedAttrs.TYPE.toString().toUpperCase(),
                ("Invoice_" + parsedAttrs.KEY).toString(),
                parsedAttrs.VALUE.toString(),
                parsedAttrs.DATE.toString(),
            ])
        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}

function ParseCheckInvoice(unparsedAttrs) { //for cheak CheckBalance
    let functionName = '[toBC.ParseCheckInvoice(unparsedAttrs)]';

    return new Promise((resolve, reject) => {

        let parsedAttrs = {};
        //new kvs().putStore(inv_identity,unparsedAttrs)

        try {
            parsedAttrs = { //รับมาจาก json
                ID: unparsedAttrs.ID || '',
                USER: unparsedAttrs.USER || '',
            }
            resolve([
                ("Invoice_" + parsedAttrs.ID).toString(),
                parsedAttrs.USER.toString(),
            ])
        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}


function ParseCheckPO(unparsedAttrs) { //for cheak CheckBalance
    let functionName = '[toBC.ParseCheckPO(unparsedAttrs)]';

    return new Promise((resolve, reject) => {

        let parsedAttrs = {};
        //new kvs().putStore(inv_identity,unparsedAttrs)

        try {
            parsedAttrs = { //รับมาจาก json
                ID: unparsedAttrs.ID || '',
                USER: unparsedAttrs.USER || '',
            }
            resolve([
                (parsedAttrs.ID).toString(),
                parsedAttrs.USER.toString(),
            ])
        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}

function ParseKeyStore(WORLDSTATE_KEY, PUBLIC_KEY) { //for cheak CheckBalance
    let functionName = '[toBC.ParseKeyStore(unparsedAttrs)]';

    return new Promise((resolve, reject) => {

        let parsedAttrs = {};
        //new kvs().putStore(inv_identity,unparsedAttrs)

        try {
            parsedAttrs = { //รับมาจาก json
                WORLDSTATE_KEY: WORLDSTATE_KEY || '',
                PUBLIC_KEY: PUBLIC_KEY || '',
            }
            resolve([
                (parsedAttrs.WORLDSTATE_KEY).toString(),
                parsedAttrs.PUBLIC_KEY.toString(),
            ])
        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}

/**
 * Creates a new ServiceRequest object.
 * @class
 */
class toBC {

    /**
     * Represents a toBC.
     * @constructs toBC
     * @param {string} userName - Enrollment Id of the blockchain user
     */
    constructor(userName) {
        this.enrollID = userName;
    }


    /**
     * Create new serviceRequest.
     * @method
     * @param {object} unparsedAttrs - New ServiceRequest Object
     */

    CreatePO(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CreatePO(unparsedAttrs)]';
        // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
            var SALT = getRandomInt();
            var parsedAttrs = {
                TO: unparsedAttrs.TO || '',
                FORM: unparsedAttrs.FORM || '',
                TYPE: unparsedAttrs.TYPE || '',
                KEY: unparsedAttrs.KEY || '',
                VALUE: unparsedAttrs.VALUE || '',
                DATE: DATE,
                SALT: SALT,
            }
            console.log('parsedAttrs:' + parsedAttrs);

            // ParseCreatePO(unparsedAttrs).then((parsedAttrs) => {
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: CreatePO,
            };
            const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
            // console.log('ciphertext: ', ciphertext);
            let args = [ciphertext,
                parsedAttrs.KEY
            ];

            ///////////////////////////////////
            console.log('parsedAttrs:' + parsedAttrs);
            // const decrypted = key.decrypt(ciphertext, 'utf8');
            // console.log("-++-+--+-+-++---*-**/***/*//*/*/*---*-*//*/*-");
            // console.log('xxx: ', args);
            blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then((result) => {
                let resultParsed = result.result.toString('utf8');
                console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                console.log(resultParsed)
                resolve({
                    message: {
                        TO: parsedAttrs.TO,
                        FORM: parsedAttrs.FORM,
                        TYPE: parsedAttrs.TYPE,
                        KEY: parsedAttrs.KEY,
                        VALUE: parsedAttrs.VALUE,
                        DATE: parsedAttrs.DATE,
                    }
                });
            }).catch((e) => {
                logger.error(`${functionName}  ${e}`);
                reject(` ${e}`);
            });
        }).catch((e) => {
            logger.error(`${functionName} Failed to create new ServiceRequest (createServiceRequest() function failed): ${JSON.stringify(e)}`);
            // reject(`Failed to create new ServiceRequest (createServiceRequest() function failed): ${e}`);
        });

    }

    CreateInvoice(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CreateInvoice(unparsedAttrs)]';
        // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            ParseCreateInvoice(unparsedAttrs).then((parsedAttrs) => {
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CreateInvoice,
                    attrs: parsedAttrs
                };
                const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
                // console.log('ciphertext: ', ciphertext);
                let args = [ciphertext,
                    parsedAttrs[3]
                ];
                console.log('parsedAttrs:' + parsedAttrs);
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then((result) => {
                    // let resultParsed = JSON.parse(result.result.toString('utf8'));
                    // let resultParsed = result.result.toString('utf8'); 
                    resolve({
                        message: {
                            TO: parsedAttrs[0],
                            FORM: parsedAttrs[1],
                            TYPE: parsedAttrs[2],
                            KEY: parsedAttrs[3],
                            VALUE: parsedAttrs[4],
                            DATE: parsedAttrs[5],
                        }
                    });
                }).catch((e) => {
                    logger.error(`${functionName}  ${e}`);
                    reject(` ${e}`);
                });
            }).catch((e) => {
                logger.error(`${functionName} Failed to create new ServiceRequest (createServiceRequest() function failed): ${JSON.stringify(e)}`);
                reject(`Failed to create new ServiceRequest (createServiceRequest() function failed): ${e}`);
            });
        });
    }
    CheckInvoice(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CheckInvoice(unparsedAttrs)]';
        // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            let data
            ParseCheckInvoice(unparsedAttrs).then((parsedAttrs) => {
                console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CheckUser,
                    attrs: parsedAttrs
                };
                console.log(parsedAttrs);
                console.log("1111111111111111111111111111111111111111");
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    console.log(resultParsed.VALUE + "55555555555555555");
                    key.importKey(private_key, 'pkcs1-private-pem');
                    const decrypted = key.decrypt(resultParsed.VALUE, 'utf8');
                    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
                    console.log('decrypted: ', decrypted);
                    resolve({
                        message: { //ค่าที่ ปริ้นออกมาจาก json
                            User: parsedAttrs[1],
                            ID: parsedAttrs[0],
                            DD: decrypted,
                            // History : resultParsed.SHOW_HISTORY,
                            // Historyyy : result.result.toString(),
                        }
                    });
                }).catch((e) => {
                    logger.error(`${functionName}  ${e}`);
                    reject(` ${e}`);
                });
            }).catch((e) => {
                logger.error(`${functionName} Failed to create new ServiceRequest (createServiceRequest() function failed): ${JSON.stringify(e)}`);
                reject(`Failed to create new ServiceRequest (createServiceRequest() function failed): ${e}`);
            });
        });
    }
    CheckPO(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CheckPO(unparsedAttrs)]';
        // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            let data
            ParseCheckPO(unparsedAttrs).then((parsedAttrs) => {
                console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CheckUser,
                    attrs: parsedAttrs
                };
                console.log("1111111111111111111111111111111111111111");
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    console.log(resultParsed.VALUE + "55555555555555555");
                    // console.log(JSON.parse(result.VALUE)+"55555555555555555");
                    key.importKey(private_key, 'pkcs1-private-pem');
                    const decrypted = JSON.parse(key.decrypt(resultParsed.VALUE, 'utf8'));
                    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
                    console.log('decrypted: ', decrypted);
                    resolve({
                        message: { //ค่าที่ ปริ้นออกมาจาก json
                            User: parsedAttrs[1],
                            ID: parsedAttrs[0],
                            TO: decrypted.TO,
                            FORM: decrypted.FORM,
                            TYPE: decrypted.TYPE,
                            KEY: decrypted.KEY,
                            VALUE: decrypted.VALUE,
                            DATE: decrypted.DATE,
                            SALT: decrypted.SALT,
                            // History : resultParsed.SHOW_HISTORY,
                            // Historyyy : result.result.toString(),
                        }
                    });
                }).catch((e) => {
                    logger.error(`${functionName}  ${e}`);
                    reject(` ${e}`);
                });
            }).catch((e) => {
                logger.error(`${functionName} Failed to create new ServiceRequest (createServiceRequest() function failed): ${JSON.stringify(e)}`);
                reject(`Failed to create new ServiceRequest (createServiceRequest() function failed): ${e}`);
            });
        });
    }

    /**
 * GenerateKeyPair
 * @method post
 * @description - Generate key for company
 * @param {Object}req - CompanyInfo{Name,Role,ID}
 * @param {Object}res - KeyPair of each Company
 */
    GenerateKeyPair(CompanyInfo) {
        return new Promise((resolve, reject) => {

            let Public_key, Private_key = keypair.generatekeypair(CompanyInfo.Name)
            var WorldState_key = (CompanyInfo.ID + "|" + CompanyInfo.Role)
            console.log('Add local db');

            console.log('Add world state');
            let invokeObject = {};
            ParseKeyStore(CompanyInfo).then((parsedAttrs) => {
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: StoreKey,
                    attrs: parsedAttrs
                };
                console.log('parsedAttrs:' + parsedAttrs);
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then((result) => {
                    // let resultParsed = JSON.parse(result.result.toString('utf8'));
                    // let resultParsed = result.result.toString('utf8'); 
                    resolve({
                        message: {
                            CompanyName: CompanyInfo.Name,
                            WorldState_Key: WorldState_key,
                            Public_Key: Public_key,
                            Private_Key: Private_key


                        }
                    });
                }).catch((e) => {
                    logger.error(`${functionName}  ${e}`);
                    reject(` ${e}`);
                });



            })

        })



    }
}
module.exports = toBC;