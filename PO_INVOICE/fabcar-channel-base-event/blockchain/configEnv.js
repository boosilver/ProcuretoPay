
const ConfigParser = require('../utils/configParser');
const logger = require('../utils/logger');

const configParser = new ConfigParser();

let configObject = {
    adminUser: {
        enrollmentId: "",
        enrollmentSecret: ""
    },
    peers: [],
    orderers: [],
    ca: {
        url: "",
        name: "",
        cert: ""
    },
    channel: "",
    // channel2: "",
    chaincodeId: "",
    mspId: "",
    orgId: "",
    timeout: 0,
    
    KVSFileSystem: ""
    
    

};

configObject.adminUser = configParser.getBlockchainAdminCredentials();
if (configObject.adminUser == null)
    throw "[ConfigEnv] Admin user credentials are required";

configObject.peers = configParser.getBlockchainPeers();
if (configObject.peers == null)
    throw "[ConfigEnv] Peers configuration is required";

configObject.orderers = configParser.getBlockchainOrderers();
if (configObject.orderers == null)
    throw "[ConfigEnv] Orderers configuration is required";

configObject.ca = configParser.getBlockchainCA();
if (configObject.ca == null)
    throw "[ConfigEnv] CA configuration is required";

configObject.channel = configParser.getBlockchainChannel();
if (configObject.channel == null)
    throw "[ConfigEnv] Channel name is required";

configObject.chaincodeId = configParser.getBlockchainChaincode();
if (configObject.chaincodeId == null)
    throw "[ConfigEnv] Chaincode id is required";

configObject.mspId = configParser.getBlockchainMSPId();
if (configObject.mspId == null)
    throw "[ConfigEnv] MSP id is required";

configObject.orgId = configParser.getBlockchainOrgID();
if (configObject.orgId == null)
    throw "[ConfigEnv] Organization id is required";

configObject.KVSFileSystem = configParser.getKVSLocalConfig();
if (configObject.orgId == null)
    throw "[ConfigEnv] We are runing locally, so local KVS is required.";

configObject.timeout = configParser.getBlockchainTimeout();


// old one use cosInfra
// configObject.KVSCos = configParser.getKVSCosInfra();





module.exports = configObject;