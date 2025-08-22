import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({path: ".env.local"});
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGO_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose || { con: null, promise: null };
global.mongoose = cached;

export async function connectToDatabase() {
    if (cached.con) {
        return cached.con;
    }
    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI)
            .then(m => m);
    }
    cached.con = await cached.promise;
    return cached.con;
}
