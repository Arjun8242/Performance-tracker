import winston from "winston";

const isDev = process.env.NODE_ENV === "development";

const consoleTransport = new winston.transports.Console({
  format: isDev
    ? winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: "HH:mm:ss" }),
      winston.format.printf(
        ({ timestamp, level, message, ...meta }) =>
          `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""
          }`
      )
    )
    : winston.format.json(),
});

const logger = winston.createLogger({
  level: isDev ? "debug" : "info",
  levels: winston.config.npm.levels,
  exitOnError: false,
  transports: [consoleTransport],
});

export default logger;
