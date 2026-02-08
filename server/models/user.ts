// models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // later: hash with bcrypt
  color: { type: String, required: true },
});

export const User = mongoose.model("User", UserSchema);
