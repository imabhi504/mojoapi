const responseCodes = require('./httpResponseCode');
const loggingImproved = require('../libs/loggingImproved');

module.exports = {
    sendResponseWithPagination: (responseObj, responseCode, responseMessage, data, paginationData) => {
        return responseObj.send({ 'responseCode': responseCode, 'responseMessage': responseMessage, result: data, paginationData: paginationData })
    },
    sendResponseWithData: (responseObj, responseCode, responseMessage, data, tokn = null) => {
        if(tokn) {
            return responseObj.send({ 'responseCode': responseCode, 'responseMessage': responseMessage, result: data, token: tokn });
        } else {
            return responseObj.send({ 'responseCode': responseCode, 'responseMessage': responseMessage, result: data});
        }
    },
    sendResponseWithoutData: (responseObj, responseCode, responseMessage) => {
        return responseObj.send({ 'responseCode': responseCode, 'responseMessage': responseMessage });
    },
    sendResponsewithError: (handlerInfo, responseObj, responseCode, responseMessage, Err = null) => {
        if(responseCode == responseCodes.INTERNAL_SERVER_ERROR){
            loggingImproved.error(handlerInfo, {ERROR: (Err && Err.message)}, {ERROR_STACK: (Err && Err.stack)});
        }
        return responseObj.send({ responseCode: responseCode, responseMessage: responseMessage, Err: Err })
    },
    sendResponseWithToken: (responseObj, responseCode, responseMessage, tokn) => {
        return responseObj.send({ 'responseCode': responseCode, 'responseMessage': responseMessage, token: tokn });
    },
    sendResponseWithTokenAndResult: (responseObj, responseCode, responseMessage, result, tokn) => {
        return responseObj.send({ 'responseCode': responseCode, 'responseMessage': responseMessage, "result": result, token: tokn });
    },

 };