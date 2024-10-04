// src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import userRoutes from "./routes/userRoutes";
import pageRoutes from "./routes/pageRoutes";
import roleRoutes from "./routes/roleRoutes";
import dynamicRoutes from "./routes/dynamicRoutes";
import { errorHandler } from "./middleware/errorHandler";
import path from "path";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Routes
app.use("/api/users", userRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/dynamic", dynamicRoutes);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
