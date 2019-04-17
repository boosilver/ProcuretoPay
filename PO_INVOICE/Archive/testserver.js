


var MongoClient = require('mongodb').MongoClient; //libmongoDB
var url = "mongodb://localhost:27017/mydb"; 

MongoClient.connect(url, function(err, db) { //connect DB url
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.createCollection("MyData", function(err, res) { //create collection 
    if (err) throw err;
    console.log("Collection created!");
    var myobj = [
      { _id: 11, name: 'rush'},
      { _id: 21, name: 'boss'},
      { _id: 31, name: 'peet'}
    ];
    dbo.collection("MyData").insertMany(myobj, function(err, res) { //insertMany
      if (err) throw err;
      console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });
});
})




// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/";
// var name = "rush";
// var address = "england"
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   var myobj = {_id:"000111", name: name, address: address };
//   dbo.collection("customers").insertOne(myobj, function(err, res) {
//     if (err) throw err;
//     console.log("Number of documents inserted: " + res.insertedCount);
//     db.close();
//   });
// });     //การแอดdata เข้าไปสู่ db 

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   dbo.collection("customers").find({}).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// }); //find all data 

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   dbo.collection("customers").find({}, { projection: { address: 0 } }).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// }); find all data unless address

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   var query = { address: "england" };
//   dbo.collection("customers").find(query).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });
  
