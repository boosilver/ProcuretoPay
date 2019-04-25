var crypto = require('crypto');

/**
 * Create HASH
 * @method post
 * @description - Create HASH function
 * @param {Object}req -data to hash input
 * @param {Object}res -hash key result output
 */

exports.hash = function(data){

    var hash = crypto.createHash('sha256')          //HASH FUCTION
    .update(data)
    .digest('hex');
    // console.log('HASH Ciphertext Complete!!! : ', hash)
    return hash;

}