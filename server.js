require('newrelic');
const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = express();
require('dotenv').config();
const config = require('./config.js');
bodyParser = require('body-parser');
const dbConnect = require('./mongodb');
const Sentry = require("@sentry/node");
const logger = require('morgan');
const fs = require('fs');
const requestLogger = require('./libs/logger');
const loggingImproved = require('./libs/loggingImproved');
// Sentry.init({
//   dsn: "https://86d2f2d0b6b947a18b8613e4d2372ba0@o529283.ingest.sentry.io/5649005",
//   environment: process.env.REPO_NAME,
//   // We recommend adjusting this value in production, or using tracesSampler
//   // for finer control
//   //tracesSampleRate: 1.0,
// });

const logDir = './logs';
if (!fs.existsSync(logDir)){
  fs.mkdirSync(logDir);
}

// Middleware to create log file daily for each request
app.use(requestLogger.create());

// Logger MiddleWare
app.use(logger('dev'));

const server = require('http').createServer(app)
cors = require('cors');
const route = require('./routes/userRoute.js');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(bodyParser.json({limit: '100mb', extended: true}));
app.use(cors());

//For Cron
// require('./cron');

// Event 'uncaughtException'
process.on('uncaughtException', (error, source) => {
  let handlerInfo = {
    apiModule: "serverInit",
    apiHandler: "uncaughtException"
  }
  loggingImproved.error(handlerInfo, { ERROR_STACK: error.stack }, { ERROR_MESSAGE: error.message });
});
// Event 'unhandledRejection'
process.on('unhandledRejection', (error) => {
  let handlerInfo = {
    apiModule: "serverInit",
    apiHandler: "unhandledRejection"
  }
  loggingImproved.error(handlerInfo, { ERROR_STACK: error.stack }, { ERROR_MESSAGE: error.message });
});

//call route by api
app.use('/api', route);
//connectivity forn listen PORT
server.listen(process.env.PORT, () => {
  let handlerInfo = {
    apiModule: "serverInit",
    apiHandler: "listening"
  };
  loggingImproved.trace(handlerInfo, {EVENT: `User service app listening on port ${process.env.PORT}`});
});