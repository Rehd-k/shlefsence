import mongoose from "mongoose";

function resolveMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (uri) return uri;

  if (process.env.NODE_ENV === "production") {
    throw new Error("MONGODB_URI environment variable is required in production");
  }

  return "mongodb://localhost:27017/shelfsense";
}

/**
 * Global variable for caching Mongoose connection across hot reloads in Next.js development.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached?.conn) {
    return cached.conn;
  }

  const MONGODB_URI = resolveMongoUri();

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
