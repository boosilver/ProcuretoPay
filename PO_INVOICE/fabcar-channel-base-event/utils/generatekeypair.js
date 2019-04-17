//Admin
const NodeRSA = require('node-rsa');
var fs = require('fs');

/**
 * Create HASH
 * @method post
 * @description - Generate key for company
 * @param {Object}req - CompanyInfo{Name}
 * @param {Object}res - KeyPair of each Company
 */

exports.generatekeypair = function (DirName) {

    // --------------------------------- Create folder and file ------------------------------------
   
    var dir = './' + DirName;
    if (fs.existsSync(dir)) {
        console.log('file already exist');
        return "file already exist";
        // fs.rmdir(dir)

    }
    fs.mkdirSync(dir);
    var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/-/g, "_").slice(0, 10)

    const key = new NodeRSA({ b: 2048 }); //Key pair For Seller
    var Private_key = key.exportKey('pkcs1-private-pem'); //format
    // console.log('private_key : ' + Private_key)

    //Buyer
    var Public_key = key.exportKey('pkcs1-public-pem'); //format
    // console.log('public_key : ' + Public_key)

    try {

        fs.open(dir + '/readme.txt', 'w', function (err, file) {  //create file readme
            if (err) throw err;
            console.log('Create readme success');
        });

        fs.writeFile(dir + '/readme.txt', date, function (err) { //write file readme
            if (err) throw err;
            console.log('Write file readme success');
        });

        fs.open(dir + '/public_key.pem', 'w', function (err, file) {  //create file publickey
            if (err) throw err;
            console.log('Create public key pem success');
        });

        fs.writeFile(dir + '/public_key.pem', Public_key, function (err) { //write file publickey
            if (err) throw err;
            console.log('Write file public key pem success');
        });
        fs.open(dir + '/private_key.pem', 'w', function (err, file) {  //create file privatekey
            if (err) throw err;
            console.log('Create private key pem success');
        });

        fs.writeFile(dir + '/private_key.pem', Private_key, function (err) { //write file privatekey
            if (err) throw err;
            console.log('Write file private key pem success');
        });
        console.log("Create and write folder Success!!!")
        return Public_key,Private_key;
    } catch (error){
        // fs.rmdir(dir)
        return "Error "+error;

    }

    // -------------------------------------------- END Create File and Folder -----------------------------------

    // const ciphertext = key.encrypt(all, 'base64', 'utf8');
    // console.log('ciphertext: ', ciphertext);
}
