import mongoose from "mongoose";
import { UserPolicies } from "../Models/UseerPolicies.Model.js";
<<<<<<< HEAD

const connectDB = async () => {
  console.log("MONGODB_URI before Mongo connect:", process.env.MONGODB_URI);
=======
import logger from "../Utils/logger.js";
 const staleTime = new Date(Date.now() - (15 * 60 * 1000));
const connectDB = async () => {
  logger.info("MONGODB_URI before Mongo connect:", process.env.MONGODB_URI);
>>>>>>> 8085e14 (added logging and removed locking bug)

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    const conn = await mongoose.connect(uri);
    
    await UserPolicies.syncIndexes();
<<<<<<< HEAD
    await UserPolicies.updateMany(
      { "processing.inProgress": true },
      { $set: { "processing.inProgress": false } }
    );    
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed");
    console.error(error.message); // <- helps debugging
=======
   await UserPolicies.updateMany(
    {
      "processing.inProgress": true,
      "processing.startedAt": { $lt: staleTime }
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
    logger.error(error,"MongoDB connection failed");
    
>>>>>>> 8085e14 (added logging and removed locking bug)
    process.exit(1);
  }
};

export { connectDB };
