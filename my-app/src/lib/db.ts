import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DB = process.env.MONGODB_DB || "courier_app";
const TLS_INSECURE = String(process.env.MONGODB_TLS_INSECURE || "").toLowerCase() === "true";
const TLS_ENABLED = String(process.env.MONGODB_TLS || "").toLowerCase() === "true";
const TLS_CA_FILE = process.env.MONGODB_TLS_CA_FILE || ""; // absolute path to CA bundle if needed

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
    const uri = MONGODB_URI || "mongodb://127.0.0.1:27017/courier_app";
    const isSrv = uri.startsWith("mongodb+srv://");
    const connOpts: mongoose.ConnectOptions = {
      dbName: MONGODB_DB,
      serverSelectionTimeoutMS: 15000,
    };
    // TLS configuration
    // If your cluster requires TLS and you're not using SRV, enable via env.
    if (TLS_ENABLED) {
      (connOpts as any).tls = true;
    }
    // Provide custom CA bundle (e.g., corporate proxy root CA) if needed.
    if (TLS_CA_FILE) {
      (connOpts as any).tlsCAFile = TLS_CA_FILE;
    }
    // Optionally allow insecure TLS for corporate proxies/SSL interception environments.
    // Do NOT use in production; prefer fixing root CA/proxy config.
    if (TLS_INSECURE) {
      // @ts-expect-error mongoose types may not include this option in older versions
      (connOpts as any).tlsAllowInvalidCertificates = true;
      // @ts-expect-error
      (connOpts as any).tlsAllowInvalidHostnames = true;
    }

    cached.promise = mongoose
      .connect(uri, connOpts)
      .then((m) => m)
      .catch((err) => {
        console.error("[dbConnect] Failed to connect to MongoDB", {
          message: err?.message,
          name: err?.name,
          code: (err as any)?.code,
          reason: (err as any)?.reason,
        });
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Add default export for backward compatibility
export default dbConnect;
