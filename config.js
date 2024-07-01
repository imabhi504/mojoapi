const _ = require('lodash');
// module variables
// const config = require('./config.json');
const config = require("./enviroment.js");

const defaultConfig = config.development;
//const defaultConfig = config.staging;
const environment = process.env.NODE_ENV || 'development';
//const environment = process.env.NODE_ENV || 'staging';
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);
// global.gConfig = finalConfig;

// as a best practice
// all global variables should be referenced via global. syntax
// and their names should always begin with g
global.gConfig = finalConfig;