var url = require("url");
var winston = require("winston");
var winstonRotate = require("winston-daily-rotate-file");
var path = require("path");
var zlib = require('zlib');
var useragent = require('useragent');

var Logger = {};
Logger.options = {
  name: "user-services-requests",
  filename: path.join(__dirname, "..", "logs/user-services-requests.log"),
  datePattern: ".dd-MM-yyyy",
};

Logger.requestFormat = {
  statusCode: ":statusCode",
  method: ":method",
  url: ":url[pathname]",
  responseTime: ":responseTime ms",
  ip: ":ip",
  userAgent: ":userAgent",
  data: ":data",
  response: ":response",
  message: ":message",
};

// Logger.winstonRotateObj = new winstonRotate(Logger.options);
Logger.transports = [new (winston.transports.Console)()];
Logger.winstonLogger = new winston.Logger({ transports: Logger.transports });

Logger.create = function () {
  return function (req, res, next) {
    var logger = Logger.winstonLogger;
    var format = Logger.requestFormat;

    var requestEnd = res.end,
      requestedUrl = url.parse(req.originalUrl),
      startTime = new Date();

    // Proxy the real end function
    res.end = function (chunk, encoding) {
      res.end = requestEnd;
      res.end(chunk, encoding);

      if (res.get("Content-Encoding") == "gzip") {
        zlib.gunzip(chunk, function (err, result) {
          var chunk = (result || "").toString();
          reqResLogger(chunk);
        });
      } else {
        reqResLogger(chunk);
      }

      // Our format argument above contains key-value pairs for the output
      // object we send to Winston. Let's use this to format our results:
      function reqResLogger(chunk) {
        var data = {};
        var tokens = {
          ":date": startTime.toISOString(),
          ":statusCode": res.statusCode,
          ":method": req.method,
          ":responseTime": new Date() - startTime,
          ":url\\[([a-z]+)\\]": function (str, segment) {
            return requestedUrl[segment];
          },
          ":ip":
            req.headers["x-forwarded-for"] ||
            req.ip ||
            req.connection.remoteAddress,
          ":userAgent":
            req.headers["user-agent"] ||
            useragent.parse(req.headers["user-agent"]).toString(),
          ":data": "Query=" + JSON.stringify(req.query) + " ,Params=" + JSON.stringify(req.params) + " ,Body=" + JSON.stringify(req.body),
          ":response": chunk,
          ":message": JSON.stringify(req.headers),
        };

        // Let's define a default format
        if (typeof format !== "object") {
          format = {
            date: ":date",
            status: ":statusCode",
            method: ":method",
            url: ":url[pathname]",
            response_time: ":responseTime",
            user_agent: ":userAgent",
          };
        }

        // ... and replace our tokens!
        var replaceToken = function (str, match) {
          return tokens[token];
        };
        for (var key in format) {
          data[key] = format[key];
          for (var token in tokens) {
            data[key] = data[key].replace(
              new RegExp(token),
              typeof tokens[token] === "function" ? tokens[token] : replaceToken
            );
          }
        }
        data = JSON.stringify(data);
        logger.info(data);
      }
    };
    next();
  };
};

module.exports = Logger;