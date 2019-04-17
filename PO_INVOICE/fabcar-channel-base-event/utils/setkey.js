//Admin
const NodeRSA = require('node-rsa');
const key = new NodeRSA({ b: 2048 }); //Key pair For Seller
/**
 * Create HASH
 * @method post
 * @description - Create HASH function
 * @param {Object}req -Data to hash
 * @param {Object}res - result
 */

exports.generatekeypair = function(key,data){

    let private_key = key.exportKey('pkcs1-private-pem'); //format
    // console.log('private_key : '+private_key)
    
    //Buyer
    let public_key = key.exportKey('pkcs1-public-pem'); //format
    console.log('public_key : ' + public_key)
    
    const ciphertext = key.encrypt(all, 'base64', 'utf8');
    console.log('ciphertext: ', ciphertext);
    
}