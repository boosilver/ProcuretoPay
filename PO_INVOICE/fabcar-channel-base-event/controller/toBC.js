var crypto = require('crypto');
// var crypto = require('crypto');
const logger = require('../utils/logger');
const blockchain = require('../blockchain/service');
const fs = require("fs")
const path = require('path')
//const UUID = require('../../utils/UUID');
const NodeRSA = require('node-rsa');
// const key = new NodeRSA({b: 2048});
//Chaincode functions names
const CreatePO = 'CreatePO'; //func
const CheckPO = 'CheckPO'; //func
const CheckInvoice = 'CheckInvoice'; //func
const CreateInvoice = 'CreateInvoice'; //func
const CheckUser = 'CheckUser'; //func
const INVOKE_ATTRIBUTES = ['devorgId']; //base
var file = __dirname + '/config.json';
var MongoClient = require('mongodb').MongoClient; //libmongoDB
var url = "mongodb://localhost:27017/mydb";
const keypair = require('../utils/generatekeypair');
const hash = require('../utils/hash');
const StoreKey = 'StoreKey'; //func
const db = require('../utils/utilsdb')



/**
 * Parsing parameters from the object received
 * from client and using default values
 * where needed/possible
 * @function
 * @param {object} unparsedAttrs - New ServiceRequest Object

 */
var day = new Date();

function getRandomInt() {
    return Math.floor(Math.random() * Math.random() * Math.random() * 1000000000000000000);
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
    let functionName = '[toBC.ParseKeyStore(WORLDSTATE_KEY, PUBLIC_KEY)]';

    return new Promise((resolve, reject) => {

        let parsedAttrs = {};
        //new kvs().putStore(inv_identity,unparsedAttrs)

        try {
            parsedAttrs = { //รับมาจาก json
                WORLDSTATE_KEY: WORLDSTATE_KEY || '',
                PUBLIC_KEY: PUBLIC_KEY || '',
            }
            resolve([
                parsedAttrs.WORLDSTATE_KEY.toString(),
                parsedAttrs.PUBLIC_KEY.toString()
            ])
        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}
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
        return new Promise(async(resolve, reject) => {
            //เช็คว่าค่าจากโพสแมนมีค่าจริงๆ ถ้าค่าว่างต้องโชว error (เช็คก่อนเจน)
            //เอาคีย์ไปเช็คในดาต้า PO number, 
            let invokeObject = {};
            let getkey = {};
            let companydata = {};
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
            var SALT = getRandomInt();
            var parsedAttrs = {
                TO: unparsedAttrs.TO || reject("Company name not found"),
                FORM: unparsedAttrs.FORM || '', //ไปอ่านไฟล์คอนฟิกของบริษัทเราเอง 
                TYPE: unparsedAttrs.TYPE || 'AA', // API เจนเอง
                KEY: unparsedAttrs.KEY || '',
                VALUE: unparsedAttrs.VALUE || '',
                DATE: DATE,
                SALT: SALT,
            }
            var COMPANY = unparsedAttrs.COMPANY // อันเดียวกีับ to แก้ให้เป็นอันเดียวกัน
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: CreatePO,
            };
            ///////////////
            getkey = {
                enrollID: self.enrollID,
                fcnname: CheckUser,

            };
            companydata = [COMPANY,
                unparsedAttrs.FORM,
            ]
            var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
            const key = new NodeRSA();
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
            console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
            console.log('HASH Ciphertext Complete!!! : ', hash)
            let args = [hash, ciphertext
            ];
            blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then((result) => {
                let resultParsed = result.result.toString('utf8');
                console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                console.log(resultParsed)
                console.log(ciphertext);
                var collections = "PO"
                db.DBwrite(COMPANY,collections,hash,ciphertext)
                db.DBwrite(COMPANY,collections,unparsedAttrs.KEY,hash)
                
                // MongoClient.connect(url, function (err, db) { //connect DB url
                //     if (err) throw err;
                //     var dbo = db.db("PO");
                //     dbo.createCollection("MyData", function (err, res) { //create collection 
                //         if (err) throw err;
                //         console.log("Collection created!");
                //         var myobj = [
                //             { _id: hash, TO: ciphertext }
                //         ];
                //         dbo.collection("MyData").insertMany(myobj, function (err, res) { //insertMany
                //             if (err) throw err;
                //             console.log("Number of documents inserted: " + res.insertedCount);
                //             db.close();
                //         });
                //     });
                // })

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
            }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
                logger.error(`${functionName}  ${e}`);
                reject(` ${e}`);
            });
        })

    }

    CreateInvoice(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CreateInvoice(unparsedAttrs)]';
        // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise(async(resolve, reject) => {
            let invokeObject = {};
            let getkey = {};
            let companydata = {};
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
            var COMPANY = unparsedAttrs.COMPANY
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: CreatePO,
            };
            getkey = {
                enrollID: self.enrollID,
                fcnname: CheckUser,

            };
            companydata = [COMPANY,
                unparsedAttrs.FORM,
            ]
            var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
            const key = new NodeRSA();
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
            console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
            console.log('HASH Ciphertext Complete!!! : ', hash)
            let args = [hash, ciphertext
            ];
            blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then((result) => {
                let resultParsed = result.result.toString('utf8');
                console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                console.log(resultParsed)
                console.log(ciphertext);
                var collections = "INVOICE"
                db.DBwrite(COMPANY,collections,hash,ciphertext)
                db.DBwrite(COMPANY,collections,unparsedAttrs.KEY,hash)
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
        })
    }
    Checkkey(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.Checkkey(unparsedAttrs)]';
        // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            let data
            var COMPANY = unparsedAttrs.COMPANY
            ParseCheckPO(unparsedAttrs).then((parsedAttrs) => {
                console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CheckUser,
                    attrs: parsedAttrs
                };
                console.log("1111111111111111111111111111111111111111");
                console.log(invokeObject);
                console.log(invokeObject.attrs);
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    console.log(resultParsed.VALUE + "55555555555555555");

                    resolve({
                        message: { //ค่าที่ ปริ้นออกมาจาก json
                            User: parsedAttrs[1],
                            ID: parsedAttrs[0],
                            VALUE: resultParsed,

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
    // CheckInvoice(unparsedAttrs) {
    //     let self = this;
    //     let functionName = '[toBC.CheckPO(unparsedAttrs)]';
    //     // self.uUID = UUID.generateUUID_RFC4122();

    //     return new Promise((resolve, reject) => {

    //         let invokeObject = {};
    //         let data
    //         var COMPANY = unparsedAttrs.COMPANY
    //         ParseCheckPO(unparsedAttrs).then((parsedAttrs) => {
    //             console.log('parsedAttrs:' + parsedAttrs);
    //             invokeObject = {
    //                 enrollID: self.enrollID,
    //                 fcnname: CheckUser,
    //                 attrs: parsedAttrs
    //             };
    //             console.log("1111111111111111111111111111111111111111");
    //             blockchain.query(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
    //                 let resultParsed = JSON.parse(result.result.toString('utf8'));
    //                 console.log(resultParsed.VALUE + "55555555555555555");
    //                 // console.log(JSON.parse(result.VALUE)+"55555555555555555");
    //                 const key = new NodeRSA();
    //                 var pemFile = path.resolve(__dirname, `./${COMPANY}/private_key.pem`)
    //                 var keyprivate = fs.readFileSync(pemFile)
    //                 key.importKey(keyprivate, 'pkcs1-private-pem');
    //                 const decrypted = JSON.parse(key.decrypt(resultParsed.VALUE, 'utf8'));
    //                 console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
    //                 console.log('decrypted: ', decrypted);
    //                 resolve({
    //                     message: { //ค่าที่ ปริ้นออกมาจาก json
    //                         User: parsedAttrs[1],
    //                         ID: parsedAttrs[0],
    //                         TO: decrypted.TO,
    //                         FORM: decrypted.FORM,
    //                         TYPE: decrypted.TYPE,
    //                         KEY: decrypted.KEY,
    //                         VALUE: decrypted.VALUE,
    //                         DATE: decrypted.DATE,
    //                         SALT: decrypted.SALT,
    //                         // History : resultParsed.SHOW_HISTORY,
    //                         // Historyyy : result.result.toString(),
    //                     }
    //                 });
    //             }).catch((e) => {
    //                 logger.error(`${functionName}  ${e}`);
    //                 reject(` ${e}`);
    //             });
    //         }).catch((e) => {
    //             logger.error(`${functionName} Failed to create new ServiceRequest (createServiceRequest() function failed): ${JSON.stringify(e)}`);
    //             reject(`Failed to create new ServiceRequest (createServiceRequest() function failed): ${e}`);
    //         });
    //     });
    // }
    CheckPO(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CheckPO(unparsedAttrs)]';
        // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {
            
            let invokeObject = {};
            var hash
            var COMPANY = unparsedAttrs.COMPANY
            let args =[];
            var companydata =[];
            ParseCheckPO(unparsedAttrs).then(async(parsedAttrs) => {
                var id = unparsedAttrs.ID
                var collections = "PO"
                console.log('hash:+++++++++++++++++++++++++++++++++++++++++++++++');
                hash = await db.DBread(COMPANY,collections,id)
                console.log('hash:+++++++++++++++++++++++++++++++++++++++++++++++');
                console.log('hash:' + hash);
                console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CheckUser,
                };
                args = [
                    hash,
                    unparsedAttrs.USER,
                ]
                companydata = [
                    COMPANY,
                    unparsedAttrs.USER
                ]
                console.log("1111111111111111111111111111111111111111"+args);
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
                    console.log("toBC");
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    console.log(resultParsed.PO_ID + "55555555555555555");
                    const key = new NodeRSA();
                    ///ดึงไพรเวทจากดาต้าเบส
                    // var pemFile = path.resolve(__dirname, `./${COMPANY}/private_key.pem`)
                    // var keyprivate = fs.readFileSync(pemFile)
                    var publickey = await Get_Key(invokeObject,companydata)
                    var keyprivate = await db.DBread(COMPANY,"CompanyData",publickey)
                    console.log(keyprivate);
                    key.importKey(keyprivate, 'pkcs1-private-pem');
                    const decrypted = JSON.parse(key.decrypt(resultParsed.PO_ID, 'utf8'));
                    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
                    console.log('decrypted: ', decrypted);
                    resolve({
                        message: { //ค่าที่ ปริ้นออกมาจาก json
                            // User: parsedAttrs[1],
                            // ID: parsedAttrs[0],
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
    CheckInvoice(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CheckInvoice(unparsedAttrs)]';
        // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {
            
            let invokeObject = {};
            var hash
            var COMPANY = unparsedAttrs.COMPANY
            let args =[];
            var companydata =[];
            ParseCheckPO(unparsedAttrs).then(async(parsedAttrs) => {
                var id = unparsedAttrs.ID
                var collections = "INVOICE"
                console.log('hash:+++++++++++++++++++++++++++++++++++++++++++++++');
                hash = await db.DBread(COMPANY,collections,id)
                console.log('hash:+++++++++++++++++++++++++++++++++++++++++++++++');
                console.log('hash:' + hash);
                console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CheckUser,
                };
                args = [
                    hash,
                    unparsedAttrs.USER,
                ]
                companydata = [
                    COMPANY,
                    unparsedAttrs.USER
                ]
                console.log("1111111111111111111111111111111111111111"+args);
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
                    console.log("toBC");
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    console.log(resultParsed.PO_ID + "55555555555555555");
                    const key = new NodeRSA();
                    ///ดึงไพรเวทจากดาต้าเบส
                    // var pemFile = path.resolve(__dirname, `./${COMPANY}/private_key.pem`)
                    // var keyprivate = fs.readFileSync(pemFile)
                    var publickey = await Get_Key(invokeObject,companydata)
                    var keyprivate = await db.DBread(COMPANY,"CompanyData",publickey)
                    console.log(keyprivate);
                    key.importKey(keyprivate, 'pkcs1-private-pem');
                    const decrypted = JSON.parse(key.decrypt(resultParsed.PO_ID, 'utf8'));
                    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
                    console.log('decrypted: ', decrypted);
                    resolve({
                        message: { //ค่าที่ ปริ้นออกมาจาก json
                            // User: parsedAttrs[1],
                            // ID: parsedAttrs[0],
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
GenerateKeyPair(CompanyInfo) {      //ทำตัวเก็บคีย์แพร์ พร้อมกับ check
    var self = this;
    let functionName = '[toBC.GenerateKeyPair(CompanyInfo)]';
    logger.debug(self.enrollID);
    console.log(self.enrollID);
    return new Promise((resolve, reject) => {

        let infokey = keypair.generatekeypair(CompanyInfo.Name)
        var WorldState_key = (CompanyInfo.Name)
        // var WorldState_key = (CompanyInfo.ID + "|" + CompanyInfo.Role)
        // var Companyname = (CompanyInfo.Name)
        console.log('Add local db');
        // เอาไปใส่ในดาต้าเบสด้วย
        console.log('Add world state : ' + WorldState_key);


        let invokeObject = {};
        ParseKeyStore(WorldState_key, infokey.Public_key).then((parsedAttrs) => {
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: StoreKey,
                attrs: parsedAttrs
            };
            console.log('parsedAttrs:' + parsedAttrs);

            //ทำเป็น  อซิง ไปถาม พีช
            blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                // let resultParsed = JSON.parse(result.result.toString('utf8'));
                // let resultParsed = result.result.toString('utf8'); 
                db.AdminDBwrite(CompanyInfo.Name, infokey.Public_key, infokey.Private_key)
                db.CreateDbForCompany(CompanyInfo.Name, infokey.Public_key, infokey.Private_key)
                resolve({
                    message: {
                        CompanyName: CompanyInfo.Name,
                        WorldState_Key: WorldState_key,
                        Public_Key: infokey.Public_key,
                        Private_Key: infokey.Privatekey


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
