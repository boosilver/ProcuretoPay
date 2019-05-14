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
const INVOKE_ATTRIBUTES = ['devorgId']; //base
var file = __dirname + '/config.json';
var MongoClient = require('mongodb').MongoClient; //libmongoDB
var url = "mongodb://localhost:27017/mydb";
const keypair = require('../utils/generatekeypair');
const hash = require('../utils/hash');
const StoreKey = 'StoreKey'; //func
const db = require('../utils/utilsdb')
/////chaincode
const CreatePO = 'CreatePO'; //func
const GetValue = 'GetValue'; //func
const CheckPO = 'CheckPO'; //func
const CheckInvoice = 'CheckInvoice'; //func
const CreateInvoice = 'CreateInvoice'; //func
const PushInBlockchain = 'PushInBlockchain'; //func

//master

/**
 * Parsing parameters from the object received
 * from client and using default values
 * where needed/possible
 * @function
 * @param {object} unparsedAttrs - New ServiceRequest Object

 */
var day = new Date();

function getRandomInt() {
    return Math.floor(Math.random() * Math.random() * Math.random() * 100000000000);
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
    // console.log(getkey)
    // console.log(company)
    // console.log("++-+--+-+-+Getkey-+-+-+-+--+-+-+-")
    var result = await blockchain.query(getkey.enrollID, getkey.fcnname, company, INVOKE_ATTRIBUTES)
    console.log("toBC")
    // console.log("++-+--+-+-+Affter Getkey-+-+-+-+--+-+-+-")
    // blockchain.query(getkey.enrollID, getkey.fcnname, company, INVOKE_ATTRIBUTES).then((result) => {
    let resultParsed = JSON.parse(result.result.toString('utf8'));
    // console.log(result)
    // console.log("++-+--+-+-+Affter Getkey-+-+-+-+--+-+-+-")
    return (resultParsed.PUBLIC_KEY);
}
async function Get_Valua(getkey, company) {
    // console.log(getkey)
    // console.log(company)
    // console.log("++-+--+-+-+Getkey-+-+-+-+--+-+-+-")
    var result = await blockchain.query(getkey.enrollID, getkey.fcnname, company, INVOKE_ATTRIBUTES)
    console.log("toBC")
    // console.log("++-+--+-+-+Affter Getkey-+-+-+-+--+-+-+-")
    // blockchain.query(getkey.enrollID, getkey.fcnname, company, INVOKE_ATTRIBUTES).then((result) => {
    let resultParsed = JSON.parse(result.result.toString('utf8'));
    // console.log(result)
    // console.log("++-+--+-+-+Affter Getkey-+-+-+-+--+-+-+-")
    return (resultParsed);
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
        return new Promise(async (resolve, reject) => {
            //เช็คว่าค่าจากโพสแมนมีค่าจริงๆ ถ้าค่าว่างต้องโชว error (เช็คก่อนเจน)
            //เอาคีย์ไปเช็คในดาต้า PO number, 
            console.log("testttt5555")
            let invokeObject = {};
            let getkey = {};
            let companydata = {};
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
            var SALT = getRandomInt();
            var parsedAttrs = {
                TO: unparsedAttrs.TO.toLowerCase() || reject("Company_TO name not found"),
                FORM: unparsedAttrs.FORM.toLowerCase() || reject("Company_FORM name not found"), //ไปอ่านไฟล์คอนฟิกของบริษัทเราเอง 
                TYPE: "PO",
                PO_KEY: unparsedAttrs.PO_KEY || reject("PO_ID name not found"),
                VALUE: unparsedAttrs.VALUE || reject("VALUE name not found"),
                DATE: DATE,
                SALT: SALT,
            }
            var DATABASE = {
                TO: unparsedAttrs.TO.toLowerCase() || reject("Company_TO name not found"),
                FORM: unparsedAttrs.FORM.toLowerCase() || reject("Company_FORM name not found"),
                TYPE: "PO", 
                PO_KEY: unparsedAttrs.PO_KEY || reject("PO_ID name not found"),
                VALUE: unparsedAttrs.VALUE || reject("VALUE name not found"),
                DATE: DATE,
            }
            // var COMPANY = unparsedAttrs.COMPANY // อันเดียวกีับ to แก้ให้เป็นอันเดียวกัน
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: CreatePO,
            };
            ///////////////
            getkey = {
                enrollID: self.enrollID,
                fcnname: GetValue,

            };
            companydata = [unparsedAttrs.TO.toLowerCase(),
            unparsedAttrs.FORM.toLowerCase(),
            ]
            console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-*******************")
            var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
            console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-*******************")
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
            var collections = "PO"
            var CheckPO ="don'have yet"
            try {
                CheckPO = await db.DBread(unparsedAttrs.FORM.toLowerCase(), collections, "PO_BODY|"+unparsedAttrs.PO_KEY)
                
            } catch (error) {
                // console.log(error)
            }
            if(CheckPO =="don'have yet"){
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
                    let resultParsed = result.result.toString('utf8');
                    // var resultParsed = Buffer.from(JSON.stringify(result.result)); 
                    // var resultParsed2 = JSON.parse(resultParsed.toJSON()).data
                    console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                    console.log(resultParsed)  //// ติดปัญหาแกะตัวอักษรไม่ได้
                    console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                    console.log(ciphertext);
                    
                    console.log(unparsedAttrs.FORM.toLowerCase());
                    var My_publckey = await db.DBreadPublic(unparsedAttrs.FORM.toLowerCase(),"CompanyData" , unparsedAttrs.FORM.toLowerCase())
                    key.importKey(My_publckey, 'pkcs1-public-pem');
                    const MY_ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
                    var My_hash = crypto.createHash('sha256')          //HASH FUCTION
                    .update(MY_ciphertext)
                    .digest('hex');
                    // db.DBwrite(unparsedAttrs.FORM, collections, My_hash, MY_ciphertext)
                    // db.DBwrite(unparsedAttrs.FORM, collections, unparsedAttrs.KEY, My_hash)
                    db.DBwrite3(unparsedAttrs.FORM.toLowerCase(), collections, "PO_BODY|"+unparsedAttrs.PO_KEY, DATABASE,hash)
                    db.DBwrite(unparsedAttrs.FORM.toLowerCase(), collections, "PO_SALT|"+unparsedAttrs.PO_KEY, SALT)
    
                    ////////////
                    // db.DBwrite(unparsedAttrs.TO, collections, hash, ciphertext)        /// ให้แก้ไปเก็บลงในต้าเบสของคนที่เราจะส่งให้
                    // db.DBwrite(unparsedAttrs.TO, collections, unparsedAttrs.KEY, hash) /// ทาง event hub
    
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
                            TO: parsedAttrs.TO.toLowerCase(),
                            FORM: parsedAttrs.FORM.toLowerCase(),
                            TYPE: "PO",
                            PO_KEY: parsedAttrs.PO_KEY,
                            VALUE: parsedAttrs.VALUE,
                            DATE: parsedAttrs.DATE,
                            SALT: SALT,
                        }
                    });
                }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
                    logger.error(`${functionName}  ${e}`);
                    reject(` ${e}`);
                });
            }else {
                reject("Already have  PO")
            }
            
        })

    }

    CreateInvoice(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CreateInvoice(unparsedAttrs)]';
        // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise(async (resolve, reject) => {
            let invokeObject = {};
            let getkey = {};
            let companydata = {};
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
            // var SALT = getRandomInt();
            var parsedAttrs = {
                TO: unparsedAttrs.TO.toLowerCase() || reject("Company_TO name not found"),
                FORM: unparsedAttrs.FORM.toLowerCase() || reject("Company_FORM name not found"),
                TYPE: "INVOICE",
                INVOICE_KEY: unparsedAttrs.INVOICE_KEY || reject("INVOICE_KEY name not found"),
                PO_KEY: unparsedAttrs.PO_KEY || reject("POKEY name not found"),
                VALUE: unparsedAttrs.VALUE || reject("VALUE name not found"),
                DATE: DATE,
            }
            var DATABASE = {
                TO: unparsedAttrs.TO.toLowerCase() || reject("Company_TO name not found"),
                FORM: unparsedAttrs.FORM.toLowerCase() || reject("Company_FORM name not found"), //ไปอ่านไฟล์คอนฟิกของบริษัทเราเอง 
                TYPE: "INVOICE",
                INVOICE_KEY: unparsedAttrs.INVOICE_KEY || reject("PO_ID name not found"),
                PO_KEY: unparsedAttrs.PO_KEY || reject("POKEY name not found"),
                VALUE: unparsedAttrs.VALUE || reject("VALUE name not found"),
                DATE: DATE,
            }
            var CheckPO =""
            try {
                CheckPO = await db.DBread(unparsedAttrs.FORM.toLowerCase(), "PO", "PO_BODY|"+unparsedAttrs.PO_KEY)
                console.log("***********-------------++++++++++++++++++++++"+CheckPO)
            } catch (error) {
                reject("PO not available")
            }
            
            // var COMPANY = unparsedAttrs.COMPANY
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: CreateInvoice,
            };
            getkey = {
                enrollID: self.enrollID,
                fcnname: GetValue,

            };
            companydata = [unparsedAttrs.TO.toLowerCase(),
            unparsedAttrs.FORM.toLowerCase(),
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
            var collections = "INVOICE"
            var CheckInvoice ="don'have yet"
            try {
                CheckInvoice = await db.DBread(unparsedAttrs.FORM.toLowerCase(), collections, "INVOICE_BODY|"+unparsedAttrs.INVOICE_KEY)
                
            } catch (error) {
                // console.log(error)
            }
            if(CheckPO != "" && CheckInvoice == "don'have yet"){  /// po ต้องไม่ว่าง และ invoice ยังไม่ถูกใช้
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
                    let resultParsed = result.result.toString('utf8');
                    console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                    console.log(resultParsed)
                    console.log(ciphertext);
                    // var My_publckey = await db.DBreadPublic(unparsedAttrs.FORM,"CompanyData" , unparsedAttrs.FORM)
                    // key.importKey(My_publckey, 'pkcs1-public-pem');
                    // const MY_ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
                    // var My_hash = crypto.createHash('sha256')          //HASH FUCTION
                    // .update(MY_ciphertext)
                    // .digest('hex');
                    // db.DBwrite(unparsedAttrs.FORM, collections, My_hash, MY_ciphertext)
                    db.DBwrite3(unparsedAttrs.FORM.toLowerCase(), collections, "INVOICE_BODY|"+unparsedAttrs.INVOICE_KEY, DATABASE,hash)
                    ////////////
                    
    
                    resolve({
                        message: {
                            TO: parsedAttrs.TO.toLowerCase(),
                            FORM: parsedAttrs.FORM.toLowerCase(),
                            TYPE: "INVOICE",
                            INVOICE_KEY: parsedAttrs.INVOICE_KEY,
                            PO_KEY: parsedAttrs.PO_KEY,
                            VALUE: parsedAttrs.VALUE,
                            DATE: parsedAttrs.DATE,
                        }
                    });
                }).catch((e) => {
                    logger.error(`${functionName}  ${e}`);
                    reject(` ${e}`);
                });
            }else {
                reject(" Already have  Invoice")
            }
            
        })
    }

    Loan(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.Loan(unparsedAttrs)]';
        return new Promise(async (resolve, reject) => {
            
            let invokeObject = {};
            var parsedAttrs = {}
            let getkey = {};
            let companydata = [];
            var collections = ""
            const key = new NodeRSA();
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
            if(unparsedAttrs.DOC_LOAN.toUpperCase() != "PO" && unparsedAttrs.DOC_LOAN.toUpperCase() != "INVOICE"){
                reject("DOC_LOAN name not found")
            }else collections = unparsedAttrs.DOC_LOAN.toUpperCase()
            console.log(collections)
            console.log("---------------------------------------------")
            try {
                var data = await db.DBread(unparsedAttrs.FORM.toLowerCase(), collections, `${collections}_BODY|`+unparsedAttrs.KEY)
            } catch (error) {
                reject("Invoice not available")
            }
            var SALT = await db.DBread(unparsedAttrs.FORM.toLowerCase(), "PO", "PO_SALT|"+data.PO_KEY)
            if(collections == "INVOICE"){
                    parsedAttrs = {
                    BANK: unparsedAttrs.BANK.toLowerCase() || reject("Company name not found"),
                    FORM: unparsedAttrs.FORM.toLowerCase() || reject("FORM name not found"), //ไปอ่านไฟล์คอนฟิกของบริษัทเราเอง 
                    TYPE: `BORROW_${collections}`, 
                    BORROWKEY: unparsedAttrs.BORROWKEY || reject("BORROWKEY name not found"),
                    PO_KEY: data.PO_KEY,
                    INVOICE_KEY: data.INVOICE_KEY || reject("KEY name not found"),
                    DATE: DATE,
                    INVOICE: data,
                    SALT: SALT,
                }
            }else {
                    parsedAttrs = {
                    BANK: unparsedAttrs.BANK.toLowerCase() || reject("Company name not found"),
                    FORM: unparsedAttrs.FORM.toLowerCase() || reject("FORM name not found"), //ไปอ่านไฟล์คอนฟิกของบริษัทเราเอง 
                    TYPE: `BORROW_${collections}`, 
                    BORROWKEY: unparsedAttrs.BORROWKEY || reject("BORROWKEY name not found"),
                    PO_KEY: data.PO_KEY,
                    DATE: DATE,
                    PO: data,
                    SALT: SALT,
                    }
            }
            
            console.log(parsedAttrs)
            // var COMPANY = unparsedAttrs.COMPANY // อันเดียวกีับ to แก้ให้เป็นอันเดียวกัน
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: PushInBlockchain,
            };
            ///////////////
            getkey = {
                enrollID: self.enrollID,
                fcnname: GetValue,

            };
            companydata = [unparsedAttrs.BANK.toLowerCase(),
            unparsedAttrs.FORM.toLowerCase(),
            ]
            var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
            console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
            console.log('HASH Ciphertext Complete!!! : ', hash)
            let args = [hash, ciphertext
            ];
            var collectionss = `BORROW_${collections}`
            blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
                console.log("toBC");
                let resultParsed = result.result.toString('utf8');
                // db.DBwrite(unparsedAttrs.FORM, collectionss, hash, ciphertext)
                // db.DBwrite(unparsedAttrs.FORM, collectionss, unparsedAttrs.BORROWKEY, hash)
                db.DBwrite3(unparsedAttrs.FORM.toLowerCase(), collectionss, "BORROW_INVOICE_BODY|"+unparsedAttrs.BORROWKEY, parsedAttrs,hash)
                resolve({
                    message: {
                        BANK: parsedAttrs.BANK.toLowerCase(),
                        FORM: parsedAttrs.FORM.toLowerCase(),
                        TYPE: parsedAttrs.TYPE,
                        INVOICE_KEY: parsedAttrs.KEY,
                        PO_KEY: data.PO_KEY,
                        VALUE: parsedAttrs.VALUE,
                        DATE: parsedAttrs.DATE,
                        INVOICE: data,
                        INVOICE2: data.KEY,
                    }
                });
            }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
                logger.error(`${functionName}  ${e}`);
                reject(` ${e}`);
            });
        })

    }

    Request_Verify_Invoice(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.Request_Verify_Invoice(unparsedAttrs)]';
        return new Promise(async (resolve, reject) => {
            let invokeObject = {};
            var collections = ""
            let getkey = {};
            let companydata = [];
            const key = new NodeRSA();
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
            var SALT2 = getRandomInt();
            if(unparsedAttrs.DOC_LOAN.toUpperCase() != "PO" && unparsedAttrs.DOC_LOAN.toUpperCase() != "INVOICE"){
                reject("DOC_LOAN name not found")
            }else collections = unparsedAttrs.DOC_LOAN.toUpperCase()
            console.log(collections)
            console.log("---------------------------------------------")
            if(collections == "INVOICE"){
                try {
                    var BORROW = await db.DBread(unparsedAttrs.BANK.toLowerCase() || reject("BANK name not found"), `BORROW_${collections}`, `BORROW_${collections}_BODY|`+unparsedAttrs.BORROWKEY)
                    console.log(BORROW)
                } catch (error) {
                    reject("Borrow information not available")
                }
                try {
                        var INVOICE = await db.DBread(unparsedAttrs.BANK.toLowerCase() || reject("BANK name not found"), collections, `${collections}_BODY|`+BORROW.INVOICE_KEY)             
                        console.log("INVOCE"+INVOICE)
                } catch (error) {
                    reject("Invoice information not available")  /// หาไม่เจอ
                }
                try { 
                        var SALT = await db.DBread(unparsedAttrs.BANK.toLowerCase() || reject("BANK name not found"), "PO", "PO_SALT|"+ INVOICE.PO_KEY)
                    } catch (error) {
                    reject("Salt not available")
                }
               
                console.log(SALT)
                ///////////////
                var parsedAttrs = {
                    VERIFY: "Verify",
                    BANK: unparsedAttrs.BANK.toLowerCase() || reject("BANK name not found") ,
                    TO: INVOICE.TO.toLowerCase(),
                    FORM: INVOICE.FORM.toLowerCase(),
                    TYPE: INVOICE.TYPE, 
                    INVOICE_KEY: INVOICE.INVOICE_KEY,
                    PO_KEY: INVOICE.PO_KEY,
                    VALUE: INVOICE.VALUE,
                    DATE: INVOICE.DATE,
                    SALT: SALT,
                    SALT2: SALT2,  /// ของตริงใช้ SALT ใหม่ที่เจนใหม่
                    // SALT: SALT,
                }
            }else {
                try {
                    var BORROW = await db.DBread(unparsedAttrs.BANK.toLowerCase() || reject("BANK name not found"), `BORROW_${collections}`, `BORROW_${collections}_BODY|`+unparsedAttrs.BORROWKEY)
                    console.log(BORROW)
                } catch (error) {
                    reject("Borrow information not available")
                }
                try {
                        var PO = await db.DBread(unparsedAttrs.BANK.toLowerCase() || reject("BANK name not found"), collections, `${collections}_BODY|`+BORROW.PO_KEY)             
                        console.log("PO"+PO)
                        console.log(PO)
                } catch (error) {
                    reject("Invoice information not available")  /// หาไม่เจอ
                }
                try {
                        var SALT = await db.DBread(unparsedAttrs.BANK.toLowerCase() || reject("BANK name not found"), "PO", "PO_SALT|"+ PO.PO_KEY)
                } catch (error) {
                    reject("Salt not available")
                }
               
                console.log(SALT)
                ///////////////
                var parsedAttrs = {
                    VERIFY: "Verify",
                    BANK: unparsedAttrs.BANK.toLowerCase() || reject("BANK name not found") ,
                    TO: PO.TO.toLowerCase(),
                    FORM: PO.FORM.toLowerCase(),
                    TYPE: PO.TYPE, 
                    PO_KEY: PO.PO_KEY,
                    VALUE: PO.VALUE,
                    DATE: PO.DATE,
                    SALT: SALT,
                    SALT2: SALT2,  /// ของตริงใช้ SALT ใหม่ที่เจนใหม่
                    // SALT: SALT,
                }
            }
            console.log('parsedAttrs: ', parsedAttrs);

    
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: PushInBlockchain,
            };
            ///////////////
            getkey = {
                enrollID: self.enrollID,
                fcnname: GetValue,

            };
            companydata = [unparsedAttrs.TO.toLowerCase() || reject("COMPANY name not found"),
            unparsedAttrs.BANK.toLowerCase() || reject("BANK name not found"),
            ]
            console.log("------------------xxxxxxxxxxxxxxxxx---------------------------")
            var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
            console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
            console.log('HASH Ciphertext Complete!!! : ', hash)
            let args = [hash, ciphertext
            ];
            console.log("-------------------------------------------");
            console.log(args+"Testttttttttttttttttttttttttttt");
            blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then((result) => {
                console.log("toBC");
                let resultParsed = result.result.toString('utf8');
                // db.DBwrite(unparsedAttrs.FORM, collections, hash, ciphertext)
                // db.DBwrite(unparsedAttrs.FORM, collections, unparsedAttrs.BORROWKEY, hash)
                if(collections == "INVOICE"){
                    resolve({
                        message: {
                            BORROWKEY: unparsedAttrs.BORROWKEY || reject("BORROWKEY name not found"),
                            INVOICE : "-------------",
                            TO: parsedAttrs.TO.toLowerCase(),
                            FORM: parsedAttrs.FORM.toLowerCase(),
                            TYPE: parsedAttrs.TYPE,
                            INVOICE_KEY: parsedAttrs.INVOICE_KEY,
                            PO_KEY: INVOICE.PO_KEY,
                            VALUE: parsedAttrs.VALUE,
                            DATE: parsedAttrs.DATE,
                            SALT: parsedAttrs.SALT,
                            NEWSALT: SALT2,
                        }
                    });
                }else {
                    resolve({
                        message: {
                            BORROWKEY: unparsedAttrs.BORROWKEY || reject("BORROWKEY name not found"),
                            PO : "-------------",
                            TO: parsedAttrs.TO.toLowerCase(),
                            FORM: parsedAttrs.FORM.toLowerCase(),
                            TYPE: parsedAttrs.TYPE,
                            PO_KEY: PO.PO_KEY,
                            VALUE: parsedAttrs.VALUE,
                            DATE: parsedAttrs.DATE,
                            SALT: parsedAttrs.SALT,
                            NEWSALT: SALT2,
                        }
                    });
                }
                
            }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
                logger.error(`${functionName}  ${e}`);
                reject(` ${e}`);
            });
        })

    }


    endorse_loan(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.endorse_loan(unparsedAttrs)]';
        return new Promise(async (resolve, reject) => {
            const key = new NodeRSA();
            let invokeObject = {};
            let getkey = {};
            let companydata = {};
            let Loan_Info = {};
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
            var parsedAttrs = {
                TO: unparsedAttrs.TO || reject("Company name not found"),
                BANK: unparsedAttrs.BANK || reject("Bank name not found"), //ไปอ่านไฟล์คอนฟิกของบริษัทเราเอง 
                TYPE: "ENDORSE_LOAN", // API เจนเอง
                DOC_LOAN: unparsedAttrs.DOC_LOAN.toUpperCase(),
                KEY: unparsedAttrs.KEY || reject("INVOICE_KEY name not found"),//INVOICE
                PRICE_BORROW: unparsedAttrs.PRICE_BORROW || reject("PRICE_BORROW name not found"),
                DATE: DATE,
            }
            if(unparsedAttrs.DOC_LOAN.toUpperCase() == "INVOICE"){
                try {
                    var Invoice = await db.DBread(unparsedAttrs.BANK || reject("Bank name not found"),"INVOICE" , `INVOICE_BODY|` +unparsedAttrs.KEY || reject("KEY name not found"))
                } catch (error) {
                    reject("Invoice information not available")
                }
                var WORLD_KEY = unparsedAttrs.TO+"|"+Invoice.INVOICE_KEY+"|"+Invoice.PO_KEY
                var hash_WORLD_KEY = crypto.createHash('sha256')          //HASH FUCTION
                    .update(WORLD_KEY)
                    .digest('hex');
                var PRICE = Invoice.VALUE
                var checkreject = ""
                if (unparsedAttrs.PRICE_BORROW > PRICE){
                    checkreject = "reject"
                    reject("Amount over")
                }
            }else {
                console.log("*****0000000000***");
                try {
                    var PO = await db.DBread(unparsedAttrs.BANK || reject("Bank name not found"),"PO" , `PO_BODY|` +unparsedAttrs.KEY || reject("KEY name not found"))
                } catch (error) {
                    reject("PO information not available")
                }
                var WORLD_KEY = unparsedAttrs.TO+"|"+PO.PO_KEY
                var hash_WORLD_KEY = crypto.createHash('sha256')          //HASH FUCTION
                    .update(WORLD_KEY)
                    .digest('hex');
                var PRICE = PO.VALUE
                var checkreject = ""
                if (unparsedAttrs.PRICE_BORROW > PRICE){
                    checkreject = "reject"
                    reject("Amount over")
                }
            }
            
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: PushInBlockchain,
            };
            getkey = {
                enrollID: self.enrollID,
                fcnname: GetValue,

            };
            Loan_Info = [  hash_WORLD_KEY,
                unparsedAttrs.BANK,  
            ]
            companydata = [unparsedAttrs.TO,
            unparsedAttrs.BANK,
            ]
            // console.log('ciphertext:////////// ');
            // console.log(Loan_Info);
            // console.log(companydata);
            var Check_loan = ""
            try { 
                Check_loan = await Get_Valua(getkey, Loan_Info)            
            } catch (error) {
                // console.log(error)
            }
            if(Check_loan != ""){
                reject("Has already been borrowed")
            }
            console.log('ciphertext:////////// ', Check_loan);
            var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
            // console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
            // console.log('HASH Ciphertext Complete!!! : ', hash)
            let args = [hash, ciphertext
            ];
            if (checkreject != "reject" && !Check_loan) {
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
                    let resultParsed = result.result.toString('utf8');
                    var collections = "ENDORSE_LOAN"
                        db.DBwrite3(unparsedAttrs.BANK, collections, `${collections}_BODY|${unparsedAttrs.BANK}|` +`${unparsedAttrs.DOC_LOAN}_${unparsedAttrs.KEY}`, parsedAttrs,hash)
                        // db.DBwrite3(unparsedAttrs.BANK, collections, `${collections}_BODY|${INFORMATION.BANK}|` +`${unparsedAttrs.DOC_LOAN}_${unparsedAttrs.KEY}`, parsedAttrs,hash)

                    resolve({
                        message: {
                            TO: parsedAttrs.TO,
                            BANK: parsedAttrs.BANK,
                            TYPE: parsedAttrs.TYPE,
                            KEY: parsedAttrs.KEY,
                            PRICE_BORROW: parsedAttrs.PRICE_BORROW,
                            DATE: parsedAttrs.DATE,
                        }
                    });
                }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
                    logger.error(`${functionName}  ${e}`);
                    reject(` ${e}`);
                });
            }
            
        })

    }
    Accept(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.Accept(unparsedAttrs)]';
        return new Promise(async (resolve, reject) => {
            let invokeObject = {};  
            let getkey = {};
            let companydata = {};
            if(unparsedAttrs.DOC_LOAN == "INVOICE"){
                console.log("+++++++++++++++++++++++++++++++++++++++++");
                console.log("INVOICE");
                try {
                    var Endorse_loan = await db.DBread(unparsedAttrs.FORM || reject("Company name not found"),"ENDORSE_LOAN" , `ENDORSE_LOAN_BODY|${unparsedAttrs.BANK}|${unparsedAttrs.DOC_LOAN}_${unparsedAttrs.KEY}`)
                } catch (error) {
                    reject("Endorse_loan information not available")
                }
                try {
                    var Invoice = await db.DBread(unparsedAttrs.FORM || reject("Company name not found"),"INVOICE" , `INVOICE_BODY|` +unparsedAttrs.KEY || reject("KEY not found"))
                } catch (error) {
                    reject("Invoice information not available")
                }
                try {
                    var PO = await db.DBread(unparsedAttrs.FORM || reject("Company name not found"),"PO" , `PO_BODY|` +Invoice.PO_KEY || reject("POKEY not found"))
                } catch (error) {
                    reject("Invoice information not available")
                }
                var WORLD_KEY = unparsedAttrs.FORM+"|"+Invoice.INVOICE_KEY+"|"+Invoice.PO_KEY
                console.log(WORLD_KEY);
            }else {
                try {
                    var Endorse_loan = await db.DBread(unparsedAttrs.FORM || reject("Company name not found"),"ENDORSE_LOAN" , `ENDORSE_LOAN_BODY|${unparsedAttrs.BANK}|${unparsedAttrs.DOC_LOAN}_${unparsedAttrs.KEY}`)
                } catch (error) {
                    reject("Endorse_loan information not available")
                }
                try {
                    var PO = await db.DBread(unparsedAttrs.FORM || reject("Company name not found"),"PO" , `PO_BODY|` +unparsedAttrs.KEY || reject("KEY not found"))
                } catch (error) {
                    reject("Invoice information not available")
                }
                var WORLD_KEY = unparsedAttrs.FORM+"|"+PO.PO_KEY
                console.log(WORLD_KEY);
            }
           
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: PushInBlockchain,
            };
            // ///////////////
            getkey = {
                enrollID: self.enrollID,
                fcnname: GetValue,

            };
            companydata = [unparsedAttrs.BANK,
            unparsedAttrs.FORM,
            ]
            var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
            // console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-*******************"+Publickey)
            const key = new NodeRSA();
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            let ciphertext = key.encrypt(Endorse_loan, 'base64', 'utf8');
            // console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(WORLD_KEY)
                .digest('hex');
            // console.log('HASH Ciphertext Complete!!! : ', hash)
            let args = [hash, ciphertext
            ];
            blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
                let resultParsed = result.result.toString('utf8');
                resolve({
                    message: {
                        ENDORSE: Endorse_loan,
                        INVOICE: Invoice,
                        PO: PO,
                    }
                });
            }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
                logger.error(`${functionName}  ${e}`);
                reject(` ${e}`);
            });
        })

    }
    AutoPushInBlockchain(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.AutoPushInBlockchain(unparsedAttrs)]';
        return new Promise(async (resolve, reject) => {
            let invokeObject = {};  
            let getkey = {};
            let companydata = {};
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
            var parsedAttrs = {
                BANK: unparsedAttrs.BANK ,
                FORM: unparsedAttrs.FORM , //ไปอ่านไฟล์คอนฟิกของบริษัทเราเอง 
                TYPE: "Auto Verify",
                DATE: DATE,
                PO: unparsedAttrs.PO ,
                SALT: unparsedAttrs.SALT ,
                SALT2: unparsedAttrs.SALT2 ,
            }
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: PushInBlockchain,
            };
            // ///////////////
            getkey = {
                enrollID: self.enrollID,
                fcnname: GetValue,

            };
            companydata = [unparsedAttrs.BANK,
            unparsedAttrs.FORM,
            ]
            // console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-*******************")
            var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
            // console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-*******************"+Publickey)
            const key = new NodeRSA();
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            let ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
            // console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
            // console.log('HASH Ciphertext Complete!!! : ', hash)
            let args = [hash, ciphertext
            ];
            blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
                let resultParsed = result.result.toString('utf8');
                resolve({
                    message: {
                        BANK: parsedAttrs.BANK,
                        FORM: parsedAttrs.FORM,
                        TYPE: parsedAttrs.TYPE,
                        DATE: parsedAttrs.DATE,
                        PO: parsedAttrs.PO,
                        SALT: parsedAttrs.SALT,
                    }
                });
            }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
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
                    fcnname: GetValue,
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
    GetPO(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CheckPO(unparsedAttrs)]';
        // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            var hash
            var COMPANY = unparsedAttrs.COMPANY
            let args = [];
            var companydata = [];
            ParseCheckPO(unparsedAttrs).then(async (parsedAttrs) => {
                var id = unparsedAttrs.ID
                var collections = "PO"
                console.log('hash:+++++++++++++++++++++++++++++++++++++++++++++++');
                hash = await db.DBread(unparsedAttrs.USER, collections, id)
                console.log('hash:+++++++++++++++++++++++++++++++++++++++++++++++');
                console.log('hash:' + hash);
                console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: GetValue,
                };
                args = [
                    hash,
                    unparsedAttrs.USER,
                ]
                companydata = [
                    unparsedAttrs.USER,
                    unparsedAttrs.USER
                ]
                console.log("1111111111111111111111111111111111111111" + args);
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
                    console.log("toBC");
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    console.log(resultParsed.VALUE + "55555555555555555");
                    const key = new NodeRSA();
                    ///ดึงไพรเวทจากดาต้าเบส
                    // var pemFile = path.resolve(__dirname, `./${COMPANY}/private_key.pem`)
                    // var keyprivate = fs.readFileSync(pemFile)
                    var publickey = await Get_Key(invokeObject, companydata)
                    var keyprivate = await db.DBread(unparsedAttrs.USER, "CompanyData", publickey)
                    console.log(keyprivate);
                    key.importKey(keyprivate, 'pkcs1-private-pem');
                    const decrypted = JSON.parse(key.decrypt(resultParsed.VALUE, 'utf8'));
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
            // var COMPANY = unparsedAttrs.COMPANY
            let args = [];
            var companydata = [];
            ParseCheckPO(unparsedAttrs).then(async (parsedAttrs) => {
                var id = unparsedAttrs.ID
                var collections = "INVOICE"
                console.log('hash:+++++++++++++++++++++++++++++++++++++++++++++++');
                hash = await db.DBread(unparsedAttrs.USER, collections, id)
                console.log('hash:+++++++++++++++++++++++++++++++++++++++++++++++');
                console.log('hash:' + hash);
                console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: GetValue,
                };
                args = [
                    hash,
                    unparsedAttrs.USER,
                ]
                companydata = [
                    unparsedAttrs.USER,
                    unparsedAttrs.USER
                ]
                console.log("1111111111111111111111111111111111111111" + args);
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
                    console.log("toBC");
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    console.log(resultParsed.VALUE + "55555555555555555");
                    const key = new NodeRSA();
                    ///ดึงไพรเวทจากดาต้าเบส
                    // var pemFile = path.resolve(__dirname, `./${COMPANY}/private_key.pem`)
                    // var keyprivate = fs.readFileSync(pemFile)
                    var publickey = await Get_Key(invokeObject, companydata)
                    var keyprivate = await db.DBread(unparsedAttrs.USER, "CompanyData", publickey)
                    console.log(keyprivate);
                    key.importKey(keyprivate, 'pkcs1-private-pem');
                    const decrypted = JSON.parse(key.decrypt(resultParsed.VALUE, 'utf8'));
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
    GetValue(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.GetValue(unparsedAttrs)]';
        return new Promise(async(resolve, reject) => {
            
            console.log(unparsedAttrs.COMPANY)
            console.log(unparsedAttrs.TYPE)
            console.log(`${unparsedAttrs.TYPE}_BODY`+unparsedAttrs.KEY)
            var  VALUE = await db.DBread(unparsedAttrs.COMPANY, unparsedAttrs.TYPE,`${unparsedAttrs.TYPE}_BODY|`+unparsedAttrs.KEY )
            console.log(VALUE);
            console.log("----------------------------------------");
            resolve({
                message: { 
                    INFO: VALUE,
                }
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

        let infokey = keypair.generatekeypair(CompanyInfo.Name.toLowerCase())
        var WorldState_key = (CompanyInfo.Name.toLowerCase())
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
                
                //DATABASE for admin
                db.AdminDBwrite(CompanyInfo.Name,infokey.Public_key,infokey.Private_key)

                // db.AdminDBwrite(CompanyInfo.Name, infokey.Public_key, infokey.Private_key)

                //DATABASE for USER
                db.AdminForCom(CompanyInfo.Name, infokey.Public_key,infokey.Private_key)
                
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





// var crypto = require('crypto');
// // var crypto = require('crypto');
// const logger = require('../utils/logger');
// const blockchain = require('../blockchain/service');
// const fs = require("fs")
// const path = require('path')
// //const UUID = require('../../utils/UUID');
// const NodeRSA = require('node-rsa');
// // const key = new NodeRSA({b: 2048});
// //Chaincode functions names
// const INVOKE_ATTRIBUTES = ['devorgId']; //base
// var file = __dirname + '/config.json';
// var MongoClient = require('mongodb').MongoClient; //libmongoDB
// var url = "mongodb://localhost:27017/mydb";
// const keypair = require('../utils/generatekeypair');
// const hash = require('../utils/hash');
// const StoreKey = 'StoreKey'; //func
// const db = require('../utils/utilsdb')
// /////chaincode
// const CreatePO = 'CreatePO'; //func
// const GetValue = 'GetValue'; //func
// const CheckPO = 'CheckPO'; //func
// const CheckInvoice = 'CheckInvoice'; //func
// const CreateInvoice = 'CreateInvoice'; //func
// const PushInBlockchain = 'PushInBlockchain'; //func



// /**
//  * Parsing parameters from the object received
//  * from client and using default values
//  * where needed/possible
//  * @function
//  * @param {object} unparsedAttrs - New ServiceRequest Object

//  */
// var day = new Date();

// function getRandomInt() {
//     return Math.floor(Math.random() * Math.random() * Math.random() * 1000000000000000000);
// }
// function ParseCheckPO(unparsedAttrs) { //for cheak CheckBalance
//     let functionName = '[toBC.ParseCheckPO(unparsedAttrs)]';

//     return new Promise((resolve, reject) => {

//         let parsedAttrs = {};
//         //new kvs().putStore(inv_identity,unparsedAttrs)

//         try {
//             parsedAttrs = { //รับมาจาก json
//                 ID: unparsedAttrs.ID || '',
//                 USER: unparsedAttrs.USER || '',
//             }
//             resolve([
//                 (parsedAttrs.ID).toString(),
//                 parsedAttrs.USER.toString(),
//             ])
//         } catch (e) {
//             logger.error(`${functionName} Parsing attributes failed ${e}`);
//             reject(`Sorry could not parse attributes: ${e}`);
//         }

//     });
// }
// function ParseKeyStore(WORLDSTATE_KEY, PUBLIC_KEY) { //for cheak CheckBalance
//     let functionName = '[toBC.ParseKeyStore(WORLDSTATE_KEY, PUBLIC_KEY)]';

//     return new Promise((resolve, reject) => {

//         let parsedAttrs = {};
//         //new kvs().putStore(inv_identity,unparsedAttrs)

//         try {
//             parsedAttrs = { //รับมาจาก json
//                 WORLDSTATE_KEY: WORLDSTATE_KEY || '',
//                 PUBLIC_KEY: PUBLIC_KEY || '',
//             }
//             resolve([
//                 parsedAttrs.WORLDSTATE_KEY.toString(),
//                 parsedAttrs.PUBLIC_KEY.toString()
//             ])
//         } catch (e) {
//             logger.error(`${functionName} Parsing attributes failed ${e}`);
//             reject(`Sorry could not parse attributes: ${e}`);
//         }

//     });
// }
// async function Get_Key(getkey, company) {
//     // console.log(getkey)
//     // console.log(company)
//     // console.log("++-+--+-+-+Getkey-+-+-+-+--+-+-+-")
//     var result = await blockchain.query(getkey.enrollID, getkey.fcnname, company, INVOKE_ATTRIBUTES)
//     // console.log("++-+--+-+-+Affter Getkey-+-+-+-+--+-+-+-")
//     // blockchain.query(getkey.enrollID, getkey.fcnname, company, INVOKE_ATTRIBUTES).then((result) => {
//     let resultParsed = JSON.parse(result.result.toString('utf8'));
//     // console.log(resultParsed.PUBLIC_KEY)
//     // console.log("++-+--+-+-+Affter Getkey-+-+-+-+--+-+-+-")
//     return (resultParsed.PUBLIC_KEY);
// }

// /**
//  * Creates a new ServiceRequest object.
//  * @class
//  */
// class toBC {

//     /**
//      * Represents a toBC.
//      * @constructs toBC
//      * @param {string} userName - Enrollment Id of the blockchain user
//      */
//     constructor(userName) {
//         this.enrollID = userName;
//     }


//     /**
//      * Create new serviceRequest.
//      * @method
//      * @param {object} unparsedAttrs - New ServiceRequest Object
//      */




//     CreatePO(unparsedAttrs) {
//         let self = this;
//         let functionName = '[toBC.CreatePO(unparsedAttrs)]';
//         return new Promise(async (resolve, reject) => {
//             //เช็คว่าค่าจากโพสแมนมีค่าจริงๆ ถ้าค่าว่างต้องโชว error (เช็คก่อนเจน)
//             //เอาคีย์ไปเช็คในดาต้า PO number, 
//             console.log("testttt5555")
//             let invokeObject = {};
//             let getkey = {};
//             let companydata = {};
//             var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
//             var SALT = getRandomInt();
//             var parsedAttrs = {
//                 TO: unparsedAttrs.TO || reject("Company name not found"),
//                 FORM: unparsedAttrs.FORM || '', //ไปอ่านไฟล์คอนฟิกของบริษัทเราเอง 
//                 TYPE: unparsedAttrs.TYPE.toUpperCase() || 'AA', // API เจนเอง
//                 KEY: unparsedAttrs.KEY || '',
//                 VALUE: unparsedAttrs.VALUE || '',
//                 DATE: DATE,
//                 SALT: SALT,
//             }
//             // var COMPANY = unparsedAttrs.COMPANY // อันเดียวกีับ to แก้ให้เป็นอันเดียวกัน
//             invokeObject = {
//                 enrollID: self.enrollID,
//                 fcnname: CreatePO,
//             };
//             ///////////////
//             getkey = {
//                 enrollID: self.enrollID,
//                 fcnname: GetValue,

//             };
//             companydata = [unparsedAttrs.TO,
//             unparsedAttrs.FORM,
//             ]
//             console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-*******************")
//             var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
//             console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-*******************")
//             const key = new NodeRSA();
//             key.importKey(Publickey.toString(), 'pkcs1-public-pem');
//             const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
//             console.log('ciphertext: ', ciphertext);
//             var hash = crypto.createHash('sha256')          //HASH FUCTION
//                 .update(ciphertext)
//                 .digest('hex');
//             console.log('HASH Ciphertext Complete!!! : ', hash)
//             let args = [hash, ciphertext
//             ];
//             var collections = "PO"
//             var CheckPO ="don'have yet"
//             try {
//                 CheckPO = await db.DBread(unparsedAttrs.FORM, collections, unparsedAttrs.KEY)
                
//             } catch (error) {
//                 // console.log(error)
//             }
//             if(CheckPO =="don'have yet"){
//                 blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
//                     let resultParsed = result.result.toString('utf8');
//                     // var resultParsed = Buffer.from(JSON.stringify(result.result)); 
//                     // var resultParsed2 = JSON.parse(resultParsed.toJSON()).data
//                     console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
//                     console.log(resultParsed)  //// ติดปัญหาแกะตัวอักษรไม่ได้
//                     console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
//                     console.log(ciphertext);
                    
//                     console.log(unparsedAttrs.FORM);
//                     var My_publckey = await db.DBreadPublic(unparsedAttrs.FORM,"CompanyData" , unparsedAttrs.FORM)
//                     key.importKey(My_publckey, 'pkcs1-public-pem');
//                     const MY_ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
//                     var My_hash = crypto.createHash('sha256')          //HASH FUCTION
//                     .update(MY_ciphertext)
//                     .digest('hex');
//                     db.DBwrite(unparsedAttrs.FORM, collections, My_hash, MY_ciphertext)
//                     db.DBwrite(unparsedAttrs.FORM, collections, unparsedAttrs.KEY, My_hash)
    
//                     ////////////
//                     // db.DBwrite(unparsedAttrs.TO, collections, hash, ciphertext)        /// ให้แก้ไปเก็บลงในต้าเบสของคนที่เราจะส่งให้
//                     // db.DBwrite(unparsedAttrs.TO, collections, unparsedAttrs.KEY, hash) /// ทาง event hub
    
//                     // MongoClient.connect(url, function (err, db) { //connect DB url
//                     //     if (err) throw err;
//                     //     var dbo = db.db("PO");
//                     //     dbo.createCollection("MyData", function (err, res) { //create collection 
//                     //         if (err) throw err;
//                     //         console.log("Collection created!");
//                     //         var myobj = [
//                     //             { _id: hash, TO: ciphertext }
//                     //         ];
//                     //         dbo.collection("MyData").insertMany(myobj, function (err, res) { //insertMany
//                     //             if (err) throw err;
//                     //             console.log("Number of documents inserted: " + res.insertedCount);
//                     //             db.close();
//                     //         });
//                     //     });
//                     // })
    
//                     resolve({
//                         message: {
//                             TO: parsedAttrs.TO,
//                             FORM: parsedAttrs.FORM,
//                             TYPE: parsedAttrs.TYPE,
//                             KEY: parsedAttrs.KEY,
//                             VALUE: parsedAttrs.VALUE,
//                             DATE: parsedAttrs.DATE,
//                         }
//                     });
//                 }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
//                     logger.error(`${functionName}  ${e}`);
//                     reject(` ${e}`);
//                 });
//             }else {
//                 reject("Already have  PO")
//             }
            
//         })

//     }

//     CreateInvoice(unparsedAttrs) {
//         let self = this;
//         let functionName = '[toBC.CreateInvoice(unparsedAttrs)]';
//         // self.uUID = UUID.generateUUID_RFC4122();

//         return new Promise(async (resolve, reject) => {
//             let invokeObject = {};
//             let getkey = {};
//             let companydata = {};
//             var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
//             var SALT = getRandomInt();
//             var TYPE = unparsedAttrs.TYPE.toUpperCase()
//             var parsedAttrs = {
//                 TO: unparsedAttrs.TO || '',
//                 FORM: unparsedAttrs.FORM || '',
//                 TYPE: TYPE,
//                 KEY: unparsedAttrs.KEY || '',
//                 POKEY: unparsedAttrs.POKEY || '',
//                 VALUE: unparsedAttrs.VALUE || '',
//                 DATE: DATE,
//                 SALT: SALT,
//             }
//             var CheckPO ="0"
//             try {
//                 CheckPO = await db.DBread(unparsedAttrs.FORM, "PO", unparsedAttrs.POKEY)
//                 console.log("***********-------------++++++++++++++++++++++"+CheckPO)
//             } catch (error) {
//                 reject("PO not available")
//             }
            
//             // var COMPANY = unparsedAttrs.COMPANY
//             invokeObject = {
//                 enrollID: self.enrollID,
//                 fcnname: CreateInvoice,
//             };
//             getkey = {
//                 enrollID: self.enrollID,
//                 fcnname: GetValue,

//             };
//             companydata = [unparsedAttrs.TO,
//             unparsedAttrs.FORM,
//             ]
//             var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
//             const key = new NodeRSA();
//             key.importKey(Publickey.toString(), 'pkcs1-public-pem');
//             const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
//             console.log('ciphertext: ', ciphertext);
//             var hash = crypto.createHash('sha256')          //HASH FUCTION
//                 .update(ciphertext)
//                 .digest('hex');
//             console.log('HASH Ciphertext Complete!!! : ', hash)
//             let args = [hash, ciphertext
//             ];
//             var collections = "INVOICE"
//             var CheckInvoice ="don'have yet"
//             try {
//                 CheckInvoice = await db.DBread(unparsedAttrs.FORM, collections, unparsedAttrs.KEY)
                
//             } catch (error) {
//                 // console.log(error)
//             }
//             if(CheckPO != "0" && CheckInvoice == "don'have yet"){
//                 blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
//                     let resultParsed = result.result.toString('utf8');
//                     console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
//                     console.log(resultParsed)
//                     console.log(ciphertext);
//                     var My_publckey = await db.DBreadPublic(unparsedAttrs.FORM,"CompanyData" , unparsedAttrs.FORM)
//                     key.importKey(My_publckey, 'pkcs1-public-pem');
//                     const MY_ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
//                     var My_hash = crypto.createHash('sha256')          //HASH FUCTION
//                     .update(MY_ciphertext)
//                     .digest('hex');
//                     db.DBwrite(unparsedAttrs.FORM, collections, My_hash, MY_ciphertext)
//                     db.DBwrite(unparsedAttrs.FORM, collections, unparsedAttrs.KEY, My_hash)
//                     ////////////
//                     // db.DBwrite(unparsedAttrs.TO, collections, hash, ciphertext)        /// ให้แก้ไปเก็บลงในต้าเบสของคนที่เราจะส่งให้
//                     // db.DBwrite(unparsedAttrs.TO, collections, unparsedAttrs.KEY, hash) /// ทาง event hub
    
//                     resolve({
//                         message: {
//                             TO: parsedAttrs.TO,
//                             FORM: parsedAttrs.FORM,
//                             TYPE: parsedAttrs.TYPE,
//                             KEY: parsedAttrs.KEY,
//                             VALUE: parsedAttrs.VALUE,
//                             DATE: parsedAttrs.DATE,
//                         }
//                     });
//                 }).catch((e) => {
//                     logger.error(`${functionName}  ${e}`);
//                     reject(` ${e}`);
//                 });
//             }else {
//                 reject(" Already have  Invoice")
//             }
            
//         })
//     }

//     BorrowInvoice(unparsedAttrs) {
//         let self = this;
//         let functionName = '[toBC.BorrowInvoice(unparsedAttrs)]';
//         return new Promise(async (resolve, reject) => {
            
//             let invokeObject = {};
//             let getkey = {};
//             let companydata = [];
//             var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
//             var collections = "INVOICE"
//             var hash = await db.DBread(unparsedAttrs.FORM, collections, unparsedAttrs.INVOICE_ID)
//             var encrypt = await db.DBread(unparsedAttrs.FORM, collections, hash)
//             ///////////
//             // let invokekey = {
//             //     enrollID: self.enrollID,
//             //     fcnname: GetValue,
//             // };
//             // companydata = [
//             //     unparsedAttrs.FORM,
//             //     unparsedAttrs.FORM,
//             // ]
//             // console.log("+++++++++++00000000000+++++++++++++++++")
//             // var publickey = await Get_Key(invokekey, companydata)
//             var keyprivate = await db.DBread(unparsedAttrs.FORM, "CompanyData", unparsedAttrs.FORM)
//             const key = new NodeRSA();
//             key.importKey(keyprivate, 'pkcs1-private-pem');
//             const decrypted = JSON.parse(key.decrypt(encrypt, 'utf8'));
//             console.log('decrypted: ', decrypted);
//             ///////////////
//             var parsedAttrs = {
//                 BANK: unparsedAttrs.BANK || reject("Company name not found"),
//                 FORM: unparsedAttrs.FORM || reject("FORM name not found"), //ไปอ่านไฟล์คอนฟิกของบริษัทเราเอง 
//                 TYPE: "BORROW_INVOICE", // API เจนเอง
//                 BORROWKEY: unparsedAttrs.BORROWKEY || reject("BORROWKEY name not found"),
//                 PO_ID: decrypted.POKEY,
//                 INVOICE_ID: unparsedAttrs.INVOICE_ID || reject("KEY name not found"),
//                 DATE: DATE,
//                 INVOICE: decrypted,
//             }
//             // var COMPANY = unparsedAttrs.COMPANY // อันเดียวกีับ to แก้ให้เป็นอันเดียวกัน
//             invokeObject = {
//                 enrollID: self.enrollID,
//                 fcnname: PushInBlockchain,
//             };
//             ///////////////
//             getkey = {
//                 enrollID: self.enrollID,
//                 fcnname: GetValue,

//             };
//             companydata = [unparsedAttrs.BANK,
//             unparsedAttrs.FORM,
//             ]
//             var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
//             key.importKey(Publickey.toString(), 'pkcs1-public-pem');
//             const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
//             console.log('ciphertext: ', ciphertext);
//             var hash = crypto.createHash('sha256')          //HASH FUCTION
//                 .update(ciphertext)
//                 .digest('hex');
//             console.log('HASH Ciphertext Complete!!! : ', hash)
//             let args = [hash, ciphertext
//             ];
//             // console.log("-------------------------------------------");
//             // console.log(args+"Testttttttttttttttttttttttttttt");
//             var collections = "BORROW_INVOICE"
//             // var CheckInvoice ="don'have yet"
//             // try {
//             //     CheckInvoice = await db.DBread(unparsedAttrs.FORM, collections, unparsedAttrs.KEY)
                
//             // } catch (error) {
//             //     // console.log(error)
//             // }
//             // if(CheckInvoice == "don'have yet"){

//             // }else {
                
//             // }
//             blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
//                 console.log("toBC");
//                 let resultParsed = result.result.toString('utf8');
//                 console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
//                 console.log(resultParsed)
//                 console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
//                 console.log(ciphertext);
//                 var collectionsInvoice = "INVOICE"
//                 db.DBwrite(unparsedAttrs.FORM, collections, hash, ciphertext)
//                 db.DBwrite(unparsedAttrs.FORM, collections, unparsedAttrs.BORROWKEY, hash)
//                 resolve({
//                     message: {
//                         BANK: parsedAttrs.BANK,
//                         FORM: parsedAttrs.FORM,
//                         TYPE: parsedAttrs.TYPE,
//                         INVOICE_ID: parsedAttrs.INVOICE_ID,
//                         PO_ID: decrypted.POKEY,
//                         VALUE: parsedAttrs.VALUE,
//                         DATE: parsedAttrs.DATE,
//                         INVOICE: decrypted,
//                         INVOICE2: decrypted.KEY,
//                     }
//                 });
//             }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
//                 logger.error(`${functionName}  ${e}`);
//                 reject(` ${e}`);
//             });
//         })

//     }

//     Request_Verify_Invoice(unparsedAttrs) {
//         let self = this;
//         let functionName = '[toBC.Request_Verify_Invoice(unparsedAttrs)]';
//         return new Promise(async (resolve, reject) => {
//             let invokeObject = {};
//             let getkey = {};
//             let companydata = [];
//             var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
//             var SALT = getRandomInt();
//             var collections = "BORROW_INVOICE"
//             console.log("testttttttttttttttttttt");
//             var hash = await db.DBread(unparsedAttrs.BANK, collections, unparsedAttrs.BORROWKEY)
//             console.log("testttttttttttttttttttt");
//             var encrypt = await db.DBread(unparsedAttrs.BANK, collections, hash)
//             ///////////
//             // let invokekey = {
//             //     enrollID: self.enrollID,
//             //     fcnname: GetValue,
//             // };
//             // companydata = [
//             //     unparsedAttrs.BANK,
//             //     unparsedAttrs.BANK,
//             // ]
//             // var publickey = await Get_Key(invokekey, companydata)
//             var keyprivate = await db.DBread(unparsedAttrs.BANK, "CompanyData", unparsedAttrs.BANK)
//             const key = new NodeRSA();
//             key.importKey(keyprivate, 'pkcs1-private-pem');
//             const decrypted = JSON.parse(key.decrypt(encrypt, 'utf8'));
//             console.log('decrypted: ', decrypted);
//             console.log('ID: ', decrypted.INVOICE_ID);
//             var Crypt = await db.DBread(unparsedAttrs.BANK, "INVOICE", decrypted.INVOICE_ID)
//             console.log('C1: ', encrypt);
//             console.log('C2: ', Crypt);
//             const decryptedInvoice = JSON.parse(key.decrypt(Crypt, 'utf8'));
//             console.log('INVOICE: ', decryptedInvoice);
//             ///////////////
//             var parsedAttrs = {
//                 VERIFY: "Verify",
//                 BANK: unparsedAttrs.BANK,
//                 TO: decryptedInvoice.TO,
//                 FORM: decryptedInvoice.FORM,
//                 TYPE: decryptedInvoice.TYPE, 
//                 KEY: decryptedInvoice.KEY,
//                 POKEY: decryptedInvoice.POKEY,
//                 VALUE: decryptedInvoice.VALUE,
//                 DATE: decryptedInvoice.DATE,
//                 SALT: decryptedInvoice.SALT,  /// ของตริงใช้ SALT ใหม่ที่เจนใหม่
//                 // SALT: SALT,
//             }
//             console.log('parsedAttrs: ', parsedAttrs);

    
//             invokeObject = {
//                 enrollID: self.enrollID,
//                 fcnname: PushInBlockchain,
//             };
//             ///////////////
//             getkey = {
//                 enrollID: self.enrollID,
//                 fcnname: GetValue,

//             };
//             companydata = [unparsedAttrs.TO,
//             unparsedAttrs.BANK,
//             ]
//             console.log("------------------xxxxxxxxxxxxxxxxx---------------------------")
//             var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
//             key.importKey(Publickey.toString(), 'pkcs1-public-pem');
//             const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
//             console.log('ciphertext: ', ciphertext);
//             var hash = crypto.createHash('sha256')          //HASH FUCTION
//                 .update(ciphertext)
//                 .digest('hex');
//             console.log('HASH Ciphertext Complete!!! : ', hash)
//             let args = [hash, ciphertext
//             ];
//             // console.log("-------------------------------------------");
//             // console.log(args+"Testttttttttttttttttttttttttttt");
//             blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then((result) => {
//                 console.log("toBC");
//                 let resultParsed = result.result.toString('utf8');
//                 console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
//                 console.log(resultParsed)
//                 console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
//                 console.log(ciphertext);
//                 // var collections = "BORROW_INVOICE"
//                 // db.DBwrite(unparsedAttrs.FORM, collections, hash, ciphertext)
//                 // db.DBwrite(unparsedAttrs.FORM, collections, unparsedAttrs.BORROWKEY, hash)
//                 // ////////////
//                 // db.DBwrite(unparsedAttrs.TO, collections, hash, ciphertext)        /// ให้แก้ไปเก็บลงในต้าเบสของคนที่เราจะส่งให้
//                 // db.DBwrite(unparsedAttrs.TO, collections, unparsedAttrs.BORROWKEY, hash) /// ทาง event hub
//                 resolve({
//                     message: {
//                         BORROWKEY: unparsedAttrs.BORROWKEY,
//                         INVOICE : "-------------",
//                         TO: parsedAttrs.TO,
//                         FORM: parsedAttrs.FORM,
//                         TYPE: parsedAttrs.TYPE,
//                         KEY: parsedAttrs.KEY,
//                         POKEY: decryptedInvoice.POKEY,
//                         VALUE: parsedAttrs.VALUE,
//                         DATE: parsedAttrs.DATE,
//                         SALT: parsedAttrs.SALT,
//                         pp: "Not yet used ",
//                         NEWSALT: SALT,
//                     }
//                 });
//             }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
//                 logger.error(`${functionName}  ${e}`);
//                 reject(` ${e}`);
//             });
//         })

//     }


//     endorse_loan(unparsedAttrs) {
//         let self = this;
//         let functionName = '[toBC.endorse_loan(unparsedAttrs)]';
//         return new Promise(async (resolve, reject) => {
//             const key = new NodeRSA();
//             let invokeObject = {};
//             let getkey = {};
//             let companydata = {};
//             var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
//             var parsedAttrs = {
//                 TO: unparsedAttrs.TO || reject("Company name not found"),
//                 BANK: unparsedAttrs.BANK || reject("Bank name not found"), //ไปอ่านไฟล์คอนฟิกของบริษัทเราเอง 
//                 TYPE: "ENDORSE_LOAN", // API เจนเอง
//                 KEY: unparsedAttrs.KEY || reject("KEY name not found"),
//                 PRICE_BORROW: unparsedAttrs.PRICE_BORROW || reject("PRICE_BORROW name not found"),
//                 DATE: DATE,
//             }
//             var Invoicecrypt = await db.DBread(unparsedAttrs.BANK,"INVOICE" , unparsedAttrs.KEY)
//             var keyprivate = await db.DBread(unparsedAttrs.BANK, "CompanyData", unparsedAttrs.BANK) 
//             key.importKey(keyprivate, 'pkcs1-private-pem');
//             const InvoiceInfo = key.decrypt(Invoicecrypt, 'utf8');
//             console.log('InvoiceInfo: ', InvoiceInfo);
//             var PRICE = JSON.parse(InvoiceInfo).VALUE
//             console.log('PRICE: ', PRICE);
//             var checkreject = ""
//             if (unparsedAttrs.PRICE_BORROW > PRICE){
//                 checkreject = "reject"
//                 reject("Amount over")
//             }
//             console.log('parsedAttrs://///////////////.........//////////////// ');
//             // var COMPANY = unparsedAttrs.COMPANY // อันเดียวกีับ to แก้ให้เป็นอันเดียวกัน
//             invokeObject = {
//                 enrollID: self.enrollID,
//                 fcnname: PushInBlockchain,
//             };
//             ///////////////
//             getkey = {
//                 enrollID: self.enrollID,
//                 fcnname: GetValue,

//             };
//             companydata = [unparsedAttrs.TO,
//             unparsedAttrs.BANK,
//             ]
//             var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
//             key.importKey(Publickey.toString(), 'pkcs1-public-pem');
//             const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
//             console.log('ciphertext: ', ciphertext);
//             var hash = crypto.createHash('sha256')          //HASH FUCTION
//                 .update(ciphertext)
//                 .digest('hex');
//             console.log('HASH Ciphertext Complete!!! : ', hash)
//             let args = [hash, ciphertext
//             ];
//             if (checkreject != "reject") {
//                 blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
//                     let resultParsed = result.result.toString('utf8');
//                     // var resultParsed = Buffer.from(JSON.stringify(result.result)); 
//                     // var resultParsed2 = JSON.parse(resultParsed.toJSON()).data
//                     console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
//                     console.log(resultParsed)  //// ติดปัญหาแกะตัวอักษรไม่ได้
//                     console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
//                     console.log(ciphertext);
//                     var collections = "ENDORSE_LOAN"
//                     console.log(unparsedAttrs.BANK);
//                     var My_publckey = await db.DBreadPublic(unparsedAttrs.BANK,"CompanyData" , unparsedAttrs.BANK)
//                     key.importKey(My_publckey, 'pkcs1-public-pem');
//                     const MY_ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
//                     var My_hash = crypto.createHash('sha256')          //HASH FUCTION
//                     .update(MY_ciphertext)
//                     .digest('hex');
                    
//                         db.DBwrite(unparsedAttrs.BANK, collections, My_hash, MY_ciphertext)
//                         db.DBwrite(unparsedAttrs.BANK, collections, unparsedAttrs.KEY, My_hash)
                    
                    
                    
                    
//                     resolve({
//                         message: {
//                             TO: parsedAttrs.TO,
//                             BANK: parsedAttrs.BANK,
//                             TYPE: parsedAttrs.TYPE,
//                             KEY: parsedAttrs.KEY,
//                             PRICE_BORROW: parsedAttrs.PRICE_BORROW,
//                             DATE: parsedAttrs.DATE,
//                         }
//                     });
//                 }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
//                     logger.error(`${functionName}  ${e}`);
//                     reject(` ${e}`);
//                 });
//             }
            
//         })

//     }
//     AutoPushInBlockchain(unparsedAttrs) {
//         let self = this;
//         let functionName = '[toBC.AutoPushInBlockchain(unparsedAttrs)]';
//         return new Promise(async (resolve, reject) => {
//             let invokeObject = {};  
//             let getkey = {};
//             let companydata = {};
//             var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
//             var parsedAttrs = {
//                 BANK: unparsedAttrs.BANK ,
//                 FORM: unparsedAttrs.FORM , //ไปอ่านไฟล์คอนฟิกของบริษัทเราเอง 
//                 TYPE: "Auto Verify",
//                 DATE: DATE,
//                 PO: unparsedAttrs.PO ,
//             }
//             invokeObject = {
//                 enrollID: self.enrollID,
//                 fcnname: PushInBlockchain,
//             };
//             // ///////////////
//             getkey = {
//                 enrollID: self.enrollID,
//                 fcnname: GetValue,

//             };
//             companydata = [unparsedAttrs.BANK,
//             unparsedAttrs.FORM,
//             ]
//             // console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-*******************")
//             var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
//             // console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-*******************"+Publickey)
//             const key = new NodeRSA();
//             key.importKey(Publickey.toString(), 'pkcs1-public-pem');
//             let ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
//             // console.log('ciphertext: ', ciphertext);
//             var hash = crypto.createHash('sha256')          //HASH FUCTION
//                 .update(ciphertext)
//                 .digest('hex');
//             // console.log('HASH Ciphertext Complete!!! : ', hash)
//             let args = [hash, ciphertext
//             ];
//             blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async(result) => {
//                 let resultParsed = result.result.toString('utf8');
//                 resolve({
//                     message: {
//                         BANK: parsedAttrs.BANK,
//                         FORM: parsedAttrs.FORM,
//                         TYPE: parsedAttrs.TYPE,
//                         DATE: parsedAttrs.DATE,
//                         PO: parsedAttrs.PO,
//                     }
//                 });
//             }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
//                 logger.error(`${functionName}  ${e}`);
//                 reject(` ${e}`);
//             });
//         })

//     }
//     Checkkey(unparsedAttrs) {
//         let self = this;
//         let functionName = '[toBC.Checkkey(unparsedAttrs)]';
//         // self.uUID = UUID.generateUUID_RFC4122();

//         return new Promise((resolve, reject) => {

//             let invokeObject = {};
//             let data
//             var COMPANY = unparsedAttrs.COMPANY
//             ParseCheckPO(unparsedAttrs).then((parsedAttrs) => {
//                 console.log('parsedAttrs:' + parsedAttrs);
//                 invokeObject = {
//                     enrollID: self.enrollID,
//                     fcnname: GetValue,
//                     attrs: parsedAttrs
//                 };
//                 console.log("1111111111111111111111111111111111111111");
//                 console.log(invokeObject);
//                 console.log(invokeObject.attrs);
//                 blockchain.query(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
//                     let resultParsed = JSON.parse(result.result.toString('utf8'));
//                     console.log(resultParsed.VALUE + "55555555555555555");

//                     resolve({
//                         message: { //ค่าที่ ปริ้นออกมาจาก json
//                             User: parsedAttrs[1],
//                             ID: parsedAttrs[0],
//                             VALUE: resultParsed,

//                             // History : resultParsed.SHOW_HISTORY,
//                             // Historyyy : result.result.toString(),
//                         }
//                     });
//                 }).catch((e) => {
//                     logger.error(`${functionName}  ${e}`);
//                     reject(` ${e}`);
//                 });
//             }).catch((e) => {
//                 logger.error(`${functionName} Failed to create new ServiceRequest (createServiceRequest() function failed): ${JSON.stringify(e)}`);
//                 reject(`Failed to create new ServiceRequest (createServiceRequest() function failed): ${e}`);
//             });
//         });
//     }
//     CheckPO(unparsedAttrs) {
//         let self = this;
//         let functionName = '[toBC.CheckPO(unparsedAttrs)]';
//         // self.uUID = UUID.generateUUID_RFC4122();

//         return new Promise((resolve, reject) => {

//             let invokeObject = {};
//             var hash
//             var COMPANY = unparsedAttrs.COMPANY
//             let args = [];
//             var companydata = [];
//             ParseCheckPO(unparsedAttrs).then(async (parsedAttrs) => {
//                 var id = unparsedAttrs.ID
//                 var collections = "PO"
//                 console.log('hash:+++++++++++++++++++++++++++++++++++++++++++++++');
//                 hash = await db.DBread(unparsedAttrs.USER, collections, id)
//                 console.log('hash:+++++++++++++++++++++++++++++++++++++++++++++++');
//                 console.log('hash:' + hash);
//                 console.log('parsedAttrs:' + parsedAttrs);
//                 invokeObject = {
//                     enrollID: self.enrollID,
//                     fcnname: GetValue,
//                 };
//                 args = [
//                     hash,
//                     unparsedAttrs.USER,
//                 ]
//                 companydata = [
//                     unparsedAttrs.USER,
//                     unparsedAttrs.USER
//                 ]
//                 console.log("1111111111111111111111111111111111111111" + args);
//                 blockchain.query(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
//                     console.log("toBC");
//                     let resultParsed = JSON.parse(result.result.toString('utf8'));
//                     console.log(resultParsed.VALUE + "55555555555555555");
//                     const key = new NodeRSA();
//                     ///ดึงไพรเวทจากดาต้าเบส
//                     // var pemFile = path.resolve(__dirname, `./${COMPANY}/private_key.pem`)
//                     // var keyprivate = fs.readFileSync(pemFile)
//                     var publickey = await Get_Key(invokeObject, companydata)
//                     var keyprivate = await db.DBread(unparsedAttrs.USER, "CompanyData", publickey)
//                     console.log(keyprivate);
//                     key.importKey(keyprivate, 'pkcs1-private-pem');
//                     const decrypted = JSON.parse(key.decrypt(resultParsed.VALUE, 'utf8'));
//                     console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
//                     console.log('decrypted: ', decrypted);
//                     resolve({
//                         message: { //ค่าที่ ปริ้นออกมาจาก json
//                             // User: parsedAttrs[1],
//                             // ID: parsedAttrs[0],
//                             TO: decrypted.TO,
//                             FORM: decrypted.FORM,
//                             TYPE: decrypted.TYPE,
//                             KEY: decrypted.KEY,
//                             VALUE: decrypted.VALUE,
//                             DATE: decrypted.DATE,
//                             SALT: decrypted.SALT,
//                             // History : resultParsed.SHOW_HISTORY,
//                             // Historyyy : result.result.toString(),
//                         }
//                     });
//                 }).catch((e) => {
//                     logger.error(`${functionName}  ${e}`);
//                     reject(` ${e}`);
//                 });
//             }).catch((e) => {
//                 logger.error(`${functionName} Failed to create new ServiceRequest (createServiceRequest() function failed): ${JSON.stringify(e)}`);
//                 reject(`Failed to create new ServiceRequest (createServiceRequest() function failed): ${e}`);
//             });
//         });
//     }
//     CheckInvoice(unparsedAttrs) {
//         let self = this;
//         let functionName = '[toBC.CheckInvoice(unparsedAttrs)]';
//         // self.uUID = UUID.generateUUID_RFC4122();

//         return new Promise((resolve, reject) => {

//             let invokeObject = {};
//             var hash
//             // var COMPANY = unparsedAttrs.COMPANY
//             let args = [];
//             var companydata = [];
//             ParseCheckPO(unparsedAttrs).then(async (parsedAttrs) => {
//                 var id = unparsedAttrs.ID
//                 var collections = "INVOICE"
//                 console.log('hash:+++++++++++++++++++++++++++++++++++++++++++++++');
//                 hash = await db.DBread(unparsedAttrs.USER, collections, id)
//                 console.log('hash:+++++++++++++++++++++++++++++++++++++++++++++++');
//                 console.log('hash:' + hash);
//                 console.log('parsedAttrs:' + parsedAttrs);
//                 invokeObject = {
//                     enrollID: self.enrollID,
//                     fcnname: GetValue,
//                 };
//                 args = [
//                     hash,
//                     unparsedAttrs.USER,
//                 ]
//                 companydata = [
//                     unparsedAttrs.USER,
//                     unparsedAttrs.USER
//                 ]
//                 console.log("1111111111111111111111111111111111111111" + args);
//                 blockchain.query(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
//                     console.log("toBC");
//                     let resultParsed = JSON.parse(result.result.toString('utf8'));
//                     console.log(resultParsed.VALUE + "55555555555555555");
//                     const key = new NodeRSA();
//                     ///ดึงไพรเวทจากดาต้าเบส
//                     // var pemFile = path.resolve(__dirname, `./${COMPANY}/private_key.pem`)
//                     // var keyprivate = fs.readFileSync(pemFile)
//                     var publickey = await Get_Key(invokeObject, companydata)
//                     var keyprivate = await db.DBread(unparsedAttrs.USER, "CompanyData", publickey)
//                     console.log(keyprivate);
//                     key.importKey(keyprivate, 'pkcs1-private-pem');
//                     const decrypted = JSON.parse(key.decrypt(resultParsed.VALUE, 'utf8'));
//                     console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
//                     console.log('decrypted: ', decrypted);
//                     resolve({
//                         message: { //ค่าที่ ปริ้นออกมาจาก json
//                             // User: parsedAttrs[1],
//                             // ID: parsedAttrs[0],
//                             TO: decrypted.TO,
//                             FORM: decrypted.FORM,
//                             TYPE: decrypted.TYPE,
//                             KEY: decrypted.KEY,
//                             VALUE: decrypted.VALUE,
//                             DATE: decrypted.DATE,
//                             SALT: decrypted.SALT,
//                             // History : resultParsed.SHOW_HISTORY,
//                             // Historyyy : result.result.toString(),
//                         }
//                     });
//                 }).catch((e) => {
//                     logger.error(`${functionName}  ${e}`);
//                     reject(` ${e}`);
//                 });
//             }).catch((e) => {
//                 logger.error(`${functionName} Failed to create new ServiceRequest (createServiceRequest() function failed): ${JSON.stringify(e)}`);
//                 reject(`Failed to create new ServiceRequest (createServiceRequest() function failed): ${e}`);
//             });
//         });
//     }
//     /**
// * GenerateKeyPair
// * @method post
// * @description - Generate key for company
// * @param {Object}req - CompanyInfo{Name,Role,ID}
// * @param {Object}res - KeyPair of each Company
// */
// GenerateKeyPair(CompanyInfo) {      //ทำตัวเก็บคีย์แพร์ พร้อมกับ check
//     var self = this;
//     let functionName = '[toBC.GenerateKeyPair(CompanyInfo)]';
//     logger.debug(self.enrollID);
//     console.log(self.enrollID);
//     return new Promise((resolve, reject) => {

//         let infokey = keypair.generatekeypair(CompanyInfo.Name)
//         var WorldState_key = (CompanyInfo.Name)
//         // var WorldState_key = (CompanyInfo.ID + "|" + CompanyInfo.Role)
//         // var Companyname = (CompanyInfo.Name)
//         console.log('Add local db');
//         // เอาไปใส่ในดาต้าเบสด้วย
//         console.log('Add world state : ' + WorldState_key);


//         let invokeObject = {};
//         ParseKeyStore(WorldState_key, infokey.Public_key).then((parsedAttrs) => {
//             invokeObject = {
//                 enrollID: self.enrollID,
//                 fcnname: StoreKey,
//                 attrs: parsedAttrs
//             };
//             console.log('parsedAttrs:' + parsedAttrs);

//             //ทำเป็น  อซิง ไปถาม พีช
//             blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
//                 // let resultParsed = JSON.parse(result.result.toString('utf8'));
//                 // let resultParsed = result.result.toString('utf8');
                
//                 //DATABASE for admin
//                 db.AdminDBwrite(CompanyInfo.Name,infokey.Public_key,infokey.Private_key)

//                 // db.AdminDBwrite(CompanyInfo.Name, infokey.Public_key, infokey.Private_key)

//                 //DATABASE for USER
//                 db.AdminForCom(CompanyInfo.Name, infokey.Public_key,infokey.Private_key)
                
//                 resolve({
//                     message: {
//                         CompanyName: CompanyInfo.Name,
//                         WorldState_Key: WorldState_key,
//                         Public_Key: infokey.Public_key,
//                         Private_Key: infokey.Privatekey


//                     }
//                 });
//             }).catch((e) => {
//                 logger.error(`${functionName}  ${e}`);
//                 reject(` ${e}`);
//             });



//         })

//     })



// }
// }
// module.exports = toBC;
