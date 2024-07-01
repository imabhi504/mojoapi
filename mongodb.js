const mongoose = require('mongoose');
const config = require('./config.js');
const db_name = process.env.DATABASE_NAME;
const host = process.env.DB_HOST;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const loggingImproved = require('./libs/loggingImproved');

const DB_URL = `mongodb://${host}/${db_name}`;
const mongoOptions = {
  useNewUrlParser: true,
  poolSize: 20, 
  autoReconnect: true
}
mongoose.connect(DB_URL, mongoOptions);

/************************************ Events of mongoose connection. ******************************************************/
// CONNECTION EVENTS

// When successfully connected
mongoose.connection.on('connected',  ()=> {
  let handlerInfo = {
    apiModule: "mongodbHandler",
    apiHandler: "db_connected"
  };
  loggingImproved.trace(handlerInfo, {EVENT: `SUCCESS - Mongoose default connection open to ${DB_URL}`})
  mongoose.set('useFindAndModify', false);
});
// If the connection throws an error
mongoose.connection.on('error', (err) => {
  let handlerInfo = {
    apiModule: "mongodbHandler",
    apiHandler: "db_error"
  };
  loggingImproved.error(handlerInfo, {EVENT: `ERROR - Mongoose default connection error`}, {ERROR: err})
  mongoose.disconnect();
});
// When the connection is disconnected
mongoose.connection.on('disconnected',  () => {
  let handlerInfo = {
    apiModule: "mongodbHandler",
    apiHandler: "db_disconnected"
  };
  loggingImproved.trace(handlerInfo, {EVENT: `WARNING - Mongoose default connection disconnected`})
  mongoose.connect(DB_URL, mongoOptions);
});
// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  let handlerInfo = {
    apiModule: "mongodbHandler",
    apiHandler: "db_close"
  };
  loggingImproved.trace(handlerInfo, { EVENT: `WARNING - Received Signal SIGINT To Terminate App` });
  mongoose.connection.close( (err)=> {
    if (err) {
      loggingImproved.error(handlerInfo, { ERROR_STACK: err.stack }, { ERROR_MESSAGE: err.message });
    }
    loggingImproved.trace(handlerInfo, {EVENT: `WARNING - Mongoose default connection disconnected through app termination`});
    process.exit(0);
  });
});

// If the Node process ends, close the Mongoose connection
process.on('SIGTERM', () => {
  let handlerInfo = {
    apiModule: "mongodbHandler",
    apiHandler: "db_close"
  };
  loggingImproved.trace(handlerInfo, {EVENT: `WARNING - Received Signal SIGTERM To Terminate App`});
  mongoose.connection.close((err) => {
    if (err) {
      loggingImproved.error(handlerInfo, { ERROR_STACK: err.stack }, { ERROR_MESSAGE: err.message });
    }
    loggingImproved.trace(handlerInfo, { EVENT: `WARNING - Mongoose default connection disconnected through app termination` });
    process.exit(0);
  });
});