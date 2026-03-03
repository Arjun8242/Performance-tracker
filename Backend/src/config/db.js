import mongoose from "mongoose";
import config from "./env.js";
import logger from "../utils/logger.js";

mongoose.set('strictQuery', true);

const connectDB = async (retries = 5, delayMs = 5000) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      await mongoose.connect(config.db.uri, {
        autoIndex: config.env !== 'production',
        serverSelectionTimeoutMS: 10000,
      });
      logger.info("MongoDB connected successfully");

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      return;
    } catch (error) {
      attempt += 1;
      logger.error(`MongoDB connection attempt ${attempt} failed`, { message: error.message });

      if (attempt >= retries) {
        logger.error('MongoDB connection failed after maximum retries');
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

export default connectDB;
