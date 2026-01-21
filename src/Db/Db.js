import mongoose from "mongoose";
import { UserPolicies } from "../Models/UseerPolicies.Model.js";

import logger from "../Utils/logger.js";
 const staleTime = new Date(Date.now() - (15 * 60 * 1000));
const connectDB = async () => {
  logger.info("MONGODB_URI before Mongo connect:", process.env.MONGODB_URI);


  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    const conn = await mongoose.connect(uri);
    
    await UserPolicies.syncIndexes();

   await UserPolicies.updateMany(
    {
      "processing.inProgress": true,
     
    },
    {
      $set: {
        "processing.inProgress": false,
        "processing.startedAt": null,
        "processing.lockId": null
      }
    }
  );

   
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("MongoDB connection failed", error);
    

    process.exit(1);
  }
};

export { connectDB };
