import mongoose from "mongoose";
import { UserPolicies } from "../Models/UseerPolicies.Model.js";

const connectDB = async () => {
  console.log("MONGODB_URI before Mongo connect:", process.env.MONGODB_URI);

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    const conn = await mongoose.connect(uri);
    
    await UserPolicies.syncIndexes();
    await UserPolicies.updateMany(
      { "processing.inProgress": true },
      { $set: { "processing.inProgress": false } }
    );    
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed");
    console.error(error.message); // <- helps debugging
    process.exit(1);
  }
};

export { connectDB };
