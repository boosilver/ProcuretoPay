var crypto = require('crypto');
// var crypto = require('crypto');
const logger = require('../utils/logger');
const blockchain = require('../blockchain/service');
const fs = require("fs")
const path =require('path')
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



var fs = require('fs');
var file = __dirname + '/config.json';
/**
 * Parsing parameters from the object received
 * from client and using default values
 * where needed/possible
 * @function
 * @param {object} unparsedAttrs - New ServiceRequest Object

 */
var day =new Date();

function getRandomInt() {
    return Math.floor(Math.random() * Math.random() * Math.random() *1000000000000000000); 
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
        return new Promise((resolve, reject) => {
            let invokeObject = {};
            var DATE = day.getDate()+"-"+(day.getMonth()+1) +"-"+ day.getFullYear();
            var SALT = getRandomInt();
           var parsedAttrs = {
                TO: unparsedAttrs.TO || '',
                FORM: unparsedAttrs.FORM || '',
                TYPE: unparsedAttrs.TYPE || '',
                KEY: unparsedAttrs.KEY || '',
                VALUE: unparsedAttrs.VALUE || '',
                DATE : DATE ,
                SALT : SALT,
            }
            var COMPANY = unparsedAttrs.COMPANY
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CreatePO,
                };
                var pemFile = path.resolve(__dirname,`./${COMPANY}/public_key.pem`)
                var keypublic =fs.readFileSync(pemFile)
                // console.log(keypublic.toString('utf8'))
                const key = new NodeRSA();
                key.importKey(keypublic.toString(),'pkcs1-public-pem');
                // console.log(keypublic.toString('utf8'))
                const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
                console.log('ciphertext: ', ciphertext);
                var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
                console.log('HASH Ciphertext Complete!!! : ', hash)
                let args =[ciphertext,
                    hash
                ];

                ///////////////////////////////////
                // console.log('parsedAttrs:' + parsedAttrs);
                // const decrypted = key.decrypt(ciphertext, 'utf8');
                // console.log("-++-+--+-+-++---*-**/***/*//*/*/*---*-*//*/*-");
                // console.log('xxx: ', args);
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = result.result.toString('utf8');
                    console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                    console.log(resultParsed)
                    console.log(ciphertext);
                    MongoClient.connect(url, function(err, db) { //connect DB url
                        if (err) throw err;
                        var dbo = db.db("PO");
                        dbo.createCollection("MyData", function(err, res) { //create collection 
                          if (err) throw err;
                          console.log("Collection created!");
                          var myobj = [
                            { _id: hash, TO: ciphertext}
                          ];
                          dbo.collection("MyData").insertMany(myobj, function(err, res) { //insertMany
                            if (err) throw err;
                            console.log("Number of documents inserted: " + res.insertedCount);
                          db.close();
                        });
                      });
                      })

                    resolve({
                        message: {
                            TO: parsedAttrs.TO,
                            FORM: parsedAttrs.FORM,
                            TYPE:  parsedAttrs.TYPE,
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

    CreateInvoice(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CreateInvoice(unparsedAttrs)]';
       // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            var DATE = day.getDate()+"-"+(day.getMonth()+1) +"-"+ day.getFullYear();
            var SALT = getRandomInt();
           var parsedAttrs = {
                TO: unparsedAttrs.TO || '',
                FORM: unparsedAttrs.FORM || '',
                TYPE: unparsedAttrs.TYPE || '',
                KEY: unparsedAttrs.KEY || '',
                VALUE: unparsedAttrs.VALUE || '',
                DATE : DATE ,
                SALT : SALT,
            }
            var COMPANY = unparsedAttrs.COMPANY
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CreatePO,
                };
                var pemFile = path.resolve(__dirname,`./${COMPANY}/public_key.pem`)
                var keypublic =fs.readFileSync(pemFile)
                // console.log(keypublic.toString('utf8'))
                const key = new NodeRSA();
                key.importKey(keypublic.toString(),'pkcs1-public-pem');
                // console.log(keypublic.toString('utf8'))
                const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
                console.log('ciphertext: ', ciphertext);
                var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
                console.log('HASH Ciphertext Complete!!! : ', hash)
                let args =[ciphertext,
                    hash
                ];
                console.log('parsedAttrs:' + parsedAttrs);
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = result.result.toString('utf8');
                    console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                    console.log(resultParsed)
                    console.log(ciphertext);
                    MongoClient.connect(url, function(err, db) { //connect DB url
                        if (err) throw err;
                        var dbo = db.db("Invoice");
                        dbo.createCollection("MyData", function(err, res) { //create collection 
                          if (err) throw err;
                          console.log("Collection created!");
                          var myobj = [
                            { _id: hash, TO: ciphertext}
                          ];
                          dbo.collection("MyData").insertMany(myobj, function(err, res) { //insertMany
                            if (err) throw err;
                            console.log("Number of documents inserted: " + res.insertedCount);
                          db.close();
                        });
                      });
                      })
                    resolve({
                        message: {
                            TO: parsedAttrs.TO,
                            FORM: parsedAttrs.FORM,
                            TYPE:  parsedAttrs.TYPE,
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
    CheckInvoice(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CheckPO(unparsedAttrs)]';
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
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    console.log(resultParsed.VALUE+"55555555555555555");
                    // console.log(JSON.parse(result.VALUE)+"55555555555555555");
                    const key = new NodeRSA();
                    var pemFile = path.resolve(__dirname,`./${COMPANY}/private_key.pem`)
                    var keyprivate =fs.readFileSync(pemFile)
                    key.importKey(keyprivate,'pkcs1-private-pem');
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
    CheckPO(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CheckPO(unparsedAttrs)]';
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
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    console.log(resultParsed.VALUE+"55555555555555555");
                    // console.log(JSON.parse(result.VALUE)+"55555555555555555");
                    const key = new NodeRSA();
                    var pemFile = path.resolve(__dirname,`./${COMPANY}/private_key.pem`)
                    var keyprivate =fs.readFileSync(pemFile)
                    key.importKey(keyprivate,'pkcs1-private-pem');
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

            MongoClient.connect(url, function(err, db) { //connect DB url
                if (err) throw err;
                var dbo = db.db("key private");
                var dbo2 = db.db("key public");
                dbo.createCollection("MyData", function(err, res) { //create collection 
                  if (err) throw err;
                  console.log("Collection created!");
                  var myobj = [
                    { _id: WorldState_key, Privatekey: Private_key}
                  ];
                  dbo.collection("MyData").insertMany(myobj, function(err, res) { //insertMany
                    if (err) throw err;
                    console.log("Number of documents inserted: " + res.insertedCount);
                  db.close();
                });
              });
              dbo2.createCollection("MyData", function(err, res) { //create collection 
                if (err) throw err;
                console.log("Collection created!");
                var myobj = [
                  { _id: WorldState_key, Publickey: Public_key}
                ];
                dbo2.collection("MyData").insertMany(myobj, function(err, res) { //insertMany
                  if (err) throw err;
                  console.log("Number of documents inserted: " + res.insertedCount);
                db.close();
              });
            });
              })

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
