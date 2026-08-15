import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import aiRoutes from "./routes/ai";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "devconnect-super-secret-key";
process.env.JWT_SECRET = JWT_SECRET;

const app = express(); // control center of backend 

const allowedOrigins = [
  "https://dev-connect-ui.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json()); // Converts incoming JSON into req.body

//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Devconnect API running" });
});

async function startDb() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  const connectWithMemoryFallback = async () => {
    const { MongoMemoryServer } = eval("require")("mongodb-memory-server") as any;
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log("Connected to in-memory MongoDB fallback");
  };

  try {
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log("MongoDB connected");
      return;
    }

    await connectWithMemoryFallback();
  } catch (err) {
    console.log("DB Error:", err);
    try {
      await connectWithMemoryFallback();
      console.log("Recovered by falling back to in-memory MongoDB");
    } catch (memoryErr) {
      console.log("Failed to start in-memory MongoDB:", memoryErr);
    }
  }
}

const PORT = process.env.PORT || 5001;

async function startServer() {
  await startDb();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
