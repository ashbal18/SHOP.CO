// import winston from "winston";


// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.combine(
//     winston.format.colorize(),
//     winston.format.timestamp(),
//     winston.format.printf(({ timestamp, level, message }) => {
//         return `${timestamp} ${level}: ${message}`;
//         })   
// ),

//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: "logs/app.log" }),
//     new winston.transports.File({  level: "error", filename:"logs/error.log" }),
//     new winston.transports.File({ level: "info", filename:"logs/info.log" }),
//   ],
// });

// export default logger;

