import mongoose from "mongoose";
import config from "./env.js";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.db.uri);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection failed", error);
    throw error;
  }
};

export default connectDB;
