import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    const conn = await mongoose.connect(uri);
    
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed");
    console.error(error.message); // <- helps debugging
    process.exit(1);
  }
};

export { connectDB };
