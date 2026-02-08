// db.ts
import mongoose from "mongoose";

const uri =
  process.env.MONGO_URI ||
  "mongodb+srv://dbuser:dbuserpassword@cats-db.5pfunin.mongodb.net/?appName=cats-db";

const clientOptions: mongoose.ConnectOptions = {
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

export async function connectDB() {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db!.admin().command({ping: 1});
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
