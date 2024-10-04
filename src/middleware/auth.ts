// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import User from "../models/User";
import mongoose from "mongoose";
import logger from "../config/logger";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    logger.warn("Access denied. No token provided.");
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    console.log("Decoded token:", decoded);

    if (!decoded.userId) {
      logger.warn("Token does not contain userId");
      return res.status(400).json({ message: "Invalid token structure" });
    }

    const user = await User.findById(decoded.userId).populate("role");

    if (!user) {
      logger.warn(`User not found for ID: ${decoded.userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Found user:", user);

    // Menetapkan user ke request sebagai AuthenticatedRequest
    (req as AuthenticatedRequest).user = {
      id: user._id as mongoose.Types.ObjectId,
      roleId: user.role._id as mongoose.Types.ObjectId,
    };

    console.log("User set on request:", (req as AuthenticatedRequest).user);

    next();
  } catch (error) {
    logger.error("Error in auth middleware:", error);
    res
      .status(400)
      .json({ message: "Invalid token.", error: (error as Error).message });
  }
};
