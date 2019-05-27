//var controller = require('../controller/process')
var app = require('express').Router();
const logger = require('../utils/logger');
const toBC = require('../controller/toBC');
const PackageUser = process.env.USER;

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
function getFROM(key) { // for transfer 
  let functionName = '[toBC.getFROM(unparsedAttrs)]';

  return new Promise((resolve, reject) => {
      
      let getuser = {};
      //new kvs().putStore(inv_identity,unparsedAttrs)
      
      try {
        getuser = {
              FROM: key.FROM || '',
          }
          resolve([
            getuser.FROM.toString().toLowerCase(),
          ])
      } catch (e) {
          logger.error(`${functionName} Parsing attributes failed ${e}`);
          reject(`Sorry could not parse attributes: ${e}`);
      }

  });
}
function getBANK(key) { // for transfer 
  let functionName = '[toBC.getFROM(unparsedAttrs)]';

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
  getFROM(req.body).then((getkey) => {
  
}) 
});
app.post('/Accept', function (req, res, next) {
  let functionName = '[API: POST /api/v1/Accept]';
    // const bcuserName = req.body.FROM.toLowerCase()
    console.log(req.body)
new toBC(PackageUser).Accept(req.body).then((result) => {
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
    // const bcuserName = req.body.FROM.toLowerCase()
    console.log(req.body)
new toBC(PackageUser).CreatePO(req.body).then((result) => {
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
app.post('/Get', function (req, res, next) {
  let functionName = '[API: POST /api/v1/Get]';
    // const bcuserName = req.body.USER.toLowerCase()
new toBC(PackageUser).Get(req.body).then((result) => {
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
    // const bcuserName = req.body.USER.toLowerCase()
new toBC(PackageUser).GetValue(req.body).then((result) => {
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
    // const bcuserName = req.body.FROM.toLowerCase()
new toBC(PackageUser).CreateInvoice(req.body).then((result) => {
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
    // const bcuserName = req.body.USER.toLowerCase()
new toBC(PackageUser).CheckInvoice(req.body).then((result) => {
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
    // const bcuserName = req.body.FROM.toLowerCase()
new toBC(PackageUser).Loan(req.body).then((result) => {
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
    // const bcuserName = req.body.BANK.toLowerCase()
new toBC(PackageUser).Request_Verify(req.body).then((result) => {
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
    // const bcuserName = req.body.BANK.toLowerCase()
new toBC(PackageUser).endorse_loan(req.body).then((result) => {
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
    // const bcuserName = req.body.USER.toLowerCase()
    // logger.debug(bcuserName);
    new toBC(PackageUser).GenerateKeyPair(req.body).then((result) => {
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
    // const bcuserName = req.body.USER.toLowerCase()
new toBC(PackageUser).Checkkey(req.body).then((result) => {
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
    // const bcuserName = req.body.USER.toLowerCase()
new toBC(PackageUser).Get_Blockchain(req.body).then((result) => {
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
app.post('/Reject', function (req, res, next) {
  let functionName = '[API: POST /api/v1/Reject]';
    // const bcuserName = req.body.USER.toLowerCase()
    // logger.debug(bcuserName);
    new toBC(PackageUser).Reject(req.body).then((result) => {
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
app.post('/RejectEndorse', function (req, res, next) {
  let functionName = '[API: POST /api/v1/RejectEndorse]';
    // const bcuserName = req.body.USER.toLowerCase()
    // logger.debug(bcuserName);
    new toBC(PackageUser).RejectEndorse(req.body).then((result) => {
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