import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.warn("MONGODB_URI is not set. Please configure it in your environment.");
}

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// @ts-ignore
let cached: GlobalMongoose = global.mongoose || { conn: null, promise: null };

// @ts-ignore
if (!global.mongoose) {
  // @ts-ignore
  global.mongoose = cached;
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI || "mongodb://127.0.0.1:27017/courier_app", {
        dbName: process.env.MONGODB_DB || "courier_app",
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
