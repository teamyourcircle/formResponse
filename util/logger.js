const { createLogger, format, transports } = require("winston");
const { colorize, combine, timestamp, printf } = format;
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const DailyRotateFile = require("winston-daily-rotate-file");
//message format
const myFormat = printf(info => {
  return `${info.timestamp} : ${info.level}: ${info.message}`;
});
// logging levels
const levels = {
  debug: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  error: 0,
  silly: 6
};
//logger object
const logger = createLogger({
  levels,
  format: combine(timestamp(), colorize(), myFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: "application-%DATE%.log",
      dirname: config.logDirectory,
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "5d"
    })
  ]
});
module.exports = logger;