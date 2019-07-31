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
function DBwrite4(company, collections, key, value1, value2, value3) {
  MongoClient.connect(url, function (err, db) { //connect DB url
    if (err) throw err;
    var dbo = db.db(company);
    dbo.createCollection(collections, function (err, res) { //create collection 
      if (err) throw err;
      var myobj = [
        { _id: key, value: value1, hash: value2, status: value3 }
      ];
      dbo.collection(collections).insertMany(myobj, function (err, res) { //insertMany
        if (err) throw err;

        db.close();
      });
    });
  })
  return;
}
function DBwrite5(company, collections, key, value1, value2, value3, value4) {
  MongoClient.connect(url, function (err, db) { //connect DB url
    if (err) throw err;
    var dbo = db.db(company);
    dbo.createCollection(collections, function (err, res) { //create collection 
      if (err) throw err;
      var myobj = [
        { _id: key, value: value1, hash: value2, status: value3, user: value4 }
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

async function DBreadvalue(company, collections, key) {
  var data;
  db = await MongoClient.connect(url)
  if (!db) console.log('error to connect database server ')
  var dbo = db.db(company);
  result = await dbo.collection(collections).findOne({ _id: key })
  if (!result) console.log('data not found ')
  //console.log(result.name);
  data = result.value
  db.close();

  return data;
}
async function DBread(company, collections, key) {
  var data;
  db = await MongoClient.connect(url)
  if (!db) console.log('error to connect database server ')
  var dbo = db.db(company);
  result = await dbo.collection(collections).findOne({ _id: key })
  if (!result) console.log(' ')
  //console.log('data not found ')
  //console.log(result.name);
  data = result.value
  db.close();

  return data;
}

async function DBreadStatus(company, collections, key) {
  var data;
  db = await MongoClient.connect(url)
  if (!db) console.log('error to connect database server ')
  var dbo = db.db(company);
  result = await dbo.collection(collections).findOne({ _id: key })
  if (!result) console.log('data not found ')
  //console.log(result.name);
  data = result.status
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
async function DBreadStatus(company, collections, key) {
  var data;
  db = await MongoClient.connect(url)
  if (!db) console.log('error to connect database server ')
  var dbo = db.db(company);
  result = await dbo.collection(collections).findOne({ _id: key })
  if (!result) console.log('data not found ')
  //console.log(result.name);
  data = result.status
  db.close();

  return data;
}

function DBdelete(company, collections, key) {

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(company);
    var myquery = { _id: key };
    dbo.collection(collections).deleteOne(myquery, function (err, obj) {
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
    dbo.createCollection("ACCEPT", function (err, res) {
      if (err) throw err;
      db.close();
    });

  })
  return;
}

function readarray(DB, table) {
  var data = new Array();
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(DB);
    dbo.collection(table).find({ value: 'go' }).toArray(function (err, result) {
      if (err) throw err;
      // console.log(result.length);
      for (i = 0; i < result.length; i++) {
        // console.log(result[i].hash.hash2)
        data[i] = result[i].hash.hash2
      }
      console.log(data)
      db.close();
    });
  });
  return;
}


function SetStatusComplete(DB, collections, key) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(DB);
    var myquery = { _id: key ,status: "WAIT" };
    // console.log(DB,collections,key);
    var newvalues = { $set: {  status: "COMPLETE" } };
    // console.log(DB,collections,key);
    dbo.collection(collections).updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
  return;
}

function SetStatusWait(DB, collections, key) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(DB);
    var myquery = { _id: key ,status: "COMPLETE" };
    var newvalues = { $set: { status: "WAIT" } };
    dbo.collection(collections).updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
  return;
}

function SetStatusReject(DB, collections, key) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(DB);
    var myquery = { _id: key ,status: "WAIT" };
    var newvalues = { $set: { status: "REJECT" } };
    dbo.collection(collections).updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
  return;
}
//result = await dbo.collection(collections).findOne({ _id: key })

module.exports = {
  DBwrite: DBwrite,
  DBreadPublic: DBreadPublic,
  AdminDBwrite: AdminDBwrite,
  AdminForCom: AdminForCom,
  DBwrite3: DBwrite3,
  DBwrite4: DBwrite4,
  DBwrite5: DBwrite5,
  DBreadHash: DBreadHash,
  DBreadvalue: DBreadvalue,
  DBread: DBread,
  DBreadprivate: DBreadprivate,
  DBdelete: DBdelete,
  DBreadStatus:DBreadStatus,
  readarray: readarray,
  SetStatusComplete: SetStatusComplete,
  SetStatusWait:SetStatusWait,
  SetStatusReject :SetStatusReject,
  DBreadStatus : DBreadStatus

}


