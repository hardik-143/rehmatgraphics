import mongoose from "mongoose";
import { MONGODB_URI } from "@/app/env";

const uri = MONGODB_URI;

declare global {
  var __mongooseConnection: Promise<typeof mongoose> | undefined;
}

export const connectToDatabase = async () => {
  if (global.__mongooseConnection) {
    return global.__mongooseConnection;
  }

  const connectionPromise = mongoose.connect(uri, {
    bufferCommands: false,
  });

  if (process.env.VERCEL_ENV !== "production") {
    global.__mongooseConnection = connectionPromise;
  }

  return connectionPromise;
};
