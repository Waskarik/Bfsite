import "dotenv/config";
import mongoose from "mongoose";
import app from "./src/app.js";

const PORT = process.env.PORT || 5005;

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from server/.env");
}

if (!process.env.SECRET_TOKEN) {
  throw new Error("SECRET_TOKEN is missing from server/.env");
}

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`BadFish auth server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
