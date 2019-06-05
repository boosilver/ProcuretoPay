// const blockchainServiceRegex = /^blockchain/;
const logger = require('../utils/logger');
const CONFIG_ORG = process.env.CONFIG_ORG;
const LOG = process.env.LOG;

class ConfigParser {

    constructor() {

        //const vcapServicesObject = process.env.VCAP_SERVICES ? JSON.parse(process.env.VCAP_SERVICES) : null;
        let configObject =  require(`../blockchain/deployLocal/${CONFIG_ORG}`);
        // console.log("addmoney  : 1111111111111111111111111111111111111111111111111"+configObject.user)
        if (process.env.API_CONFIG) {
            configObject = JSON.parse(process.env.API_CONFIG);
        }
        //logger.info("[Config Parser] vcapServicesObject: " + JSON.stringify(vcapServicesObject));
        //logger.info("[Config Parser] configObject: " + JSON.stringify(configObject));

        this.blockchainCredentials = configObject.blockchain.adminCredentials || null;
        //logger.info("[Config Parser] blockchainCredentials: " + JSON.stringify(this.blockchainCredentials));

        this.blockchainPeers = configObject.blockchain.peers;
        //logger.info("[Config Parser] blockchainPeers: " + JSON.stringify(this.blockchainPeers));

        this.blockchainOrders = configObject.blockchain.orderers;
        //logger.info("[Config Parser] blockchainOrders: " + JSON.stringify(this.blockchainOrders));

        this.blockchainCA = configObject.blockchain.ca;
        //logger.info("[Config Parser] blockchainCA: " + JSON.stringify(this.blockchainCA));

        //logger.info("[Config Parser] blockchainKVSFileSystemPath: " + JSON.stringify(this.blockchainKVSFileSystemPath));

        this.blockchainChannel = configObject.blockchain.channel;
        //logger.info("[Config Parser] blockchainChannel: " + JSON.stringify(this.blockchainChannel));

        this.blockchainChaincode = configObject.blockchain.chaincodeId;
        //logger.info("[Config Parser] blockchainChaincode: " + JSON.stringify(this.blockchainChaincode));

        this.blockchainChannel2 = configObject.blockchain.channel2;
        if (LOG != "NO"){
            logger.info("[Config Parser] blockchainChannel2: " + JSON.stringify(this.blockchainChannel));
        }
        // logger.info("[Config Parser] blockchainChannel2: " + JSON.stringify(this.blockchainChannel2));
        // logger.info("25252525255252523333333333333333333333333333332525252525252525252525" );
        this.blockchainChaincode2 = configObject.blockchain.chaincodeId2;
        //logger.info("[Config Parser] blockchainChaincode2: " + JSON.stringify(this.blockchainChaincode2));

        this.blockchainMSPId = configObject.blockchain.mspId;
        //logger.info("[Config Parser] blockchainMSPId: " + JSON.stringify(this.blockchainMSPId));

        this.blockchainOrgID = configObject.blockchain.organizationId;
        //logger.info("[Config Parser] blockchainOrgID: " + JSON.stringify(this.blockchainOrgID));

        this.blockchainTimeout = configObject.blockchain.timeout;
        //logger.info("[Config Parser] blockchainTimeout: " + JSON.stringify(this.blockchainTimeout));

       

            if (!configObject.blockchain.keyValStore.fileSystem) {
                throw ("[Config Parser] We are running locally, so file system path as value of 'fileSystem' attribute of 'keyValStore' is required.")
            }
            this.blockchainKVSFileSystemPath = configObject.blockchain.keyValStore.fileSystem;

            // COS INFRA
            // this.cosAccessKeyInfra = process.env.COS_ACCESS_KEY_ID;
            // this.cosSecretAccessKeyInfra = process.env.COS_SECRET_ACCESS_KEY;

        // this.cosEndpointInfra = configObject.cosInfra.endpoint;
        // this.cosRegionInfra = configObject.cosInfra.region;

        // //logger.info("[Config Parser] COS Access Key: " + JSON.stringify(this.cosAccessKeyInfra));
        // //logger.info("[Config Parser] COS Secret Access Key: " + JSON.stringify(this.cosSecretAccessKeyInfra));
        // //logger.info("[Config Parser] COS Endpoint: " + JSON.stringify(this.cosEndpointInfra));
        // //logger.info("[Config Parser] COS Region: " + JSON.stringify(this.cosRegionInfra));

    }

    getBlockchainAdminCredentials() {
        if (!this.blockchainCredentials) {
            logger.error("[Config Parser] Blockchain adminCredentials are missing in config.json.");
            return null
        };
        if (!this.blockchainCredentials.enrollmentId && !this.blockchainCredentials.enrollmentSecret) {
            logger.error("[Config Parser] Blockchain adminCredentials are missing in config.json. Check that you specified 'enrollmentId' and 'enrollmentSecret'.");
            return null
        };
        return this.blockchainCredentials;
    }

    //TODO: Complete properties validation.
    getBlockchainPeers() {
        if (!this.blockchainPeers) {
            logger.error("[Config Parser] Blockchain peers configuration is missing in config.json");
            return null
        };
        return this.blockchainPeers;
    }

    //TODO: Complete properties validation.
    getBlockchainOrderers() {
        if (!this.blockchainOrders) {
            logger.error("[Config Parser] Blockchain orderers configuration is missing in config.json");
            return null
        };
        return this.blockchainOrders;
    }

    //TODO: Complete properties validation.
    getBlockchainCA() {
        if (!this.blockchainCA) {
            logger.error("[Config Parser] Blockchain CA configuration is missing in config.json");
            return null
        };
        return this.blockchainCA;
    }

    //TODO: Complete properties validation.
    getKVSLocalConfig() {
        if (!this.blockchainKVSFileSystemPath) {
            logger.error("[Config Parser] Local path for KeyValueStore is not specified. It should be a value of 'fileSytem' propery of 'keyValStore' property of 'blockchain' config object. Please specify something like 'fileSystem':'myFolder'.");
            return null
        };
        return this.blockchainKVSFileSystemPath;
    }

    getBlockchainChannel() {
        if (!this.blockchainChannel) {
            logger.error("[Config Parser] Channel name is not specified. It should be a value of 'channel' propery of 'blockchain' config object. Please specify something like 'channel':'mychannel'.");
            return null
        };
        return this.blockchainChannel;
    }
    getBlockchainChannel2() {
        if (!this.blockchainChannel2) {
            logger.error("+++++++++++++................+++++++++++++++++++++++++++++++++++++++++++");
            return null
        };
        return this.blockchainChannel2;
    }
    

    //TODO: Complete properties validation.
    getBlockchainChaincode() {
        if (!this.blockchainChaincode) {
            logger.error("[Config Parser] Chaincode ID is not specified. It should be a value of 'chaincodeId' propery of 'blockchain' config object. Please specify something like 'chaincodeId':'mychaincode'.");
            return null
        };
        return this.blockchainChaincode;
    }

    //TODO: Complete properties validation.
    getBlockchainMSPId() {
        if (!this.blockchainMSPId) {
            logger.error("[Config Parser] Blockchain MSP ID is not specified. It should be a value of 'mspId' propery of 'blockchain' config object. Please specify something like 'mspId':'Org1MSP'.");
            return null
        };
        return this.blockchainMSPId;
    }
    

    //TODO: Complete properties validation.
    getBlockchainOrgID() {
        if (!this.blockchainOrgID) {
            logger.error("[Config Parser] Blockchain Organization ID is not specified. It should be a value of 'organizationId' propery of 'blockchain' config object. Please specify something like 'organizationId':'org1'.");
            return null
        };
        return this.blockchainOrgID;
    }

    //TODO: Complete properties validation.
    getBlockchainTimeout() {
        if (!this.blockchainTimeout) {
            logger.error("[Config Parser] Blockchain timeout is not specified. Using standard 300 ms.");
            return 300;
        };
        return this.blockchainTimeout;
    }



}

module.exports = ConfigParser;