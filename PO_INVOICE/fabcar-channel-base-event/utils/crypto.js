const NodeRSA = require('node-rsa');
const keypair = new NodeRSA();

/**
 * Create Encrypt
 * @method post
 * @description - Encrypt data from public key
 * @param {Object}req - keypublic for encrypt  
 * @param {Object}req - data for encrypt
 * @param {Object}res - encrypt data
 */

exports.encrypt = function (key,plantext) {
    keypair.importKey(key.toString(), 'pkcs1-public-pem');
    // console.log(keypublic.toString('utf8'))
    const ciphertext = keypair.encrypt(plantext, 'base64', 'utf8');
    return ciphertext;

}

/**
 * Decrypt Data
 * @method post
 * @description - Decrypt data from private key
 * @param {Object}req - keyprivate for decrypt  
 * @param {Object}req - data for decrypt
 * @param {Object}res - decrypt data
 */

exports.decrypt = function (key,ciphertext) {
    keypair.importKey(key.toString(), 'pkcs1-private-pem');
    // console.log(keyprivate.toString('utf8'))
    const decryptdata = keypair.decrypt(ciphertext, 'utf8');
    return decryptdata;

}