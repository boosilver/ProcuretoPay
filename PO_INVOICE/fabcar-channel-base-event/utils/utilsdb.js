var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";
//var company = process.env.DBNAME


function DBwrite(company,collections,key,value){
    MongoClient.connect(url, function(err, db) { //connect DB url
        if (err) throw err;
        var dbo = db.db(company);
        dbo.createCollection(collections, function(err, res) { //create collection 
          if (err) throw err;
          var myobj = [
            { _id: key, value: value}
          ];
          dbo.collection(collections).insertMany(myobj, function(err, res) { //insertMany
            if (err) throw err;
           
          db.close();
        });
      });
      })       
    return ;
}

function DBwrite3(company,collections,key,value1,value2){
  MongoClient.connect(url, function(err, db) { //connect DB url
      if (err) throw err;
      var dbo = db.db(company);
      dbo.createCollection(collections, function(err, res) { //create collection 
        if (err) throw err;
        var myobj = [
          { _id: key, value: value1 , hash : value2}
        ];
        dbo.collection(collections).insertMany(myobj, function(err, res) { //insertMany
          if (err) throw err;
         
        db.close();
      });
    });
    })       
  return ;
}

async function DBread(company,collections,key){
var data ;
 db = await MongoClient.connect(url) 
 if (!db) console.log ('error to connect database server ')
    var dbo = db.db(company);
    result = await dbo.collection(collections).findOne({_id: key})
    if (!result) console.log (' ')
         //console.log(result.name);
          data = result.value
          db.close();

  return data;
}

async function DBreadHash(company,collections,key){
  var data ;
   db = await MongoClient.connect(url) 
   if (!db) console.log ('error to connect database server ')
      var dbo = db.db(company);
      result = await dbo.collection(collections).findOne({_id: key})
      if (!result) console.log (' ')
      // console.log ('data not found ')
           //console.log(result.name);
            data = result.hash
            db.close();
  
    return data;
  }

async function DBreadPublic(company,collections,key){
  var data ;
   db = await MongoClient.connect(url) 
   if (!db) console.log ('error to connect database server ')
      var dbo = db.db(company);
      result = await dbo.collection(collections).findOne({_id: key})
      if (!result) console.log ('data not found ')
           //console.log(result.name);
            data = result.publickey
            db.close();
  
    return data;
  }
function AdminDBwrite(NameCompany,publickey,privatekey){
  MongoClient.connect(url, function(err, db) { //connect DB url
      if (err) throw err;
      var dbo = db.db('ForAdmin');
      dbo.createCollection('Company', function(err, res) { //create collection 
        if (err) throw err;
        var myobj = [
          { _id: NameCompany,publickey: publickey ,value: privatekey }
        ];
        dbo.collection('Company').insertMany(myobj, function(err, res) { //insertMany
          if (err) throw err;
         
        db.close();
      });
    });
    })       
  return ;
}
function AdminForCom(DB,publickey,privatekey){
  MongoClient.connect(url, function(err, db) { //connect DB url
      if (err) throw err;
      var dbo = db.db(DB);
      dbo.createCollection('CompanyData', function(err, res) { //create collection 
        if (err) throw err;
        var myobj = [
          { _id: DB,publickey: publickey ,value: privatekey }
        ];
        dbo.collection('CompanyData').insertMany(myobj, function(err, res) { //insertMany
          if (err) throw err;  
                
        db.close();
      });
    });
    dbo.createCollection("LOAN_INVOICE", function(err, res) {
      if (err) throw err;
      db.close();
    });
    dbo.createCollection("LOAN_PO", function(err, res) {
      if (err) throw err;
      db.close();
    });
    dbo.createCollection("ENDORSE_LOAN", function(err, res) {
      if (err) throw err;
      db.close();
    });
    dbo.createCollection("INVOICE", function(err, res) {
      if (err) throw err;
      db.close();
    });
    dbo.createCollection("PO", function(err, res) {
      if (err) throw err;
      db.close();
    });
    
    })       
  return ;
}

 
module.exports = {
    DBwrite: DBwrite,
    DBread: DBread,
    DBreadPublic :DBreadPublic,
    AdminDBwrite: AdminDBwrite,
    AdminForCom: AdminForCom,
    DBwrite3:DBwrite3,
    DBreadHash:DBreadHash

}


