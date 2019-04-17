//var controller = require('../controller/process')
var app = require('express').Router();
const logger = require('../utils/logger');
const toBC = require('../controller/toBC2');

function getUser(key) { // for transfer 
  let functionName = '[toBC.ParseCreateTransfer(unparsedAttrs)]';

  return new Promise((resolve, reject) => {
      
      let getuser = {};
      //new kvs().putStore(inv_identity,unparsedAttrs)
      
      try {
        getuser = {
              User: key.User || '',
          }
          resolve([
            getuser.User.toString(),
          ])
      } catch (e) {
          logger.error(`${functionName} Parsing attributes failed ${e}`);
          reject(`Sorry could not parse attributes: ${e}`);
      }

  });
}
function getUserT(key) { // for transfer 
  let functionName = '[toBC.ParseCreateTransfer(unparsedAttrs)]';

  return new Promise((resolve, reject) => {
      
      let getuser = {};
      //new kvs().putStore(inv_identity,unparsedAttrs)
      
      try {
        getuser = {
              UserS: key.UserS || '',
          }
          resolve([
            getuser.UserS.toString(),
          ])
      } catch (e) {
          logger.error(`${functionName} Parsing attributes failed ${e}`);
          reject(`Sorry could not parse attributes: ${e}`);
      }

  });
}
app.post('/Createwallet', function (req, res, next) {   
  let functionName = '[API: POST /api/v1/Createwallet]';
  getUser(req.body).then((getkey) => {
    const bcuserName = `${getkey}`
    new toBC(bcuserName).Createwallet(req.body).then((result) => {
        res.status(201);
        res.json(result.message);
      })
      .catch((error) => {
        logger.error(`${functionName} __: ${error}`);
        res.status(500);
        res.json({
          code: 500,
          message: `__: ${error}`
        });
      });

    })
    // console.log("11111111111111111111111111111111"+getkey+"000000000000000000000000000000000000000000000");

  
  
})
app.post('/addmoney', function (req, res, next) {   
  let functionName = '[API: POST /api/v1/addmoney]';
  getUser(req.body).then((getkey) => {
    const bcuserName = `${getkey}`
    new toBC(bcuserName).Addmoney(req.body).then((result) => {
        res.status(201);
        res.json(result.message);
      })
      .catch((error) => {
        logger.error(`${functionName} Failed to addmoney new Service Request: ${error}`);
        res.status(500);
        res.json({
          code: 500,
          message: `Failed to addmoney new Service Request: ${error}`
        });
      });

    })
    // console.log("11111111111111111111111111111111"+getkey+"000000000000000000000000000000000000000000000");

  
  
}) //Mint1




app.post('/transfer', function (req, res, next) {
  let functionName = '[API: POST /api/v1/transfer]';
  getUserT(req.body).then((getkey) => {
    const bcuserName = `${getkey}`
new toBC(bcuserName).CreateTransfer(req.body).then((result) => {
    res.status(201);
    res.json(result.message);
  })
  .catch((error) => {
    logger.error(`${functionName} Failed to transfer new Service Request: ${error}`);
    res.status(500);
    res.json({
      code: 500,
      message: `Failed to transfer new Service Request: ${error}`
    });
  });
})
  
}); //transfer

app.post('/checkbalance', function (req, res, next) {
  let functionName = '[API: POST /api/v1/checkbalance]';

  getUser(req.body).then((getkey) => {
    const bcuserName = `${getkey}`
new toBC(bcuserName).CheckBalance(req.body).then((result) => {
    res.status(201);
    res.json(result.message);
  })
  .catch((error) => {
    logger.error(`${functionName} Failed to check new Service Request: ${error}`);
    res.status(500);
    res.json({
      code: 500,
      message: `Failed to check new Service Request: ${error}`
    });
  });
})
  
}); //cheakbalane

module.exports = app;