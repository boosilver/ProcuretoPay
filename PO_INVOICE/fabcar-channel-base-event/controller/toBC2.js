const logger = require('../utils/logger');
const blockchain = require('../blockchain/service');
//const UUID = require('../../utils/UUID');

//Chaincode functions names
const CreatePO = 'CreatePO'; //func
const CheckPO = 'CheckPO'; //func
const CheckInvoice = 'CheckInvoice'; //func
const CreateInvoice = 'CreateInvoice'; //func
const CheckUser = 'CheckUser'; //func
const Borrow_Invoice_Seller = 'Borrow_Invoice_Seller'; //func
const Borrow_Invoice_Buyer = 'Borrow_Invoice_Buyer'; //func
const BorrowPO = 'BorrowPO'; //func
const INVOKE_ATTRIBUTES = ['devorgId']; //base


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
function ParseCreatePO(unparsedAttrs) { // for transfer 
    let functionName = '[toBC.CreatePO(unparsedAttrs)]';
    var DATE = day.getFullYear()+"-"+(day.getMonth()+1) +"-"+ day.getDate();
    return new Promise((resolve, reject) => {
        
        let parsedAttrs = {};
        //new kvs().putStore(inv_identity,unparsedAttrs)
        
        try {
            parsedAttrs = {
                PO_ID: unparsedAttrs.PO_ID || '',
                BUYER : unparsedAttrs.BUYER || '',
                DATE : DATE ,
                PRODUCT: unparsedAttrs.PRODUCT || '',
                NUM_PRODUCT: unparsedAttrs.NUM_PRODUCT || '',
                PRICE: unparsedAttrs.PRICE || '',
                SELLER: unparsedAttrs.SELLER || '',   
                LOT: unparsedAttrs.LOT || '',     
            }
            resolve([
                parsedAttrs.PO_ID.toString(),
                parsedAttrs.BUYER.toString(),
                parsedAttrs.DATE.toString(),
                parsedAttrs.PRODUCT.toString(),
                parsedAttrs.NUM_PRODUCT.toString(),
                parsedAttrs.PRICE.toString(),
                parsedAttrs.SELLER.toString(),
                parsedAttrs.LOT.toString(),
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
        var DATE = day.getFullYear()+"-"+(day.getMonth()+1) +"-"+ day.getDate();
        //new kvs().putStore(inv_identity,unparsedAttrs)
        
        try {
            parsedAttrs = {
                ID_INVOICE: unparsedAttrs.ID_INVOICE || '',
                PO_ID: unparsedAttrs.PO_ID || '',
                DATE : DATE ,
                NUMSENT: unparsedAttrs.NUMSENT || '', 
                INSTALLMENT_PRICE: unparsedAttrs.INSTALLMENT_PRICE || '', 
                SELLER : unparsedAttrs.SELLER || '',
                // PRODUCT: unparsedAttrs.PRODUCT || '',
                // PRICE: unparsedAttrs.PRICE || '',
                // BUYER: unparsedAttrs.BUYER || '',    
            }
            resolve([
                parsedAttrs.ID_INVOICE.toString(),
                parsedAttrs.PO_ID.toString(),
                parsedAttrs.DATE.toString(),
                parsedAttrs.NUMSENT.toString(),
                parsedAttrs.INSTALLMENT_PRICE.toString(),
                parsedAttrs.SELLER.toString(),
                // parsedAttrs.PRODUCT.toString(),
                // parsedAttrs.PRICE.toString(),
               
                // parsedAttrs.BUYER.toString(),
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
                PO_ID: unparsedAttrs.PO_ID || '',
                BUYER: unparsedAttrs.BUYER || '',
            }
            // console.log("ddddddddddddddddddddddddddd")
            // console.log(parsedAttrs)
            resolve([
                parsedAttrs.PO_ID.toString(),
                parsedAttrs.BUYER.toString(),
            ])
        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}
function ParseCheckPOI(unparsedAttrs) { //for cheak CheckBalance
    let functionName = '[toBC.ParseCheckPOI(unparsedAttrs)]';
    console.log("sssssssssssssssssssssssssssssssss")
    return new Promise((resolve, reject) => {
        
        let parsedAttrs = {};
        //new kvs().putStore(inv_identity,unparsedAttrs)
        
        try {
            parsedAttrs = {
                INVOICE_ID: unparsedAttrs.INVOICE_ID,
                PO_ID:  unparsedAttrs.PO_ID,
            }
            console.log(parsedAttrs)
            resolve(
                parsedAttrs,
                // parsedAttrs.PO_ID.toString(),
            )
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
                INVOICE_ID: unparsedAttrs.INVOICE_ID || '',
                PO_ID: unparsedAttrs.PO_ID || '',
                SELLER: unparsedAttrs.SELLER || '',
            }
            resolve([
                parsedAttrs.INVOICE_ID.toString(),
                parsedAttrs.PO_ID.toString(),
                parsedAttrs.SELLER.toString(),
            ])
        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}
function ParseBorrow_Invoice(unparsedAttrs) { //for cheak CheckBalance
    let functionName = '[toBC.ParseBorrow_Invoice(unparsedAttrs)]';

    return new Promise((resolve, reject) => {
        
        let parsedAttrs = {};
        //new kvs().putStore(inv_identity,unparsedAttrs)
        
        try {
            parsedAttrs = { //รับมาจาก json
                INVOICE_ID: unparsedAttrs.INVOICE_ID || '',
                PO_ID: unparsedAttrs.PO_ID || '',
                SELLER: unparsedAttrs.SELLER || '',
            }
            resolve([
                parsedAttrs.INVOICE_ID.toString(),
                parsedAttrs.PO_ID.toString(),
                parsedAttrs.SELLER.toString(),
            ])
        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}
function ParseBorrow_InvoiceB(unparsedAttrs) { //for cheak CheckBalance
    let functionName = '[toBC.ParseBorrow_InvoiceB(unparsedAttrs)]';

    return new Promise((resolve, reject) => {
        
        let parsedAttrs = {};
        //new kvs().putStore(inv_identity,unparsedAttrs)
        
        try {
            parsedAttrs = { //รับมาจาก json
                INVOICE_ID: unparsedAttrs.INVOICE_ID || '',
                PO_ID: unparsedAttrs.PO_ID || '',
                BUYER: unparsedAttrs.BUYER || '',
            }
            resolve([
                parsedAttrs.INVOICE_ID.toString(),
                parsedAttrs.PO_ID.toString(),
                parsedAttrs.BUYER.toString(),
            ])
        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}
function ParseBorrowPO(unparsedAttrs) { //for cheak CheckBalance
    let functionName = '[toBC.ParseCheckPO(unparsedAttrs)]';

    return new Promise((resolve, reject) => {
        
        let parsedAttrs = {};
        //new kvs().putStore(inv_identity,unparsedAttrs)
        
        try {
            parsedAttrs = { //รับมาจาก json
                PO_ID: unparsedAttrs.PO_ID || '',
                SELLER: unparsedAttrs.SELLER || '',
            }
            // console.log("ddddddddddddddddddddddddddd")
            // console.log(parsedAttrs)
            resolve([
                parsedAttrs.PO_ID.toString(),
                parsedAttrs.SELLER.toString(),
            ])
        } catch (e) {
            logger.error(`${functionName} Parsing attributes failed ${e}`);
            reject(`Sorry could not parse attributes: ${e}`);
        }

    });
}
function ParseCheckUser(unparsedAttrs) { //for cheak CheckBalance
    let functionName = '[toBC.ParseCheckUser(unparsedAttrs)]';

    return new Promise((resolve, reject) => {
        
        let parsedAttrs = {};
        //new kvs().putStore(inv_identity,unparsedAttrs)
        
        try {
            parsedAttrs = { //รับมาจาก json
                USER: unparsedAttrs.USER || '',
            }
            resolve([
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
       // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            ParseCreatePO(unparsedAttrs).then((parsedAttrs) => {
                // console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CreatePO,
                    attrs: parsedAttrs
                };
                // console.log(parsedAttrs)
                // console.log(parsedAttrs.User+"***********///////////////////******************")
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = result.result.toString('utf8');
                    // console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                    // console.log(resultParsed)
                //     let resultParsed = JSON.parse(result.result.toString('utf8'));
                    // logger.debug(resultParsed);
                    resolve({
                        message: {
                            PO_ID: parsedAttrs[0],
                            BUYER: parsedAttrs[1],
                            DATE:  parsedAttrs[2],
                            PRODUCT: parsedAttrs[3],
                            NUM_PRODUCT: parsedAttrs[4], 
                            PRICE: parsedAttrs[5], 
                            SELLER: parsedAttrs[6], 
                            LOT: parsedAttrs[7], 
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

    CreateInvoice(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.CreateInvoice(unparsedAttrs)]';
       // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            
            ParseCreateInvoice(unparsedAttrs).then((parsedAttrs) => {
                // console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CreateInvoice,
                    attrs: parsedAttrs
                };
                // console.log(invokeObject.enrollID+"+++++++++++++++++++++++++++++++++++++++++++++++++++++")
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    // let resultParsed = JSON.parse(result.result.toString('utf8'));
                    // let resultParsed = result.result.toString('utf8');
                    // console.log("////////////////////////////////")
                    // console.log(resultParsed)
                    // logger.debug(resultParsed);
                    resolve({
                        message: {
                            ID_Invoice: parsedAttrs[0],
                            PO_ID: parsedAttrs[1],  
                            RECEIVED_DAY:  parsedAttrs[2],
                            NUMSENT: parsedAttrs[3], 
                            INSTALLMENT_PRICE: parsedAttrs[4], 
                            SELLER: parsedAttrs[5],
                            // BUYER: parsedAttrs[6], 
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
    Borrow_Invoice_Seller(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.Borrow_Invoice_Seller(unparsedAttrs)]';
       // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            console.log("**********55555555****************")
            ParseBorrow_Invoice(unparsedAttrs).then((parsedAttrs) => {
                // console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: Borrow_Invoice_Seller,
                    attrs: parsedAttrs
                };
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = result.result.toString();
                    
                    // let resultParsed = JSON.parse(result.toString('utf8'));
                    console.log(resultParsed)
                    resolve({
                        message: {
                            message: "Borrowed Success",
                            Invoice : resultParsed,
                            INVOICE_ID: parsedAttrs[0],
                            PO_ID: parsedAttrs[1],
                            SELLER: parsedAttrs[2]
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
    Borrow_Invoice_Buyer(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.Borrow_Invoice_Buyer(unparsedAttrs)]';
       // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            ParseBorrow_InvoiceB(unparsedAttrs).then((parsedAttrs) => {
                // console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: Borrow_Invoice_Buyer,
                    attrs: parsedAttrs
                };
                console.log("**********77777777777****************")
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = result.result.toString();
                    
                    // let resultParsed = JSON.parse(result.toString('utf8'));
                    console.log(resultParsed)
                    resolve({
                        message: {
                            message: "Borrowed Success",
                            Invoice : resultParsed,
                            INVOICE_ID: parsedAttrs[0],
                            PO_ID: parsedAttrs[1],
                            BUYER: parsedAttrs[2]
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
    BorrowPO(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.BorrowPO(unparsedAttrs)]';
        return new Promise((resolve, reject) => {

            let invokeObject = {};
            ParseBorrowPO(unparsedAttrs).then((parsedAttrs) => {
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: BorrowPO,
                    attrs: parsedAttrs
                };
                blockchain.invoke(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = result.result.toString('utf8');
                    console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                    console.log(resultParsed)
                    resolve({
                        message: {
                            PO_ID: parsedAttrs[0],
                            SELLER: parsedAttrs[1],
                            message: "This PO has borrow"
                            
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

    // CheckPO(unparsedAttrs) {
    //     let self = this;
    //     let functionName = '[toBC.ParseCheckPO(unparsedAttrs)]';
        
    //    // self.uUID = UUID.generateUUID_RFC4122();

    //     return new Promise((resolve, reject) => {
    //         let invokeObject = {};
    //         let parsedAttrsInvoice = {};
    //         let resultParsedInvoice
    //         let data 
    //         let invoke_in_PO = [];
    //         let data2 ={};
    //         let i
    //         ParseCheckPO(unparsedAttrs).then((parsedAttrs) => {
    //             // console.log('parsedAttrs:' + parsedAttrs);
    //             invokeObject = {
    //                 enrollID: self.enrollID,
    //                 fcnname: CheckPO,
    //                 attrs: parsedAttrs
    //             };
    //             // console.log(parsedAttrs)
    //             // console.log("ffffffffffffffffffffffffffffff")
    //             blockchain.query(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
    //                 let resultParsed = JSON.parse(result.result.toString('utf8'));
    //                 // console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
    //                 // console.log(resultParsed)
    //                 if(resultParsed.ALL_INVOICE != null){
    //                     // SentInvoice = ParseCheckPOI()
    //                     for(i =0;i<(resultParsed.ALL_INVOICE).length;i++){
    //                         console.log(i)
    //                         // let SentInvoice = ParseCheckPOI(i,resultParsed)
    //                         // console.log(SentInvoice)
    //                         // let SentInvoice = `${resultParsed.ALL_INVOICE[i]},${resultParsed.PO_ID},${resultParsed.SELLER}`
    //                         // console.log(resultParsed.ALL_INVOICE[i])
    //                         parsedAttrsInvoice = [ 
    //                             resultParsed.ALL_INVOICE[i],
    //                             resultParsed.PO_ID,
    //                             resultParsed.SELLER,
    //                         ]
    //                         blockchain.query(invokeObject.enrollID, CheckInvoice, parsedAttrsInvoice, INVOKE_ATTRIBUTES).then((result) => {///
    //                             resultParsedInvoice = JSON.parse(result.result.toString('utf8'));///
    //                             // data=ParseCheckPOI(i,resultParsedInvoice)
    //                             invoke_in_PO[0] = resultParsedInvoice
    //                             data = ParseCheckPOI(invoke_in_PO[0])
    //                             invoke_in_PO[1] = resultParsedInvoice
    //                             data2 = ParseCheckPOI(invoke_in_PO[1])
    //                             // data2 = data
    //                             // console.log(resultParsed.ALL_INVOICE)
    //                             // console.log("//////////////////////////////////////")
    //                             // console.log(i)
    //                             // console.log(invoke_in_PO[i])
    //                             // console.log(result.result.toString())
    //                             console.log(data)
    //                             // console.log(data2)
    //                             // console.log(resultParsed)
    //                             console.log("555555555555555555555555555555555555555")
    //                             // console.log(resultParsedInvoice)
    //                             // resolve({
    //                             //     message: { //ค่าที่ ปริ้นออกมาจาก json
    //                             //         PO_ID: parsedAttrs[0],
    //                             //         BUYER: parsedAttrs[1],
    //                             //         PO : resultParsed,
    //                             //         // INVOICE: invoke_in_PO[i],
    //                             //         // DATA: data,
    //                             //         // DATA2: data2,
    //                             //         INVOICE: invoke_in_PO[0],
    //                             //         INVOICE2: invoke_in_PO[1],
    //                             //         // INVOICE: invoke_in_PO[3],
    //                             //         // INVOICE: invoke_in_PO[4],
    //                             //         // INVOICE: invoke_in_PO[5],
    //                             //     }
    //                             //  });
    //                         }).catch((e) => {////
    //                             logger.error(`${functionName}  ${e}`);////
    //                             reject(` ${e}`);////
    //                         });/////
    //                     }/////for loop
    //                     // resolve({
    //                     //     message: { //ค่าที่ ปริ้นออกมาจาก json
    //                     //         PO_ID: parsedAttrs[0],
    //                     //         BUYER: parsedAttrs[1],
    //                     //         PO : resultParsed,
    //                     //         INVOICE: invoke_in_PO[0],
    //                     //         INVOICE2: invoke_in_PO[1],
    //                     //         data: data,
    //                     //         // INVOICE: invoke_in_PO[3],
    //                     //         // INVOICE: invoke_in_PO[4],
    //                     //         // INVOICE: invoke_in_PO[5],
    //                     //     }
    //                     //  });
    //                 }//if
    //                 resolve({
    //                     message: { //ค่าที่ ปริ้นออกมาจาก json
    //                         PO_ID: parsedAttrs[0],
    //                         BUYER: parsedAttrs[1],
    //                         PO : resultParsed,
    //                         // DATA: data,
    //                         // INVOICE: invoke_in_PO[i],
    //                         // DATA2: data2,
    //                         // INVOICE: invoke_in_PO[0],
    //                         // INVOICE: invoke_in_PO[1],
    //                         // INVOICE: invoke_in_PO[2],
    //                         // INVOICE: invoke_in_PO[3],
    //                         // INVOICE: invoke_in_PO[4],
    //                         // INVOICE: invoke_in_PO[5],
    //                     }
    //                  });
    //             }).catch((e) => {
    //                 logger.error(`${functionName}  ${e}`);
    //                 reject(` ${e}`);
    //             });
    //         }).catch((e) => {
    //             logger.error(`${functionName} / ${JSON.stringify(e)}`);
    //             reject(`/ ${e}`);
    //         });
    //     });
    // }
    CheckPO(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.ParseCheckPO(unparsedAttrs)]';
        
       // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {
            let invokeObject = {};
            let parsedAttrsInvoice = {};
            let resultParsedInvoice
            let data ={};
            let invoke_in_PO = [];
            let data2;
            let i
            ParseCheckPO(unparsedAttrs).then((parsedAttrs) => {
                // console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CheckPO,
                    attrs: parsedAttrs
                };
                console.log(parsedAttrs)
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = JSON.parse(result.result.toString('utf8')); //ทำเพื่อให้สามารถ logs ออกมาโชว์ได้ 
                    console.log("++-+--+-+-+-+--+-+-+-+-+-+--+-+-+-")
                    console.log(resultParsed)
                    // if(resultParsed.ALL_INVOICE != null){
                    //     // SentInvoice = ParseCheckPOI()
                    //     for(i =0;i<(resultParsed.ALL_INVOICE).length;i++){
                    //         console.log(i)
                    //         // let SentInvoice = ParseCheckPOI(i,resultParsed)
                    //         // console.log(SentInvoice)
                    //         // let SentInvoice = `${resultParsed.ALL_INVOICE[i]},${resultParsed.PO_ID},${resultParsed.SELLER}`
                    //         // console.log(resultParsed.ALL_INVOICE[i])
                    //         parsedAttrsInvoice = [ 
                    //             resultParsed.ALL_INVOICE[i],
                    //             resultParsed.PO_ID,
                    //             resultParsed.SELLER,
                    //         ]
                    //         blockchain.query(invokeObject.enrollID, CheckInvoice, parsedAttrsInvoice, INVOKE_ATTRIBUTES).then((result) => {///
                    //             resultParsedInvoice = JSON.parse(result.result.toString('utf8'));///
                    //             // data=ParseCheckPOI(i,resultParsedInvoice)
                    //             invoke_in_PO[i] = resultParsedInvoice
                    //             data = ParseCheckPOI(invoke_in_PO[i])
                    //             // data2 = data
                    //             // console.log(resultParsed.ALL_INVOICE)
                    //             console.log("//////////////////////////////////////")
                    //             // console.log(i)
                    //             // console.log(invoke_in_PO[i])
                    //             // console.log(result.result.toString())
                    //             console.log(data)
                    //             // console.log(data2)
                    //             // console.log(resultParsed)
                    //             resolve({
                    //                 message: { //ค่าที่ ปริ้นออกมาจาก json
                    //                     PO_ID: parsedAttrs[0],
                    //                     BUYER: parsedAttrs[1],
                    //                     PO : resultParsed,
                    //                     INVOICE: invoke_in_PO[i],
                    //                     DATA: data,
                    //                     // DATA2: data2,
                    //                     // INVOICE: invoke_in_PO[1],
                    //                     // INVOICE: invoke_in_PO[2],
                    //                     // INVOICE: invoke_in_PO[3],
                    //                     // INVOICE: invoke_in_PO[4],
                    //                     // INVOICE: invoke_in_PO[5],
                    //                 }
                    //              });
                    //         }).catch((e) => {////
                    //             logger.error(`${functionName}  ${e}`);////
                    //             reject(` ${e}`);////
                    //         });/////
                    //     }/////for loop
                        
                    // }//if
                    resolve({
                        message: { //ค่าที่ ปริ้นออกมาจาก json
                            PO_ID: parsedAttrs[0],
                            BUYER: parsedAttrs[1],
                            PO : resultParsed,
                            // DATA: data,
                            // INVOICE: invoke_in_PO[i],
                            // DATA2: data2,
                            // INVOICE: invoke_in_PO[1],
                            // INVOICE: invoke_in_PO[2],
                            // INVOICE: invoke_in_PO[3],
                            // INVOICE: invoke_in_PO[4],
                            // INVOICE: invoke_in_PO[5],
                        }
                     });
                }).catch((e) => {
                    logger.error(`${functionName}  ${e}`);
                    reject(` ${e}`);
                });
            }).catch((e) => {
                logger.error(`${functionName} / ${JSON.stringify(e)}`);
                reject(`/ ${e}`);
            });
        });
    }
    CheckInvoice(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.ParseCheckInvoice(unparsedAttrs)]';
       // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            let data 
            ParseCheckInvoice(unparsedAttrs).then((parsedAttrs) => {
                console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CheckInvoice,
                    attrs: parsedAttrs
                };
                
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    resolve({
                        message: { //ค่าที่ ปริ้นออกมาจาก json
                            // INVOICE_ID: parsedAttrs[0],
                            // PO_ID: parsedAttrs[1],
                            // SELLER: parsedAttrs[2],
                            Invoice : resultParsed,
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

    CheckUser(unparsedAttrs) {
        let self = this;
        let functionName = '[toBC.ParseCheckUser(unparsedAttrs)]';
       // self.uUID = UUID.generateUUID_RFC4122();

        return new Promise((resolve, reject) => {

            let invokeObject = {};
            let data 
            ParseCheckUser(unparsedAttrs).then((parsedAttrs) => {
                console.log('parsedAttrs:' + parsedAttrs);
                invokeObject = {
                    enrollID: self.enrollID,
                    fcnname: CheckUser,
                    attrs: parsedAttrs
                };
                
                blockchain.query(invokeObject.enrollID, invokeObject.fcnname, invokeObject.attrs, INVOKE_ATTRIBUTES).then((result) => {
                    let resultParsed = JSON.parse(result.result.toString('utf8'));
                    // let resultParsed = result.result.toString('utf8');
                    // console.log(resultParsed+"55555555555555555");
                    resolve({
                        message: { //ค่าที่ ปริ้นออกมาจาก json
                            User: parsedAttrs[0],
                            History : resultParsed,
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

    
}

module.exports = toBC;