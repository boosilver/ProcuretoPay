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
function getBANK(key) { // for transfer 
  let functionName = '[toBC.getFORM(unparsedAttrs)]';

  return new Promise((resolve, reject) => {
      
      let getuser = {};
      //new kvs().putStore(inv_identity,unparsedAttrs)
      
      try {
        getuser = {
              BANK: key.BANK || '',
          }
          resolve([
            getuser.BANK.toString().toLowerCase(),
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
app.post('/Accept', function (req, res, next) {
  let functionName = '[API: POST /api/v1/Accept]';
    const bcuserName = req.body.FORM.toLowerCase()
    console.log(req.body)
new toBC(bcuserName).Accept(req.body).then((result) => {
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
  
});
//#############################################################################
//############################### BUYER #######################################
//#############################################################################
app.post('/CreatePO', function (req, res, next) {
  let functionName = '[API: POST /api/v1/CreatePO]';
    const bcuserName = req.body.FORM.toLowerCase()
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
});
app.post('/GetPO', function (req, res, next) {
  let functionName = '[API: POST /api/v1/GetPO]';
    const bcuserName = req.body.USER.toLowerCase()
new toBC(bcuserName).GetPO(req.body).then((result) => {
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
  
}); 
app.post('/GetValue', function (req, res, next) {
  let functionName = '[API: POST /api/v1/GetValue]';
    const bcuserName = req.body.USER.toLowerCase()
new toBC(bcuserName).GetValue(req.body).then((result) => {
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
  
}); 
//#############################################################################
//############################### SELLER #######################################
//#############################################################################
app.post('/CreateInvoice', function (req, res, next) {
  let functionName = '[API: POST /api/v1/CreateInvoice]';
    const bcuserName = req.body.FORM.toLowerCase()
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
  
});
app.post('/CheckInvoice', function (req, res, next) {
  let functionName = '[API: POST /api/v1/CheckInvoice]';
    const bcuserName = req.body.USER.toLowerCase()
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
  
}); 

//#############################################################################
//############################### BANK #######################################
//#############################################################################
app.post('/Loan', function (req, res, next) {
  let functionName = '[API: POST /api/v1/Loan]';
    const bcuserName = req.body.FORM.toLowerCase()
new toBC(bcuserName).Loan(req.body).then((result) => {
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
  
});

app.post('/Request_Verify', function (req, res, next) {
  let functionName = '[API: POST /api/v1/Request_Verify]';
    const bcuserName = req.body.BANK.toLowerCase()
new toBC(bcuserName).Request_Verify(req.body).then((result) => {
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
});

app.post('/endorse_loan', function (req, res, next) {
  let functionName = '[API: POST /api/v1/endorse_loan]';
    const bcuserName = req.body.BANK.toLowerCase()
new toBC(bcuserName).endorse_loan(req.body).then((result) => {
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
});

//#############################################################################
//############################### ADMIN #######################################
//#############################################################################

app.post('/admin/generatekeypair', function (req, res, next) {
  let functionName = '[API: POST /api/v1/admin/generatekeypair]';
    const bcuserName = req.body.USER.toLowerCase()
    logger.debug(bcuserName);
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

});
app.post('/Checkkey', function (req, res, next) {
  let functionName = '[API: POST /api/v1/Checkkey]';
    const bcuserName = req.body.USER.toLowerCase()
new toBC(bcuserName).Checkkey(req.body).then((result) => {
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
  
}); 
app.post('/Get_Blockchain', function (req, res, next) {
  let functionName = '[API: POST /api/v1/Get_Blockchain]';
    const bcuserName = req.body.USER.toLowerCase()
new toBC(bcuserName).Get_Blockchain(req.body).then((result) => {
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
  
}); 

module.exports = app;