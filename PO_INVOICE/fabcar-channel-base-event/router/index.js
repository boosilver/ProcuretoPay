//var controller = require('../controller/process')
var app = require('express').Router();
const logger = require('../utils/logger');
const toBC = require('../controller/toBC');

function getUser(key) { // for transfer 
  let functionName = '[toBC.ParseCheckUser(unparsedAttrs)]';

  return new Promise((resolve, reject) => {
      
      let getuser = {};
      //new kvs().putStore(inv_identity,unparsedAttrs)
      
      try {
        getuser = {
              USER: key.USER || '',
          }
          resolve([
            getuser.USER.toString().toLowerCase(),
          ])
      } catch (e) {
          logger.error(`${functionName} Parsing attributes failed ${e}`);
          reject(`Sorry could not parse attributes: ${e}`);
      }

  });
}
function getFORM(key) { // for transfer 
  let functionName = '[toBC.getFORM(unparsedAttrs)]';

  return new Promise((resolve, reject) => {
      
      let getuser = {};
      //new kvs().putStore(inv_identity,unparsedAttrs)
      
      try {
        getuser = {
              FORM: key.FORM || '',
          }
          resolve([
            getuser.FORM.toString().toLowerCase(),
          ])
      } catch (e) {
          logger.error(`${functionName} Parsing attributes failed ${e}`);
          reject(`Sorry could not parse attributes: ${e}`);
      }

  });
}
app.post('/Genkey', function (req, res, next) {
  let functionName = '[API: POST /api/v1/Genkey]';
  getFORM(req.body).then((getkey) => {
  
}) 
});
//#############################################################################
//############################### BUYER #######################################
//#############################################################################
app.post('/CreatePO', function (req, res, next) {
  let functionName = '[API: POST /api/v1/CreatePO]';
  getFORM(req.body).then((getkey) => {
    const bcuserName = `${getkey}`
    console.log(req.body)
new toBC(bcuserName).CreatePO(req.body).then((result) => {
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
  
});
app.post('/CheckPO', function (req, res, next) {
  let functionName = '[API: POST /api/v1/CheckPO]';

  getUser(req.body).then((getkey) => {
    const bcuserName = `${getkey}`
new toBC(bcuserName).CheckPO(req.body).then((result) => {
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
  
}); 
//#############################################################################
//############################### SELLER #######################################
//#############################################################################
app.post('/CreateInvoice', function (req, res, next) {
  let functionName = '[API: POST /api/v1/CreateInvoice]';
  getFORM(req.body).then((getkey) => {
    const bcuserName = `${getkey}`
new toBC(bcuserName).CreateInvoice(req.body).then((result) => {
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
  
});
app.post('/CheckInvoice', function (req, res, next) {
  let functionName = '[API: POST /api/v1/CheckInvoice]';

  getUser(req.body).then((getkey) => {
    const bcuserName = `${getkey}`
new toBC(bcuserName).CheckInvoice(req.body).then((result) => {
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
  
}); 

//#############################################################################
//############################### ADMIN #######################################
//#############################################################################

app.post('/admin/generatekeypair', function (req, res, next) {
  let functionName = '[API: POST /api/v1/admin/generatekeypair]';

  getUser(req.body).then((getkey) => {
    const bcuserName = `${getkey}`
    new toBC(bcuserName).GenerateKeyPair(req.body).then((result) => {
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
  
});

module.exports = app;