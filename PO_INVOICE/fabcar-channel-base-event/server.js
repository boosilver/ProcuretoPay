// var express = require('express');
// var app = express();
// var port = process.env.port || 3000;
// const swagger    =process.env.SWAGGER

// const swaggerUi = require('swagger-ui-express'),
//     swaggerDocument = require(`./api/swagger.json`);

// var bodyParser = require('body-parser');
// // parse application/json
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//     extended: true
// }));

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use('/api', require('./router/index'));

// app.listen(port, function() {
//     console.log('Starting node.js on port ' + port);
// });

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const blockchain = require('./blockchain/service');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 3000;
// const swagger    =process.env.SWAGGER
 const cors = require('cors')

// const swaggerUi = require('swagger-ui-express'),
//     swaggerDocument = require(`./api/${swagger}`);

/*
    Initialising the blockchain services
 */
blockchain.init();
// setInterval(function() {
//     logger.info("Ping Invoke!!")
//     blockchain.pingInvoke().then((result) => {
//         logger.debug("Ping Invoke :"+result.message)
//     })
// }, 4000);
   


app.use(morgan('dev', {
    'stream': logger.stream
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(cors({origin: '*'}));

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', require('./router'));

app.use((req, res, next) => {
    res.status(404);
    res.json({
        status: 404,
        message: "Resource not found"
    });
    next();
});

app.listen(port);
console.log(`Server started on ${port}`);