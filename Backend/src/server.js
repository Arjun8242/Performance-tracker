import app from "../src/app.js";
import config from "../src/config/env.js";
import logger from "../src/utils/logger.js";
import connectDB from "../src/config/db.js";

let server;

async function startServer() {
  try {
    await connectDB();

    server = app.listen(config.port, () => {
      logger.info(
        `Server listening on port ${config.port} in ${config.env} mode`
      );
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

const shutdown = (signal, error) => {
  if (signal) {
    logger.info(`${signal} received. Shutting down gracefully.`);
  }

  if (error) {
    logger.error(error);
  }

  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("uncaughtException", (err) => shutdown("uncaughtException", err));
process.on("unhandledRejection", (err) => shutdown("unhandledRejection", err));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();
