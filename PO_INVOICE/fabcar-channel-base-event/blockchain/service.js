const onBluemix = process.env.NODE_ENV == "production";

const logger = require('../utils/logger');
const config = require('./configEnv');


const FabricCAServices = require('fabric-ca-client');

const FabricClient = require('fabric-client');
const User = require('fabric-client/lib/User.js');
const LocalMSP = require('fabric-ca-client/lib/msp/msp.js');

const utils = require('fabric-client/lib/utils.js');


const CONFIG_KVS_FILE_DIR = config.KVSFileSystem;
const CONFIG_ADMIN_ENROLL_ID = config.adminUser.enrollmentId;
const CONFIG_ADMIN_ENROLL_SECRET = config.adminUser.enrollmentSecret;
const CONFIG_CA_URL = config.ca.url;
const CONFIG_CA_NAME = config.ca.name;
const CONFIG_CA_CERT = config.ca.cert;
const CONFIG_CANNEL_NAME = config.channel;
// const CONFIG_CANNEL_NAME2 = config.channel2;
const CONFIG_PEERS_ARRAY = config.peers;
const CONFIG_ORDERERS_ARRAY = config.orderers;
const CONFIG_CONNECT_TIMEOUT = config.timeout;
const CONFIG_MSPID = config.mspId;
const CONFIG_ORGANIZATION_ID = config.organizationId;
const CONFIG_CHAINCODE_ID = config.chaincodeId;
var tlsOptions = {
    trustedRoots: [CONFIG_CA_CERT],
    verify: false
};

var _fabricCAService;
var _fabricClient;
var _channel;
// var _channel2;
var _endorsmentTargets = [];

var _registrarUser;

var _keyValueStore;
const _cryptoSuite = FabricClient.newCryptoSuite();
const _msp = new LocalMSP({
    'id': CONFIG_MSPID,
    'cryptoSuite': _cryptoSuite
});

function init() {
    let functionName = '[Blockchain.service.init()]';

    logger.info(`${functionName} Initialising`);

    return (() => {

        let options = {};


        options = {
            path: CONFIG_KVS_FILE_DIR
        };
        logger.debug(`${functionName} We are on Local. File config: ${options}`);


        _cryptoSuite.setCryptoKeyStore(FabricClient.newCryptoKeyStore(options));
        return FabricClient.newDefaultKeyValueStore(options);

    })().then((kvs) => {
        _keyValueStore = kvs;

        logger.debug(`${functionName} Getting user context for: ${CONFIG_ADMIN_ENROLL_ID}`);

        _fabricCAService = new FabricCAServices(CONFIG_CA_URL, tlsOptions, CONFIG_CA_NAME, _cryptoSuite);

        logger.debug(`${functionName} CA Service initialized: ${_fabricCAService}`);

        _fabricClient = new FabricClient();
        _fabricClient.setCryptoSuite(_cryptoSuite);
        _fabricClient.setStateStore(_keyValueStore);
        _channel = _fabricClient.newChannel(CONFIG_CANNEL_NAME);
        // _channel2 = _fabricClient.newChannel(CONFIG_CANNEL_NAME2);
        // console.log("0000000022222222222222222222222222222222222200000000000000"+_channel)
        // console.log("0000000022222222222222222222222222222222222200000000000000"+_channel2)
        CONFIG_PEERS_ARRAY.forEach(function (peer) {
            let peerConf = {
                'request-timeout': CONFIG_CONNECT_TIMEOUT
            }

            if (peer.cert !== "" && peer.cert) {
                peerConf['ssl-target-name-override'] = peer.sslHostname;
                peerConf.pem = peer.cert;
            }
            
            let peerObj = _fabricClient.newPeer(peer.requestURL, peerConf);
            _channel.addPeer(peerObj);
            // _channel2.addPeer(peerObj);
            _endorsmentTargets.push(peerObj);
        }, this);
        CONFIG_ORDERERS_ARRAY.forEach(function (orderer) {
            let ordererConf = {
                'request-timeout': CONFIG_CONNECT_TIMEOUT
            }
            if (orderer.cert !== "" && orderer.cert) {
                ordererConf['ssl-target-name-override'] = orderer.sslHostname;
                ordererConf.pem = orderer.cert;
            }

            let ordererObj = _fabricClient.newOrderer(orderer.url, ordererConf);
            _channel.addOrderer(ordererObj);
            // _channel2.addOrderer(ordererObj);
        }, this);
        return _fabricClient.getUserContext(CONFIG_ADMIN_ENROLL_ID, true);
    }).then((user) => {
        if (user === undefined || user === null || user.isEnrolled() === false) {
            logger.debug(`${functionName} User not enrolled yet. Enrolling...`);
            //Bootstrap not enrolled enroll now
            return _fabricCAService.enroll({
                enrollmentID: CONFIG_ADMIN_ENROLL_ID,
                enrollmentSecret: CONFIG_ADMIN_ENROLL_SECRET
            });
        } else {
            logger.debug(`${functionName} User got from KVS: ${user}`);
            _registrarUser = user;
            return false;
        }
    }).then((enrollment) => {
        if (enrollment) {
            logger.debug(`${functionName} Constructing user object`);
            _registrarUser = new User(CONFIG_ADMIN_ENROLL_ID);
            _registrarUser.setCryptoSuite(_cryptoSuite);
            return _registrarUser.setEnrollment(enrollment.key, enrollment.certificate, CONFIG_MSPID);
        } else {
            return false;
        }
    }).then((newRegistrar) => {
        if (newRegistrar !== false) {
            logger.debug(`${functionName} Persisting admin to KeyValStore.`);
            return _keyValueStore.setValue(_registrarUser.getName(), _registrarUser.toString());
        } else {
            return false;
        }
    }).then(() => {
        // logger.debug(`${functionName} Getting signing identity for registrar from the name of: ${_registrarUser.name}`);
        // TODO: Delete me _registrarSigningIdentity = _registrarUser.getSigningIdentity();
        logger.debug(`${functionName} Registrar user: ${_registrarUser}`);
        logger.info(`${functionName} We are ready to do some Blockchaining!`);
    }).catch((err) => {
        logger.error(`${functionName} Error: ${err}`);
    })
}




// ------------------
// Invoke and query
// -------------------
function invoke(enrollmentId, fcn, args, attrs /* deprecated attribute */, isQuery) {
    let functionName = '[Blockchain.service.invoke()]';
    let ccID = CONFIG_CHAINCODE_ID;
    let txID;
    let result;

    return new Promise((resolve, reject) => {

        (() => {
            // logger.debug(`${functionName} Checking if user ${enrollmentId} is not revoked.`);
            // console.log(enrollmentId + "+++++++++++++++++++++++++++++++++++++++++++++++++++++")
            console.log("SERVICE")
            console.log(args + "+++++++++++++++++++++++++++++++++++++++++++++++++++++")
            return _keyValueStore.getValue(enrollmentId);
        })()
            .then((value) => {
                console.log(value + "------------------------------------------------------------")
                let userIdentity = JSON.parse(value);
                //  logger.debug(`${functionName} User identity: ${JSON.stringify(userIdentity)} .`);
                if (userIdentity !== undefined && userIdentity !== null) {
                    if (userIdentity.enrollment.identity === 'REVOKED') {
                        throw new Error(`${functionName} The identity of user ${enrollmentId} is revoked.`);
                        reject(`the identity of user ${enrollmentId} is revoked.`);
                    }
                }
            })
            .then(() => {
                //  logger.debug(`${functionName} Setting user context for invoke with ${enrollmentId}`);
                return _fabricClient.getUserContext(enrollmentId, true);
            })
            .then((user) => {
                if (user == undefined || user == null || user.isEnrolled() == false) {
                    throw new Error(`${functionName} Error: User ${enrollmentId} is not enrolled.`);
                    reject(`user ${enrollmentId} is not enrolled.`);
                }
                txID = _fabricClient.newTransactionID();
                const request = {
                    targets: _endorsmentTargets,
                    chaincodeId: CONFIG_CHAINCODE_ID,
                    fcn: fcn,
                    args: args,
                    chainId: CONFIG_CANNEL_NAME,
                    txId: txID
                };
                // let cha = _channel.sendTransactionProposal(request);
                // logger.info(`${functionName}Sending transaction proposal.`);
                // console.log("gggggggggggggggggggggggggggggggggggggggggggggggggggg"+cha);
                // console.log("-----------------///////////////////////////////----------------")
                return _channel.sendTransactionProposal(request);
            })
            .then((results) => {
                // console.log(results[1]+"---------------------+++++++++++++++++--------------------"+results[0])
                // console.log(results[0]+"////////////////////////////////////////////////////////////"+results[1])
                const proposalResponses = results[0];
                const proposal = results[1];
                if (!isQuery) {
                    //  logger.debug(`${functionName} Original proposal object: ${proposal.toString()}`)
                    let all_good = true;
                    for (let i in proposalResponses) {
                        //   logger.debug(`${functionName} Proposal response ${i}: ${JSON.stringify(proposalResponses[i])}`);
                        let one_good = false;
                        // logger.info("////////////////////////////////////////////" + proposalResponses[i])
                        if (proposalResponses && proposalResponses[i].response &&
                            proposalResponses[i].response.status === 200) {
                            one_good = true;
                            //   logger.info(`${functionName} Transaction proposal was good`);
                        } else {
                            //   logger.error(`${functionName} Transaction proposal was bad`);

                        }
                        all_good = all_good & one_good;
                    }
                    if (all_good) {
                        //  logger.debug(`${functionName} Successfully sent Proposal and received ProposalResponse: Status - ${proposalResponses[0].response.status}, message - "${proposalResponses[0].response.message}", metadata - "${proposalResponses[0].response.payload}", endorsement signature: ${proposalResponses[0].endorsement.signature}`)

                        const request = {
                            proposalResponses: proposalResponses,
                            proposal: proposal
                        };
                        // set the transaction listener and set a timeout of 30sec
                        // if the transaction did not get committed within the timeout period,
                        // fail the test
                        const transactionID = txID.getTransactionID();
                        const eventPromises = [];
                        // let eventHubs = [];
                        // let eventHub = _fabricClient.newEventHub();

                        CONFIG_PEERS_ARRAY.forEach(peer => {
                            let peerConf = {
                                'request-timeout': CONFIG_CONNECT_TIMEOUT
                            }

                            if (peer.cert !== "" && peer.cert) {
                                peerConf['ssl-target-name-override'] = peer.sslHostname;
                                peerConf.pem = peer.cert;
                            }
                            // if (peer.eventUrl){
                            //     eventHub.setPeerAddr(peer.eventUrl, peerConf);
                            //     eventHubs.push(eventHub);
                            // }
                        })

                        // for (let key in eventHubs) {
                        //     let eventHub = eventHubs[key];
                        //     eventHub.connect();

                        //     let txPromise = new Promise((resolve, reject) => {
                        //         let handle = setTimeout(() => {
                        //             eventHub.disconnect();
                        //             reject();
                        //         }, 30000);

                        //         eventHub.registerTxEvent(transactionID, (tx, code) => {
                        //             clearTimeout(handle);
                        //             eventHub.unregisterTxEvent(transactionID);
                        //             eventHub.disconnect();

                        //             if (code !== 'VALID') {
                        //              //   logger.error(`${functionName} Transaction was invalid, code = ${code}`);
                        //                 reject(`Transaction was invalid, code = ${code}`);
                        //             } else {
                        //              //   logger.debug(`${functionName} Transaction was commited on peer ${eventHub._ep._endpoint.addr}`);
                        //                 resolve(eventHub._ep._endpoint.addr);
                        //             }
                        //         });
                        //     });
                        //     eventPromises.push(txPromise);
                        // }
                        let sendPromise = _channel.sendTransaction(request);
                        return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
                            //  logger.debug(`${functionName} Event promise all complete and transactions are sent complete`);
                            return results[0];
                        }).catch((err) => {
                            logger.error(`${functionName} Failed to send transaction and get notifications with the timeout period ${err}`);
                            //  return `failed to send transaction and get notifications with the timeout period`;
                        });

                    } else {
                        logger.error(`${results[0][0]} Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...`);
                        reject(results[0][0]) 
                        // '  send Proposal or receive valid response. Response null or status is not 200. exiting...';
                    }
                } else if (proposalResponses && Array.isArray(proposalResponses)) {
                    let results = [];
                    for (let i = 0; i < proposalResponses.length; i++) {
                        let response = proposalResponses[i];
                        if (response instanceof Error) {
                            //     logger.error(`${functionName} Peer ${i} returned error ${response}`);
                        } else if (response.response && response.response.payload) {
                            results.push(response.response.payload);
                        }
                    }
                    if (results.length) {
                        return results[0];
                    } else {
                        console.log(results[0]+"00000000000000000000000000"+results[1])
                        throw new Error(`${functionName} All peers returned errors2 (see above)`);
                        reject(`${functionName} All peers returned errors (see above)`);
                    }

                } else {
                    throw new Error(`${functionName} Unknown error occured: ${results}`);
                    reject(`unknown error occured : ${results}`);
                }
            }).then((response) => {
                if (!isQuery) {
                    if (response.status === 'SUCCESS') {
                        //    logger.debug(`${functionName} Successfully sent transaction to the orderer.`);
                        resolve({
                            result: txID.getTransactionID()
                        });
                    } else {
                        throw new Error(`${functionName} Failed to order the transaction. Error code: ${response}`);
                        reject(`failed to order the transaction. Error code: ${response.status}`);
                    }
                } else {
                    //   logger.debug(`${functionName} Successfully got response from peer: ${response}`);
                    resolve({
                        result: response
                    });
                }
            })
            .catch((error) => {
                logger.error(`${functionName} Error: ${error}`);
                reject(error);
            })

    }); // End of Promise

} // End of invoke() function

function query(enrollmentId, fcn, args) {
    //TODO: Delete this deprecated attr
    let attrs = [];

    return invoke(enrollmentId, fcn, args, attrs, true);

} // End of query() function





module.exports = {
    init: init,
    invoke: invoke,
    query: query
}