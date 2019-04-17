//Admin
const NodeRSA = require('node-rsa');
const key = new NodeRSA({b: 2048}); //Key pair For Seller
 
const text = 'Hello RSA!';
const text2 = 'yeah bitch'
const all = text+text2;
console.log('-------------------------------------------------------------------------')

let private_key = key.exportKey('pkcs1-private-pem'); //format
console.log('private_key : '+private_key)


//Buyer
let public_key = key.exportKey('pkcs1-public-pem'); //format
console.log('public_key : '+public_key)

const ciphertext = key.encrypt(all, 'base64', 'utf8');
console.log('ciphertext: ', ciphertext);


// Seller
key.generateKeyPair(); //default
key.importKey(private_key,'pkcs1-private-pem');

const decrypted = key.decrypt(ciphertext, 'utf8');
    console.log('decrypted: ', decrypted);

