const onewayfunction = require('../utils/hash');
const NodeRSA = require('node-rsa');
const cryptodata = require('../utils/crypto');


var data = "boss" //planText


//@1 get key
const key = new NodeRSA({ b: 2048 }); //ตอนเอาไแใช้จริงต้องมาจาก database or world_state
var Public_key = key.exportKey('pkcs1-public-pem'); //format
console.log('Get public_key : ' + Public_key)
console.log('===========================================================================================================')

//@2 encryption(key,plantext)
var cipherText = cryptodata.encrypt(Public_key,data)

console.log('cipherText: ' + cipherText)
console.log('===========================================================================================================')


//@3 hash(ciphertext)
var identity = onewayfunction.hash(cipherText)
console.log('Hash : ' + identity)
console.log('===========================================================================================================')

//@4 get key
var Private_key = key.exportKey('pkcs1-private-pem'); //format
console.log('Get private_key : ' + Private_key)
console.log('===========================================================================================================')

//@5 decrypt(key,ciphertext)
var plantext = cryptodata.decrypt(Private_key,cipherText)

console.log('Get private_key : ' + plantext)
console.log('===========================================================================================================')
