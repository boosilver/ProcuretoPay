var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";
//var company = process.env.DBNAME


function DBwrite(company, collections, key, value) {
  MongoClient.connect(url, function (err, db) { //connect DB url
    if (err) throw err;
    var dbo = db.db(company);
    dbo.createCollection(collections, function (err, res) { //create collection 
      if (err) throw err;
      var myobj = [
        { _id: key, value: value }
      ];
      dbo.collection(collections).insertMany(myobj, function (err, res) { //insertMany
        if (err) throw err;

        db.close();
      });
    });
  })
  return;
}

function DBwrite3(company, collections, key, value1, value2) {
  MongoClient.connect(url, function (err, db) { //connect DB url
    if (err) throw err;
    var dbo = db.db(company);
    dbo.createCollection(collections, function (err, res) { //create collection 
      if (err) throw err;
      var myobj = [
        { _id: key, value: value1, hash: value2 }
      ];
      dbo.collection(collections).insertMany(myobj, function (err, res) { //insertMany
        if (err) throw err;

        db.close();
      });
    });
  })
  return;
}

async function DBreadprivate(company, collections, key) {
  var data;
  db = await MongoClient.connect(url)
  if (!db) console.log('error to connect database server ')
  var dbo = db.db(company);
  result = await dbo.collection(collections).findOne({ _id: key })
  if (!result) console.log('data not found ')
  //console.log(result.name);
  data = result.privatekey
  db.close();

  return data;
}

async function DBread(company, collections, key) {
  var data;
  db = await MongoClient.connect(url)
  if (!db) console.log('error to connect database server ')
  var dbo = db.db(company);
  result = await dbo.collection(collections).findOne({ _id: key })
  if (!result) console.log('')
  // console.log('data not found ')
  //console.log(result.name);
  data = result.value
  db.close();

  return data;
}

async function DBreadHash(company, collections, key) {
  var data;
  db = await MongoClient.connect(url)
  if (!db) console.log('error to connect database server ')
  var dbo = db.db(company);
  result = await dbo.collection(collections).findOne({ _id: key })
  if (!result) console.log('data not found ')
  //console.log(result.name);
  data = result.hash
  db.close();

  return data;
}

async function DBreadPublic(company, collections, key) {
  var data;
  db = await MongoClient.connect(url)
  if (!db) console.log('error to connect database server ')
  var dbo = db.db(company);
  result = await dbo.collection(collections).findOne({ _id: key })
  if (!result) console.log('data not found ')
  //console.log(result.name);
  data = result.publickey
  db.close();

  return data;
}

function DBdelete(company, collections, key) {

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(company);
    var myquery = { _id: key };
    dbo.collection(collections).deleteOne(myquery, function(err, obj) {
      if (err) throw err;
      console.log("1 document deleted");
      db.close();
    });
  });

  return
}

function AdminDBwrite(NameCompany, publickey, privatekey) {
  MongoClient.connect(url, function (err, db) { //connect DB url
    if (err) throw err;
    var dbo = db.db('ForAdmin');
    dbo.createCollection('Company', function (err, res) { //create collection 
      if (err) throw err;
      var myobj = [
        { _id: NameCompany, publickey: publickey, privatekey: privatekey }
      ];
      dbo.collection('Company').insertMany(myobj, function (err, res) { //insertMany
        if (err) throw err;

        db.close();
      });
    });
  })
  return;
}
function AdminForCom(DB, publickey, privatekey) {
  MongoClient.connect(url, function (err, db) { //connect DB url
    if (err) throw err;
    var dbo = db.db(DB);
    dbo.createCollection('CompanyData', function (err, res) { //create collection 
      if (err) throw err;
      var myobj = [
        { _id: DB, publickey: publickey, privatekey: privatekey }
      ];
      dbo.collection('CompanyData').insertMany(myobj, function (err, res) { //insertMany
        if (err) throw err;

        db.close();
      });
    });
    dbo.createCollection("LOAN_INVOICE", function (err, res) {
      if (err) throw err;
      db.close();
    });
    dbo.createCollection("LOAN_PO", function (err, res) {
      if (err) throw err;
      db.close();
    });
    dbo.createCollection("ENDORSE_LOAN", function (err, res) {
      if (err) throw err;
      db.close();
    });
    dbo.createCollection("INVOICE", function (err, res) {
      if (err) throw err;
      db.close();
    });
    dbo.createCollection("PO", function (err, res) {
      if (err) throw err;
      db.close();
    });

  })
  return;
}


module.exports = {
  DBwrite: DBwrite,
  DBreadPublic: DBreadPublic,
  AdminDBwrite: AdminDBwrite,
  AdminForCom: AdminForCom,
  DBwrite3: DBwrite3,
  DBreadHash: DBreadHash,
  DBread: DBread,
  DBreadprivate: DBreadprivate,
  DBdelete: DBdelete

}


