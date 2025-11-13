import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MONGODB CONNECTED", conn.connection.host);
  } catch (error) {
    console.log("error connection in mongodb", error);
    process.exit(1); 
  }
};
