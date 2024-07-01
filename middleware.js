let jwt = require('jsonwebtoken');
const config = require('./config.js');
const secret = process.env.SECRET_KEY;
var https = require('http');
// user services
const userService = require('./services/userServices.js');// user services

const responseHandle = require('./globalFunctions/responseHandle.js');
const responseCode = require('./globalFunctions/httpResponseCode.js');
const httpResponseMessage = require('./globalFunctions/httpResponseMessage.js');
const ObjectId = require('mongodb').ObjectID;
const loggingImproved = require('./libs/loggingImproved');

let checkToken = (req, res, next) => {
    let handlerInfo = {
        apiModule: "middleware",
        apiHandler: "checkToken"
    };

    loggingImproved.trace(handlerInfo, {REQUEST: req.body});
    let responseMessage = "";
    try {
        let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }
    
        if (token) {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, err);
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            return responseHandle.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, 'Auth token is not supplied');
        }
    } catch (error) {
        responseMessage = "Something Went Wrong!";
        return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, responseMessage, error)
    }
};

let checkAdminUser = (req, res, next) => {
    let handlerInfo = {
        apiModule: "middleware",
        apiHandler: "checkAdminUser"
    };

    loggingImproved.trace(handlerInfo, {REQUEST: req.body});
    let responseMessage = "";
    try {
        if(req.body && req.body.decoded){
            let query = {email : req.body.decoded.email.toLowerCase() };
            adminService.findData(query, (error, result) => {
                if (error) {
                    return responseHandle.sendResponsewithError(
                        handlerInfo,
                        res, 
                        responseCode.INTERNAL_SERVER_ERROR, 
                        error
                    );
                } else if (result.status == "1") {
                    next();
                } else {
                    return responseHandle.sendResponseWithData(
                        res, 
                        responseCode.UNAUTHORIZED, 
                        'You are not able for this action'
                    );
                }
            });
        }else{
            next();
        }
    } catch (error) {
        responseMessage = "Something Went Wrong!";
        return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, responseMessage, error)
    }
};

let checkUser = (req, res, next) => {
    let handlerInfo = {
        apiModule: "middleware",
        apiHandler: "checkUser"
    };

    loggingImproved.trace(handlerInfo, {REQUEST: req.body});
    let responseMessage = "";
    try {
        if(req.body && req.body.decoded){
            let query = {email : req.body.decoded.email.toLowerCase() };
            userService.findData(query, (error, result) => {
                if (error) {
                    return responseHandle.sendResponsewithError(
                        handlerInfo,
                        res, 
                        responseCode.INTERNAL_SERVER_ERROR, 
                        error
                    );
                } else if (!result) {
                    return responseHandle.sendResponsewithError(
                        handlerInfo,
                        res, 
                        responseCode.UNAUTHORIZED, 
                        'User not found'
                    );
                }else if (result && result.status == "2") {
                    return responseHandle.sendResponsewithError(
                        handlerInfo,
                        res, 
                        responseCode.FORBIDDEN, 
                        'User is barred'
                    );
                }else {
                    next();
                }
            });
           }else{
               next();
           }
    } catch (error) {
        responseMessage = "Something Went Wrong!";
        return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, responseMessage, error)
    }
};

let checkDiscoveryToken = (req, res, next) => {
    let handlerInfo = {
        apiModule: "middleware",
        apiHandler: "checkDiscoveryToken"
    };

    loggingImproved.trace(handlerInfo, {REQUEST: req.body});
    let responseMessage = "";
    try {
        if (req.body && req.body.decoded) {
            let user = req.body.decoded;
            if (user && (user.type == 1 || user.type == 3)) {
                next();
            } else {
                return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.UNAUTHORIZED, 'Unauthorized');
            }
        } else {
            return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.UNAUTHORIZED, 'Unauthorized');
        }
    } catch (error) {
        responseMessage = "Something Went Wrong!";
        return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, responseMessage, error)
    }
} 
module.exports = {
    checkToken,
    checkAdminUser,
    checkUser,
    checkDiscoveryToken
}