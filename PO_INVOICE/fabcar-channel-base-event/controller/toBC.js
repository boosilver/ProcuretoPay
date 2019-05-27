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
const Loan = 'Loan'; //func
const Reject = 'Reject'; //func
const Reject_Invoice = 'Reject_Invoice'; //func
const Push_B = 'Push_Block'; //func
const PERMISSION = process.env.PERMISSION;
const PackageUser = process.env.USER;
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
                (parsedAttrs.ID).toString().toLowerCase(),
                parsedAttrs.USER.toString(),
            ])
        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}
function ParseKeyStore(WORLDSTATE_KEY, PUBLIC_KEY, STATUS) { //for cheak CheckBalance
    let functionName = '[toBC.ParseKeyStore(WORLDSTATE_KEY, PUBLIC_KEY)]';

    return new Promise((resolve, reject) => {

        let parsedAttrs = {};
        //new kvs().putStore(inv_identity,unparsedAttrs)

        try {
            parsedAttrs = { //รับมาจาก json
                WORLDSTATE_KEY: WORLDSTATE_KEY || '',
                PUBLIC_KEY: PUBLIC_KEY || '',
                STATUS: STATUS || '',
            }
            resolve([
                parsedAttrs.WORLDSTATE_KEY.toString(),
                parsedAttrs.PUBLIC_KEY.toString(),
                parsedAttrs.STATUS.toString()
            ])
        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}
async function Get_Key(getkey, company) {
    var result = await blockchain.query(getkey.enrollID, getkey.fcnname, company, INVOKE_ATTRIBUTES)
    console.log("toBC")
    let resultParsed = JSON.parse(result.result.toString('utf8'));
    return (resultParsed.PUBLIC_KEY);
}
async function Get_Status(getkey, company) {
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
    return (resultParsed.STATUS);
}
async function Get_Valua(getkey, company) {
    var result = await blockchain.query(getkey.enrollID, getkey.fcnname, company, INVOKE_ATTRIBUTES)
    console.log("toBC")
    let resultParsed = JSON.parse(result.result.toString('utf8'));
    console.log(resultParsed)
    return (resultParsed);
}
async function Push_Block(invokeObject, args) {
    console.log("Push_Block")
    console.log(invokeObject)
    console.log(args)
    var result = await blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES)
    console.log("toBC")
    // let resultParsed = JSON.parse(result.result.toString('utf8'));
    return ;
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
            var Check
            var CheckPO
            let invokeObject = {};
            let getkey = {};
            let companydata = {};
            let args = []
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
            var SALT = getRandomInt();
            if (PERMISSION != "company") {
                Check = "reject"
                reject("permission denied. You can't use this function ")
            }
            if (unparsedAttrs.TO.toLowerCase() == PackageUser) {
                Check = "reject"
                reject("You can't send yourself ")
            }
            var HASH_USER = crypto.createHash('sha256')
            .update(PackageUser)
            .digest('hex');
            /////////////////////

            var PO_K = 1
            var PO_old = 0
            getkey = {
                enrollID: self.enrollID,
                fcnname: GetValue,

            };
            companydata = ["PO_OLD",
                PackageUser
            ]
            try {
                PO_old = await Get_Valua(getkey, companydata)  //ไป get key from world
                // console.log("PO___"+PO_old.VALUE)
            } catch (error) {
                // reject("Company not found.")
                // Check = "reject"
            }
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: Push_B,
            };
            // console.log("PO___"+parseInt('10 lions', PO_old.VALUE))
            var po_key = Math.floor(PO_K+parseInt('10 lions', PO_old.VALUE))
            var PO_KEY = po_key.toString()
            args = ["PO_OLD", PO_KEY
            ];
            // console.log("args___"+args)
            await Push_Block(invokeObject, args)
            // console.log("55")
            ////////////////////
            
            if (unparsedAttrs.VALUE <= 0) {
                Check = "reject"
                reject("You can't enter the amount of 0 or less.")
            }
            var parsedAttrs = {
                TO: unparsedAttrs.TO.toLowerCase() || reject("Company_TO name not found"),
                FROM: PackageUser,
                TYPE: "PO",
                PO_KEY: PO_KEY,
                PRODUCT: unparsedAttrs.PRODUCT.toLowerCase() || reject("PRODUCT name not found"),
                NUM_PRODUCT: unparsedAttrs.NUM_PRODUCT || reject("NUM_PRODUCT name not found"),
                VALUE: unparsedAttrs.VALUE || reject("VALUE name not found"),
                DATE: DATE,
                SALT: SALT,
            }
            var DATABASE = {
                TO: unparsedAttrs.TO.toLowerCase() || reject("Company_TO name not found"),
                FROM: PackageUser,
                TYPE: "PO",
                PO_KEY: PO_KEY,
                PRODUCT: unparsedAttrs.PRODUCT.toLowerCase() || reject("PRODUCT name not found"),
                NUM_PRODUCT: unparsedAttrs.NUM_PRODUCT || reject("NUM_PRODUCT name not found"),
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
                PackageUser
            ]
            // console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-*******************")
            try {
                var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
                var Status = await Get_Status(getkey, companydata)
                console.log(Status)
            } catch (error) {
                reject("Company not found.")
                Check = "reject"
            }
            if (Status != "company") {
                reject("You must send to Company only.")
                Check = "reject"
            }
            // console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-*******************")
            const key = new NodeRSA();
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
            console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
            console.log('HASH Ciphertext Complete!!! : ', hash)

           
            args = [hash, ciphertext, HASH_USER
            ];
            var collections = "PO"
            try {
                CheckPO = await db.DBread(PackageUser, collections, "PO_BODY|" + PO_KEY)
                Check = "reject"
                reject("Already have  PO")
            } catch (error) {
                // console.log(error)
            }
            if (Check != "reject") {
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
                    let resultParsed = result.result.toString('utf8');
                    // var resultParsed = Buffer.from(JSON.stringify(result.result)); 
                    // var resultParsed2 = JSON.parse(resultParsed.toJSON()).data
                    console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                    console.log(resultParsed)  //// ติดปัญหาแกะตัวอักษรไม่ได้
                    console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                    console.log(ciphertext);

                    console.log(PackageUser);
                    var My_publckey = await db.DBreadPublic(PackageUser, "CompanyData", PackageUser)
                    key.importKey(My_publckey, 'pkcs1-public-pem');
                    const MY_ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
                    var My_hash = crypto.createHash('sha256')          //HASH FUCTION
                        .update(MY_ciphertext)
                        .digest('hex');
                    db.DBwrite3(PackageUser, collections, "PO_BODY|" + PO_KEY, DATABASE, hash)
                    db.DBwrite(PackageUser, collections, "PO_SALT|" + PO_KEY, SALT)

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
                            FROM: PackageUser,
                            TYPE: "PO",
                            PO_KEY: PO_KEY,
                            PRODUCT: unparsedAttrs.PRODUCT.toLowerCase(),
                            NUM_PRODUCT: unparsedAttrs.NUM_PRODUCT,
                            VALUE: parsedAttrs.VALUE,
                            DATE: parsedAttrs.DATE,
                            // SALT: SALT,
                        }
                    });
                }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
                    logger.error(`${functionName}  ${e}`);
                    reject(` ${e}`);
                });
            } else {
                reject("reject")
            }

        })

    }

    CreateInvoice(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CreateInvoice(unparsedAttrs)]';
        // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise(async (resolve, reject) => {
            var permission_reject = ""
            if (PERMISSION != "company") {
                permission_reject = "reject"
                reject("permission denied. You can't use this function ")
            }
            let invokeObject = {};
            let getkey = {};
            let companydata = {};
            let args = []
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
            // var SALT = getRandomInt();
             /////////////////////

             var INVOICE_K = 1
             var INVOICE_old = 0
             getkey = {
                 enrollID: self.enrollID,
                 fcnname: GetValue,
 
             };
             companydata = ["INVOICE_OLD",
                 PackageUser
             ]
             try {
                INVOICE_old = await Get_Valua(getkey, companydata)  //ไป get key from world
                 // console.log("PO___"+PO_old.VALUE)
             } catch (error) {
                 // reject("Company not found.")
                 // Check = "reject"
             }
             invokeObject = {
                 enrollID: self.enrollID,
                 fcnname: Push_B,
             };
             // console.log("PO___"+parseInt('10 lions', PO_old.VALUE))
             var invoice_key = Math.floor(INVOICE_K+parseInt('10 lions', INVOICE_old.VALUE))
             var INVOICE_KEY = invoice_key.toString()
             args = ["INVOICE_OLD", INVOICE_KEY
             ];
             // console.log("args___"+args)
             await Push_Block(invokeObject, args)
             // console.log("55")
             ////////////////////

            var parsedAttrs = {
                TO: unparsedAttrs.TO.toLowerCase() || reject("Company_TO name not found"),
                FROM: PackageUser,
                TYPE: "INVOICE",
                INVOICE_KEY: INVOICE_KEY,
                PO_KEY: unparsedAttrs.PO_KEY || reject("POKEY name not found"),
                PRODUCT: unparsedAttrs.PRODUCT.toLowerCase() || reject("PRODUCT name not found"),
                NUM_PRODUCT: unparsedAttrs.NUM_PRODUCT || reject("NUM_PRODUCT name not found"),
                VALUE: unparsedAttrs.VALUE || reject("VALUE name not found"),
                DATE: DATE,
            }
            var DATABASE = {
                TO: unparsedAttrs.TO.toLowerCase() || reject("Company_TO name not found"),
                FROM: PackageUser,
                TYPE: "INVOICE",
                INVOICE_KEY: INVOICE_KEY,
                PO_KEY: unparsedAttrs.PO_KEY || reject("POKEY name not found"),
                PRODUCT: unparsedAttrs.PRODUCT.toLowerCase() || reject("PRODUCT name not found"),
                NUM_PRODUCT: unparsedAttrs.NUM_PRODUCT || reject("NUM_PRODUCT name not found"),
                VALUE: unparsedAttrs.VALUE || reject("VALUE name not found"),
                DATE: DATE,
            }
            var CheckPO = ""
            try {
                CheckPO = await db.DBread(PackageUser, "PO", "PO_BODY|" + unparsedAttrs.PO_KEY)
                console.log("----------PO----------")
                console.log(CheckPO)

            } catch (error) {
                reject("PO not available")
            }
            if (CheckPO.TO != PackageUser) {  //ถ้าคนที่สร้างไม่ใช่คนที่ถูกออกใบให้
                reject(`You can't create Invoice with this PO, You must be ${CheckPO.TO} `)
                CheckPO = ""
            }
            if (PackageUser == unparsedAttrs.TO.toLowerCase()) {
                reject(`You can't create Invoice by yourself `)
                CheckPO = ""
            }
            if (CheckPO.FROM != unparsedAttrs.TO.toLowerCase()) { //คนที่เราจะส่งไม่ใช่คนที่ส่งใบพีโอมา
                reject(`You can't send this invoice for ${unparsedAttrs.TO.toLowerCase()}. did you mean ${CheckPO.FROM}? `)
                CheckPO = ""
            }
            var PRICE = CheckPO.VALUE
            if (unparsedAttrs.VALUE != PRICE) {
                permission_reject = "reject"
                reject("the value is not equal  ")
            }
            if (unparsedAttrs.PRODUCT.toLowerCase() != CheckPO.PRODUCT) {
                permission_reject = "reject"
                reject("the product is not equal  ")
            }
            if (unparsedAttrs.NUM_PRODUCT.toLowerCase() != CheckPO.NUM_PRODUCT) {
                permission_reject = "reject"
                reject("the number of product is not equal  ")
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
                PackageUser,
            ]
            try {
                var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
                var Status = await Get_Status(getkey, companydata)
                console.log(Status)
            } catch (error) {
                reject("Company not found.")
                permission_reject = "reject"
            }
            if (Status != "company") {
                reject("You must send to Company only.")
                permission_reject = "reject"
            }
            const key = new NodeRSA();
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
            console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
            console.log('HASH Ciphertext Complete!!! : ', hash)
            var HASH_USER = crypto.createHash('sha256')
                .update(PackageUser)
                .digest('hex');
            try {
                var Hash_PO = await db.DBreadHash(PackageUser, "PO", "PO_BODY|" + unparsedAttrs.PO_KEY)
            } catch (error) {
                reject("Can't read hash value from PO. ")
                CheckPO = ""
            }
            args = [hash,
                ciphertext,
                INVOICE_KEY,
                Hash_PO,
                HASH_USER,
            ];
            var collections = "INVOICE"
            try {
                CheckPO = await db.DBread(PackageUser, collections, "INVOICE_BODY|" + INVOICE_KEY)
                permission_reject = "reject"
                reject("Already have  Invoice")   /// มีเลขอินวอยซ้ำไหม
            } catch (error) {
                // console.log(error)
            }
            if (CheckPO != "" && permission_reject != "reject") {  /// po ต้องไม่ว่าง และ invoice ยังไม่ถูกใช้
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
                    let resultParsed = result.result.toString('utf8');
                    console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                    console.log(resultParsed)
                    console.log(ciphertext);
                    // var My_publckey = await db.DBreadPublic(unparsedAttrs.FROM,"CompanyData" , unparsedAttrs.FROM)
                    // key.importKey(My_publckey, 'pkcs1-public-pem');
                    // const MY_ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
                    // var My_hash = crypto.createHash('sha256')          //HASH FUCTION
                    // .update(MY_ciphertext)
                    // .digest('hex');
                    // db.DBwrite(unparsedAttrs.FROM, collections, My_hash, MY_ciphertext)
                    db.DBwrite3(PackageUser, collections, "INVOICE_BODY|" + INVOICE_KEY, DATABASE, hash)
                    ////////////


                    resolve({
                        message: {
                            TO: parsedAttrs.TO.toLowerCase(),
                            FROM: PackageUser,
                            TYPE: "INVOICE",
                            INVOICE_KEY: INVOICE_KEY,
                            PO_KEY: parsedAttrs.PO_KEY,
                            PRODUCT: unparsedAttrs.PRODUCT.toLowerCase(),
                            NUM_PRODUCT: unparsedAttrs.NUM_PRODUCT,
                            VALUE: parsedAttrs.VALUE,
                            DATE: parsedAttrs.DATE,
                        }
                    });
                }).catch((e) => {
                    logger.error(`${functionName}  ${e}`);
                    reject(` ${e}`);
                });
            } else {
                reject(" reject")
            }

        })
    }

    Loan(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.Loan(unparsedAttrs)]';
        return new Promise(async (resolve, reject) => {
            var permission_reject = ""
            if (PERMISSION != "company") {
                permission_reject = "reject"
                reject("permission denied. You can't use this function ")
            }
            let invokeObject = {};
            var parsedAttrs = {}
            let getkey = {};
            let companydata = [];
            var collections = ""
            var permission = ""
            let args = []
            const key = new NodeRSA();
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();

             /////////////////////

             var LOAN_K = 1
             var LOAN_old = 0
             getkey = {
                 enrollID: self.enrollID,
                 fcnname: GetValue,
 
             };
             companydata = ["LOAN_OLD",
                 PackageUser
             ]
             try {
                LOAN_old = await Get_Valua(getkey, companydata)  //ไป get key from world
                 // console.log("PO___"+PO_old.VALUE)
             } catch (error) {
                 // reject("Company not found.")
                 // Check = "reject"
             }
             invokeObject = {
                 enrollID: self.enrollID,
                 fcnname: Push_B,
             };
             // console.log("PO___"+parseInt('10 lions', PO_old.VALUE))
             var loan_key = Math.floor(LOAN_K+parseInt('10 lions', LOAN_old.VALUE))
             var LOAN_KEY = loan_key.toString()
             args = ["LOAN_OLD", LOAN_KEY
             ];
             // console.log("args___"+args)
             await Push_Block(invokeObject, args)
             // console.log("55")
             ////////////////////

            if (unparsedAttrs.DOC_LOAN.toUpperCase() != "PO" && unparsedAttrs.DOC_LOAN.toUpperCase() != "INVOICE") {
                reject("DOC_LOAN name not found")
            } else collections = unparsedAttrs.DOC_LOAN.toUpperCase()
            console.log(collections)
            console.log("---------------------------------------------")
            var Check_Loan = ""
            try {
                Check_Loan = await db.DBread(PackageUser, `LOAN_${collections}`, `LOAN_${collections}_BODY|${PackageUser}|${unparsedAttrs.BANK.toLowerCase()}|` + LOAN_KEY)
                console.log(Check_Loan)
                console.log("---------------------------------------------")
            } catch (error) {
                // reject("Loan already been used")
            }
            try {
                var data = await db.DBread(PackageUser, collections, `${collections}_BODY|` + unparsedAttrs.KEY)
            } catch (error) {
                reject("data not available")
            }
            try {
                var SALT = await db.DBread(PackageUser, "PO", "PO_SALT|" + data.PO_KEY)
            } catch (error) {
                reject("SALT not available")
                Check_Loan = "can't"
            }
            if (collections == "INVOICE") {
                parsedAttrs = {
                    BANK: unparsedAttrs.BANK.toLowerCase() || reject("Company name not found"),
                    FROM: PackageUser, 
                    TYPE: `LOAN_${collections}`,
                    LOAN_KEY: LOAN_KEY,
                    PO_KEY: data.PO_KEY,
                    INVOICE_KEY: data.INVOICE_KEY || reject("KEY name not found"),
                    DATE: DATE,
                    INVOICE: data,
                    SALT: SALT,
                }
                try {
                    var Hash_DOC = await db.DBreadHash(PackageUser, collections, "INVOICE_BODY|" + unparsedAttrs.KEY)
                } catch (error) {
                    reject("Can't read hash value from INVOICE. ")
                    permission_reject = "reject"
                }
            } else {
                parsedAttrs = {
                    BANK: unparsedAttrs.BANK.toLowerCase() || reject("Company name not found"),
                    FROM: PackageUser, 
                    TYPE: `LOAN_${collections}`,
                    LOAN_KEY: LOAN_KEY,
                    PO_KEY: data.PO_KEY,
                    DATE: DATE,
                    PO: data,
                    SALT: SALT,
                }
                try {
                    var Hash_DOC = await db.DBreadHash(PackageUser, collections, "PO_BODY|" + unparsedAttrs.KEY)
                } catch (error) {
                    reject("Can't read hash value from PO. ")
                    permission_reject = "reject"
                }
                if (PackageUser == data.FROM) {
                    reject("Your are Can't loan by PO")
                    permission = "Can't"
                }
            }

            console.log(parsedAttrs)
            // var COMPANY = unparsedAttrs.COMPANY // อันเดียวกีับ to แก้ให้เป็นอันเดียวกัน
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: Loan,
            };
            ///////////////
            getkey = {
                enrollID: self.enrollID,
                fcnname: GetValue,

            };
            companydata = [unparsedAttrs.BANK.toLowerCase(),
                PackageUser            ]
            try {
                var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
                var Status = await Get_Status(getkey, companydata)
                console.log(Status)
            } catch (error) {
                reject("Bank not found.")
                permission_reject = "reject"
            }
            if (Status != "bank") {
                reject("You must send to Bank only.")
                permission_reject = "reject"
            }
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
            console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
            console.log('HASH Ciphertext Complete!!! : ', hash)
            var HASH_USER = crypto.createHash('sha256')
                .update(PackageUser)
                .digest('hex');
            args = [hash, ciphertext, Hash_DOC, HASH_USER
            ];
            var collectionss = `LOAN_${collections}`
            if (!Check_Loan && !permission && permission_reject != "reject") {
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
                    console.log("toBC");
                    let resultParsed = result.result.toString('utf8');
                    console.log(PackageUser);
                    db.DBwrite3(PackageUser, collectionss, `LOAN_${collections}_BODY|${PackageUser}|${unparsedAttrs.BANK.toLowerCase()}|` + LOAN_KEY, parsedAttrs, hash)
                    resolve({
                        message: {
                            BANK: parsedAttrs.BANK.toLowerCase(),
                            FROM: PackageUser,
                            TYPE: parsedAttrs.TYPE,
                            INVOICE_KEY: data.INVOICE_KEY,
                            PO_KEY: data.PO_KEY,
                            LOAN_KEY: LOAN_KEY,
                            DATE: parsedAttrs.DATE,
                            INVOICE: data,
                            INVOICE2: data.KEY,
                        }
                    });
                }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
                    logger.error(`${functionName}  ${e}`);
                    reject(` ${e}`);
                });
            }
            else {
                reject("Loan already been used")
            }

        })

    }

    Request_Verify(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.Request_Verify(unparsedAttrs)]';
        return new Promise(async (resolve, reject) => {
            var permission_reject = ""
            if (PERMISSION != "bank") {
                permission_reject = "reject"
                reject("permission denied. You can't use this function ")
            }
            let invokeObject = {};
            var collections = ""
            let getkey = {};
            let companydata = [];
            var check_loan = ""
            const key = new NodeRSA();
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
            var SALT2 = getRandomInt();
            if (unparsedAttrs.DOC_LOAN.toUpperCase() != "PO" && unparsedAttrs.DOC_LOAN.toUpperCase() != "INVOICE") {
                reject("DOC_LOAN name not found")
            } else collections = unparsedAttrs.DOC_LOAN.toUpperCase()
            console.log(collections)
            console.log("---------------------------------------------")
            if (collections == "INVOICE") {
                try {
                    var INVOICE = await db.DBread(PackageUser || reject("BANK name not found"), collections, `${collections}_BODY|` + unparsedAttrs.KEY)
                } catch (error) {
                    reject("Invoice information not available")  /// หาไม่เจอ
                }
                if (unparsedAttrs.TO.toLowerCase() == INVOICE.FROM) {
                    try {
                        var LOAN = await db.DBread(PackageUser || reject("BANK name not found"), `LOAN_${collections}`, `LOAN_${collections}_BODY|${INVOICE.TO.toLowerCase()}|${PackageUser}|` + unparsedAttrs.LOAN_KEY)
                        console.log("LOAN" + LOAN)
                    } catch (error) {
                        check_loan = "can't"
                        reject(`failed to send. did you mean ${INVOICE.TO.toLowerCase()} ?`)
                    }

                } else if (unparsedAttrs.TO.toLowerCase() == INVOICE.TO) {
                    try {
                        var LOAN = await db.DBread(PackageUser || reject("BANK name not found"), `LOAN_${collections}`, `LOAN_${collections}_BODY|${INVOICE.FROM.toLowerCase()}|${PackageUser}|` + unparsedAttrs.LOAN_KEY)
                        console.log("LOAN" + LOAN)
                    } catch (error) {
                        check_loan = "can't"
                        reject(`failed to send. did you mean ${INVOICE.FROM.toLowerCase()} ?`)
                    }
                }
                try {
                    var SALT = await db.DBread(PackageUser || reject("BANK name not found"), "PO", "PO_SALT|" + INVOICE.PO_KEY)
                } catch (error) {
                    reject("Salt not available")
                }

                console.log(SALT)
                ///////////////
                var parsedAttrs = {
                    VERIFY: "Verify",
                    BANK: PackageUser,
                    TO: INVOICE.TO.toLowerCase(),
                    FROM: INVOICE.FROM.toLowerCase(),
                    TYPE: INVOICE.TYPE,
                    INVOICE_KEY: INVOICE.INVOICE_KEY,
                    PO_KEY: INVOICE.PO_KEY,
                    VALUE: INVOICE.VALUE,
                    DATE: INVOICE.DATE,
                    SALT: SALT,
                    SALT2: SALT2,  /// ของตริงใช้ SALT ใหม่ที่เจนใหม่
                    // SALT: SALT,
                }
            } else {
                try {
                    var PO = await db.DBread(PackageUser || reject("BANK name not found"), collections, `${collections}_BODY|` + unparsedAttrs.KEY)
                    console.log("PO")
                    console.log(PO)
                } catch (error) {
                    reject("PO information not available. Please try changing the code.")  /// หาไม่เจอ
                }
                if (unparsedAttrs.TO.toLowerCase() == PO.TO) {
                    console.log(unparsedAttrs.TO.toLowerCase())
                    console.log(PO.FROM)
                    check_loan = "can't"
                    reject(`failed to send. did you mean ${PO.FROM.toLowerCase()} ?`)
                } else if (unparsedAttrs.TO.toLowerCase() == PO.FROM) {
                    try {
                        console.log(unparsedAttrs.TO.toLowerCase())
                        console.log(PO.TO)
                        var LOAN = await db.DBread(PackageUser || reject("BANK name not found"), `LOAN_${collections}`, `LOAN_${collections}_BODY|${PO.TO.toLowerCase()}|${PackageUser}|` + unparsedAttrs.LOAN_KEY)
                        console.log("LOAN" + LOAN)
                    } catch (error) {
                        check_loan = "can't"
                        reject(`Unable to read data. Please enter LOAN KEY correctly.`)
                    }
                } else {
                    check_loan = "can't"
                    reject(`Please enter the correct company name.did you mean ${PO.TO.toLowerCase()} ?`)
                }
                try {
                    var SALT = await db.DBread(PackageUser || reject("BANK name not found"), "PO", "PO_SALT|" + PO.PO_KEY)
                } catch (error) {
                    reject("Salt not available")
                }

                console.log(SALT)
                ///////////////
                var parsedAttrs = {
                    VERIFY: "Verify",
                    BANK: PackageUser,
                    TO: PO.TO.toLowerCase(),
                    FROM: PO.FROM.toLowerCase(),
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
            PackageUser || reject("BANK name not found"),
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
            var HASH_USER = crypto.createHash('sha256')
                .update(PackageUser)
                .digest('hex');
            let args = [hash, ciphertext, HASH_USER
            ];
            console.log("-------------------------------------------");
            console.log(args + "Testttttttttttttttttttttttttttt");
            if (!check_loan && permission_reject != "reject") {
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then((result) => {
                    console.log("toBC");
                    let resultParsed = result.result.toString('utf8');
                    // db.DBwrite(unparsedAttrs.FROM, collections, hash, ciphertext)
                    // db.DBwrite(unparsedAttrs.FROM, collections, unparsedAttrs.LOAN_KEY, hash)
                    if (collections == "INVOICE") {
                        resolve({
                            message: {
                                LOAN_KEY: unparsedAttrs.LOAN_KEY || reject("LOAN_KEY name not found"),
                                INVOICE: "-------------",
                                TO: parsedAttrs.TO.toLowerCase(),
                                FROM: parsedAttrs.FROM.toLowerCase(),
                                TYPE: parsedAttrs.TYPE,
                                INVOICE_KEY: parsedAttrs.INVOICE_KEY,
                                PO_KEY: INVOICE.PO_KEY,
                                VALUE: parsedAttrs.VALUE,
                                DATE: parsedAttrs.DATE,
                                SALT: parsedAttrs.SALT,
                                NEWSALT: SALT2,
                            }
                        });
                    } else {
                        resolve({
                            message: {
                                LOAN_KEY: unparsedAttrs.LOAN_KEY || reject("LOAN_KEY name not found"),
                                PO: "-------------",
                                TO: parsedAttrs.TO.toLowerCase(),
                                FROM: parsedAttrs.FROM.toLowerCase(),
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
            } else {
                reject("LOAN information not available 2 ")
            }

        })

    }


    endorse_loan(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.endorse_loan(unparsedAttrs)]';
        return new Promise(async (resolve, reject) => {
            var permission_reject = ""
            if (PERMISSION != "bank") {
                permission_reject = "reject"
                reject("permission denied. You can't use this function ")
            }
            const key = new NodeRSA();
            let invokeObject = {};
            let getkey = {};
            let companydata = {};
            let Loan_Info = {};
            var Check_endorse = ""
            var CHECK = ""
            var DATE = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();
            var parsedAttrs = {
                TO: unparsedAttrs.TO || reject("Company name not found"),
                BANK: PackageUser,
                TYPE: "ENDORSE_LOAN", // API เจนเอง
                DOC_LOAN: unparsedAttrs.DOC_LOAN.toUpperCase(),
                LOAN_KEY: unparsedAttrs.LOAN_KEY || reject("LOAN_KEY name not found"),//INVOICE
                PRICE_LOAN: unparsedAttrs.PRICE_LOAN || reject("PRICE_LOAN name not found"),
                DATE: DATE,
            }
            getkey = {
                enrollID: self.enrollID,
                fcnname: GetValue,

            };
            companydata = [unparsedAttrs.TO,
                PackageUser            ]
            try {
                var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
                var Status = await Get_Status(getkey, companydata)
                console.log(Status)
            } catch (error) {
                reject("Company not found.")
                permission_reject = "reject"
            }
            if (Status != "company") {
                reject("You must send to Bank only.")
                permission_reject = "reject"
            }
            try {
                console.log("error5")
                Check_endorse = await db.DBread(PackageUser, "ENDORSE_LOAN", `ENDORSE_LOAN_BODY|${unparsedAttrs.TO.toLowerCase()}|${PackageUser}|` + `${unparsedAttrs.DOC_LOAN}_${unparsedAttrs.LOAN_KEY}`)
                console.log("error6")
            } catch (error) {
                console.log("err")
            }
            if (unparsedAttrs.PRICE_LOAN <= 0) {
                var CHECK = "err"
                reject("You can't enter the amount of 0 or less.")
            }
            if (unparsedAttrs.DOC_LOAN.toUpperCase() == "INVOICE") {
                try {
                    var Check_Invoice = await db.DBread(PackageUser, "LOAN_INVOICE", `LOAN_INVOICE_BODY|${unparsedAttrs.TO.toLowerCase()}|${PackageUser}|` + unparsedAttrs.LOAN_KEY || reject("LOAN_KEY name not found"))
                    var Invoice = await db.DBread(PackageUser, "INVOICE", `INVOICE_BODY|` + Check_Invoice.INVOICE_KEY)
                    var WORLD_KEY = unparsedAttrs.TO + "|" + Invoice.INVOICE_KEY + "|" + Invoice.PO_KEY
                    var hash_WORLD_KEY = crypto.createHash('sha256')          //HASH FUCTION
                        .update(WORLD_KEY)
                        .digest('hex');
                    var PRICE = Invoice.VALUE
                    if (unparsedAttrs.PRICE_LOAN > PRICE) {
                        permission_reject = "reject"
                        reject("Amount over")
                    }
                } catch (error) {
                    CHECK = "err"
                    reject("Invoice or Loan information not available2")
                }

            } else {
                try {
                    var Check_PO = await db.DBread(PackageUser, "LOAN_PO", `LOAN_PO_BODY|${unparsedAttrs.TO.toLowerCase()}|${PackageUser}|` + unparsedAttrs.LOAN_KEY || reject("KEY name not found"))
                    var PO = await db.DBread(PackageUser, "PO", `PO_BODY|` + Check_PO.PO_KEY)
                    var WORLD_KEY = unparsedAttrs.TO + "|" + PO.PO_KEY
                    var hash_WORLD_KEY = crypto.createHash('sha256')          //HASH FUCTION
                        .update(WORLD_KEY)
                        .digest('hex');
                    var PRICE = PO.VALUE
                    if (unparsedAttrs.PRICE_LOAN > PRICE) {
                        permission_reject = "reject"
                        reject("Amount over")
                    }
                } catch (error) {
                    CHECK = "err"
                    reject("PO or Loan information not available 2")
                }

            }

            invokeObject = {
                enrollID: self.enrollID,
                fcnname: PushInBlockchain,
            };
            console.log("555555555555555");
            console.log(WORLD_KEY);
            console.log(hash_WORLD_KEY);
            Loan_Info = [hash_WORLD_KEY,
                PackageUser            ]
            // console.log('ciphertext:////////// ');
            // console.log(Loan_Info);
            // console.log(companydata);
            var Check_loan = ""
            try {
                Check_loan = await Get_Valua(getkey, Loan_Info)
            } catch (error) {
                // console.log(error)
            }
            if (Check_loan != "") {
                reject("Has already been LOAN")
            }
            console.log('ciphertext:////////// ', Check_loan);
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            const ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
            // console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
            var HASH_USER = crypto.createHash('sha256')
                .update(PackageUser)
                .digest('hex');
            let args = [hash, ciphertext, HASH_USER
            ];
            if (permission_reject != "reject" && !Check_loan && !CHECK && Check_endorse == "") {
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
                    let resultParsed = result.result.toString('utf8');
                    var collections = "ENDORSE_LOAN"
                    db.DBwrite3(PackageUser, collections, `ENDORSE_LOAN_BODY|${unparsedAttrs.TO.toLowerCase()}|${PackageUser}|` + `${unparsedAttrs.DOC_LOAN}_${unparsedAttrs.LOAN_KEY}`, parsedAttrs, hash)
                    // db.DBwrite3(unparsedAttrs.BANK, collections, `${collections}_BODY|${INFORMATION.BANK}|` +`${unparsedAttrs.DOC_LOAN}_${unparsedAttrs.KEY}`, parsedAttrs,hash)

                    resolve({
                        message: {
                            TO: parsedAttrs.TO,
                            BANK: PackageUser,
                            TYPE: parsedAttrs.TYPE,
                            LOAN_KEY: parsedAttrs.LOAN_KEY,
                            PRICE_LOAN: parsedAttrs.PRICE_LOAN,
                            DATE: parsedAttrs.DATE,
                        }
                    });
                }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
                    logger.error(`${functionName}  ${e}`);
                    reject(` ${e}`);
                });
            } else {
                reject("ENDORSE_LOAN has already been used")
            }

        })

    }
    Accept(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.Accept(unparsedAttrs)]';
        return new Promise(async (resolve, reject) => {
            var permission_reject = ""
            if (PERMISSION != "company") {
                permission_reject = "reject"
                reject("permission denied. You can't use this function ")
            }
            let invokeObject = {};
            let getkey = {};
            let companydata = {};
            getkey = {
                enrollID: self.enrollID,
                fcnname: GetValue,

            };
            companydata = [unparsedAttrs.BANK,
                PackageUser,
            ]
            try {
                var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
                var Status = await Get_Status(getkey, companydata)
                // var Status = await Get_Status(getkey, companydata)
            } catch (error) {
                reject("Bank not found.")
                permission_reject = "reject"
            }
            if (Status != "bank") {
                reject("You must send to Bank only.")
                permission_reject = "reject"
            }
            try {
                var hash = await db.DBreadHash(PackageUser.toLowerCase(), "ENDORSE_LOAN", `ENDORSE_LOAN_BODY|${PackageUser}|${unparsedAttrs.BANK.toLowerCase()}|${unparsedAttrs.DOC_LOAN.toLowerCase()}_${unparsedAttrs.LOAN_KEY}` )
            } catch (error) {
                reject("hash information not available")
            }
            try {
                companydata = [hash,
                    PackageUser,
                    ]
                var StatusReject = await Get_Status(getkey, companydata)  //ไป get key from world
            } catch (error) {
                reject(" not found.")
                permission_reject = "reject"
            }
            if (StatusReject == "reject") {
                reject("This Endorse loan has been reject.")
                permission_reject = "reject"
            }
            if (unparsedAttrs.DOC_LOAN.toLowerCase() == "invoice") {
                console.log("+++++++++++++++++++++++++++++++++++++++++");
                console.log("INVOICE");
                try {
                    // var Check_Invoice = await db.DBread(unparsedAttrs.BANK || reject("Bank name not found"), "LOAN_INVOICE", `LOAN_INVOICE_BODY|${unparsedAttrs.TO.toLowerCase()}|${unparsedAttrs.BANK.toLowerCase()}|` + unparsedAttrs.LOAN_KEY || reject("LOAN_KEY name not found"))

                    var Endorse_loan = await db.DBread(PackageUser, "ENDORSE_LOAN", `ENDORSE_LOAN_BODY|${PackageUser}|${unparsedAttrs.BANK.toLowerCase()}|${unparsedAttrs.DOC_LOAN.toLowerCase()}_${unparsedAttrs.LOAN_KEY}`)
                    var LOAN_INVOICE = await db.DBread(PackageUser, "LOAN_INVOICE", `LOAN_INVOICE_BODY|${PackageUser}|${unparsedAttrs.BANK.toLowerCase()}|` + unparsedAttrs.LOAN_KEY || reject("LOAN_KEY name not found"))
                } catch (error) {
                    reject("Endorse_loan information not available555")
                }

                try {
                    var Invoice = LOAN_INVOICE.INVOICE
                } catch (error) {
                    reject("Invoice information not available")
                }
                try {
                    var PO = await db.DBread(PackageUser, "PO", `PO_BODY|` + Invoice.PO_KEY || reject("POKEY not found"))
                } catch (error) {
                    reject("Invoice information not available")
                }
                var WORLD_KEY = PackageUser + "|" + Invoice.INVOICE_KEY + "|" + Invoice.PO_KEY
                console.log(WORLD_KEY);
            } else {
                try {
                    console.log("---------------------------------");
                    var Endorse_loan = await db.DBread(PackageUser, "ENDORSE_LOAN", `ENDORSE_LOAN_BODY|${PackageUser}|${unparsedAttrs.BANK.toLowerCase()}|${unparsedAttrs.DOC_LOAN.toLowerCase()}_${unparsedAttrs.LOAN_KEY}`)
                    var LOAN_PO = await db.DBread(PackageUser, "LOAN_PO", `LOAN_PO_BODY|${PackageUser}|${unparsedAttrs.BANK.toLowerCase()}|${unparsedAttrs.LOAN_KEY}`)
                } catch (error) {
                    reject("Endorse_loan information not available")
                }
                try {
                    var PO = LOAN_PO.PO
                } catch (error) {
                    reject("PO information not available")
                }
                var WORLD_KEY = PackageUser + "|" + PO.PO_KEY
                console.log(WORLD_KEY);
            }

            invokeObject = {
                enrollID: self.enrollID,
                fcnname: PushInBlockchain,
            };
            // ///////////////
            const key = new NodeRSA();
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            let ciphertext = key.encrypt(Endorse_loan, 'base64', 'utf8');
            // console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(WORLD_KEY)
                .digest('hex');
            var HASH_USER = crypto.createHash('sha256')
                .update(unparsedAttrs.BANK.toLowerCase())
                .digest('hex');
            let args = [hash, ciphertext, HASH_USER
            ];
            if (permission_reject != "reject") {
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
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
            } else {
                reject("permission denied. You can't use this function ")
            }

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
                BANK: unparsedAttrs.BANK,
                FROM: unparsedAttrs.FROM, //ไปอ่านไฟล์คอนฟิกของบริษัทเราเอง 
                TYPE: "Auto Verify",
                DATE: DATE,
                PO: unparsedAttrs.PO,
                SALT: unparsedAttrs.SALT,
                SALT2: unparsedAttrs.SALT2,
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
            unparsedAttrs.FROM,
            ]
            var Publickey = await Get_Key(getkey, companydata)  //ไป get key from world
            // console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-*******************"+Publickey)
            const key = new NodeRSA();
            key.importKey(Publickey.toString(), 'pkcs1-public-pem');
            let ciphertext = key.encrypt(parsedAttrs, 'base64', 'utf8');
            // console.log('ciphertext: ', ciphertext);
            var hash = crypto.createHash('sha256')          //HASH FUCTION
                .update(ciphertext)
                .digest('hex');
            var hash_PO = crypto.createHash('sha256')          //HASH FUCTION
                .update(unparsedAttrs.FROM)
                .digest('hex');
            // console.log('HASH Ciphertext Complete!!! : ', hash)
            let args = [hash, ciphertext, hash_PO
            ];
            blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
                let resultParsed = result.result.toString('utf8');
                resolve({
                    message: {
                        BANK: parsedAttrs.BANK,
                        FROM: parsedAttrs.FROM,
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

    Reject(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.Reject(unparsedAttrs)]';
        return new Promise(async (resolve, reject) => {
            let invokeObject = {};
            var USER = PackageUser
            var TYPE = unparsedAttrs.TYPE.toUpperCase()
            var KEY = unparsedAttrs.KEY
            let args = []
            if (TYPE == "PO") {
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: Reject,
                };
                try {
                    var hash = await db.DBreadHash(USER, TYPE, `${TYPE}_BODY|${KEY}`)
                } catch (error) {
                    reject("PO information not available")
                }
            } else if (TYPE == "INVOICE") {
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: Reject_Invoice,
                };
                try {
                    var Invoice = await db.DBread(USER, TYPE, `${TYPE}_BODY|${KEY}`)
                } catch (error) {
                    reject("Invoice information not available")
                }
                try {
                    var hash = await db.DBreadHash(USER, TYPE, `${TYPE}_BODY|${KEY}`)
                } catch (error) {
                    reject("Invoice information not available")
                }
                try {
                    var hash_PO = await db.DBreadHash(USER, "PO", `PO_BODY|${Invoice.PO_KEY}`)
                } catch (error) {
                    reject("Hash PO information not available")
                }
            } else {
                reject("PO?  INVOICE?")
            }
            var HASH_USER = crypto.createHash('sha256')   //HASH FUCTION
                .update(USER)
                .digest('hex');
            if (TYPE == "PO") {
                args = [hash, TYPE, HASH_USER
                ];
            } else {
                if (TYPE == "INVOICE") {
                    args = [hash, TYPE, HASH_USER, hash_PO
                    ];
                } else {
                    reject("PO?  INVOICE? 2")
                }
            }
            console.log("-----------------")
            console.log(args)
            console.log("-----------------")
            blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
                let resultParsed = result.result.toString('utf8');
                resolve({
                    message: {
                        USER: PackageUser,
                        TYPE: unparsedAttrs.TYPE.toUpperCase(),
                        KEY: unparsedAttrs.KEY,
                        result: "Reject Success !!"
                    }
                });
            }).catch((e) => { /// e เปลี่ยนเป้น err ดีๆ
                logger.error(`${functionName}  ${e}`);
                reject(` ${e}`);
            });
        })

    }
    RejectEndorse(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.RejectEndorse(unparsedAttrs)]';
        return new Promise(async (resolve, reject) => {
            let invokeObject = {};
            var TO = unparsedAttrs.TO.toLowerCase()
            var USER = PackageUser
            var TYPE = "ENDORSE_LOAN"
            var DOC_LOAN = unparsedAttrs.DOC_LOAN.toUpperCase()
            var LOAN_KEY = unparsedAttrs.LOAN_KEY
            let args = []
            invokeObject = {
                enrollID: self.enrollID,
                fcnname: Reject,
            };
            if (DOC_LOAN == "PO") {
                try {
                    var hash = await db.DBreadHash(USER, TYPE, `${TYPE}_BODY|${TO}|${USER}|${DOC_LOAN.toLowerCase()}_${LOAN_KEY}`)
                } catch (error) {
                    reject(`${TYPE} PO information not available`)
                }
            } else if (DOC_LOAN == "INVOICE") {
                try {
                    var hash = await db.DBreadHash(USER, TYPE, `${TYPE}_BODY|${TO}|${USER}|${DOC_LOAN.toLowerCase()}_${LOAN_KEY}`)
                } catch (error) {
                    reject(`${TYPE} Invoice information not available`)
                }
            } else {
                reject("PO?  INVOICE?")
            }
            var HASH_USER = crypto.createHash('sha256')   //HASH FUCTION
                .update(USER)
                .digest('hex');
                args = [hash, TYPE, HASH_USER
                ];
            console.log("-----------------")
            console.log(args)
            console.log("-----------------")
            blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
                let resultParsed = result.result.toString('utf8');
                resolve({
                    message: {
                        USER: PackageUser,
                        TYPE: TYPE,
                        KEY: unparsedAttrs.KEY,
                        result: "Reject Success !!"
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
            var COMPANY = PackageUser
            ParseCheckPO(unparsedAttrs).then((parsedAttrs) => {
                console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: GetValue,
                    attrs: parsedAttrs
                };
                // console.log("1111111111111111111111111111111111111111");
                console.log(invokeObject);
                console.log(invokeObject.attrs);
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    console.log(resultParsed.VALUE );

                    resolve({
                        message: { //ค่าที่ ปริ้นออกมาจาก json
                            // User: parsedAttrs[1],
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
    Get(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.Get(unparsedAttrs)]';
        // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {
            let invokeObject = {};
            var hash
            var COMPANY = unparsedAttrs.COMPANY
            let args = [];
            var companydata = [];
            ParseCheckPO(unparsedAttrs).then(async (parsedAttrs) => {
                var ID = unparsedAttrs.KEY
                var collections = unparsedAttrs.TYPE.toUpperCase()
                console.log(PackageUser)
                console.log(collections)
                console.log(`${collections}_BODY|${ID}`)
                try {
                    hash = await db.DBreadHash(PackageUser, collections, `${collections}_BODY|${ID}`)
                } catch (error) {
                    reject("Data not found")
                }
                // console.log('parsedAttrs:' + parsedAttrs);
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
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, args, INVOKE_ATTRIBUTES).then(async (result) => {
                    console.log("toBC");
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    // console.log(resultParsed.VALUE + "55555555555555555");
                    const key = new NodeRSA();
                    ///ดึงไพรเวทจากดาต้าเบส
                    // var pemFile = path.resolve(__dirname, `./${COMPANY}/private_key.pem`)
                    // var keyprivate = fs.readFileSync(pemFile)
                    // var publickey = await Get_Key(invokeObject, companydata)
                    var keyprivate = await db.DBreadprivate(PackageUser, "CompanyData", PackageUser)
                    // console.log(keyprivate);
                    key.importKey(keyprivate, 'pkcs1-private-pem');
                    var decrypted
                    try {
                        decrypted = JSON.parse(key.decrypt(resultParsed.VALUE, 'utf8'));
                    } catch (error) {
                        reject("Permission denied. You can't access this information.")
                    }
                    console.log('decrypted: ', decrypted);
                    resolve({
                        message: { //ค่าที่ ปริ้นออกมาจาก json
                            // User: parsedAttrs[1],
                            // ID: parsedAttrs[0],
                            TO: decrypted.TO,
                            FROM: decrypted.FROM,
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
                            FROM: decrypted.FROM,
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
        return new Promise(async (resolve, reject) => {

            console.log(PackageUser)
            console.log(unparsedAttrs.TYPE)
            console.log(`${unparsedAttrs.TYPE}_BODY` + unparsedAttrs.KEY)
            var VALUE = await db.DBread(PackageUser, unparsedAttrs.TYPE, `${unparsedAttrs.TYPE}_BODY|` + unparsedAttrs.KEY)
            console.log(VALUE);
            console.log("----------------------------------------");
            resolve({
                message: {
                    INFO: VALUE,
                }
            });
        });
    }
    Get_Blockchain(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.Get_Blockchain(unparsedAttrs)]';
        var getkey = {}
        var companydata = {}
        return new Promise(async (resolve, reject) => {
            getkey = {
                enrollID: self.enrollID,
                fcnname: GetValue,

            };
            companydata = [unparsedAttrs.KEY,
                PackageUser,
            ]
            console.log(getkey)
            console.log(companydata)
            var VALUE = await Get_Valua(getkey, companydata)
            console.log(VALUE)
            resolve({
                message: {
                    INFO: VALUE,
                }
            });
        }).catch((e) => {
            logger.error(`${functionName}  ${e}`);
            reject(` ${e}`);
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
        var Check = ""
        return new Promise((resolve, reject) => {

            let infokey = keypair.generatekeypair(CompanyInfo.Name.toLowerCase())
            var WorldState_key = (CompanyInfo.Name.toLowerCase())
            var STATUS = (CompanyInfo.STATUS.toLowerCase())
            if (STATUS != "company" && STATUS != "bank") {
                reject("Please input company or bank")
                Check = "reject"
            }
            // var WorldState_key = (CompanyInfo.ID + "|" + CompanyInfo.Role)
            // var Companyname = (CompanyInfo.Name)
            console.log('Add local db');
            // เอาไปใส่ในดาต้าเบสด้วย
            console.log('Add world state : ' + WorldState_key);


            let invokeObject = {};
            ParseKeyStore(WorldState_key, infokey.Public_key, STATUS).then((parsedAttrs) => {
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: StoreKey,
                    attrs: parsedAttrs
                };
                console.log('parsedAttrs:' + parsedAttrs);

                //ทำเป็น  อซิง ไปถาม พีช
                if (Check != "reject") {
                    blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                        // let resultParsed = JSON.parse(result.result.toString('utf8'));
                        // let resultParsed = result.result.toString('utf8');

                        //DATABASE for admin
                        db.AdminDBwrite(CompanyInfo.Name.toLowerCase(), infokey.Public_key, infokey.Private_key)

                        // db.AdminDBwrite(CompanyInfo.Name, infokey.Public_key, infokey.Private_key)

                        //DATABASE for USER
                        db.AdminForCom(CompanyInfo.Name.toLowerCase(), infokey.Public_key, infokey.Private_key)

                        resolve({
                            message: {
                                CompanyName: CompanyInfo.Name.toLowerCase(),
                                WorldState_Key: WorldState_key,
                                Public_Key: infokey.Public_key,
                                Private_Key: infokey.Privatekey,
                                STATUS: STATUS,


                            }
                        });
                    }).catch((e) => {
                        logger.error(`${functionName}  ${e}`);
                        reject(` ${e}`);
                    });
                } else {
                    reject("rect")
                }
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

//     LOANInvoice(unparsedAttrs) {
//         let self = this;
//         let functionName = '[toBC.LOANInvoice(unparsedAttrs)]';
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
//                 TYPE: "LOAN_INVOICE", // API เจนเอง
//                 LOAN_KEY: unparsedAttrs.LOAN_KEY || reject("LOAN_KEY name not found"),
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
//             var collections = "LOAN_INVOICE"
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
//                 db.DBwrite(unparsedAttrs.FORM, collections, unparsedAttrs.LOAN_KEY, hash)
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
//             var collections = "LOAN_INVOICE"
//             console.log("testttttttttttttttttttt");
//             var hash = await db.DBread(unparsedAttrs.BANK, collections, unparsedAttrs.LOAN_KEY)
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
//                 // var collections = "LOAN_INVOICE"
//                 // db.DBwrite(unparsedAttrs.FORM, collections, hash, ciphertext)
//                 // db.DBwrite(unparsedAttrs.FORM, collections, unparsedAttrs.LOAN_KEY, hash)
//                 // ////////////
//                 // db.DBwrite(unparsedAttrs.TO, collections, hash, ciphertext)        /// ให้แก้ไปเก็บลงในต้าเบสของคนที่เราจะส่งให้
//                 // db.DBwrite(unparsedAttrs.TO, collections, unparsedAttrs.LOAN_KEY, hash) /// ทาง event hub
//                 resolve({
//                     message: {
//                         LOAN_KEY: unparsedAttrs.LOAN_KEY,
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
//                 PRICE_LOAN: unparsedAttrs.PRICE_LOAN || reject("PRICE_LOAN name not found"),
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
//             if (unparsedAttrs.PRICE_LOAN > PRICE){
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
//                             PRICE_LOAN: parsedAttrs.PRICE_LOAN,
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
