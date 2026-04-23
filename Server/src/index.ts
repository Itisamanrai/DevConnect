import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import aiRoutes from "./routes/ai";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://dev-connect-ui.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json());

//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Devconnect API running" });
});

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Error:", err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
