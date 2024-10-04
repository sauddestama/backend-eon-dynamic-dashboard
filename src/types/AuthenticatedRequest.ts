// src/types/AuthenticatedRequest.ts
import { Request } from "express";
import mongoose from "mongoose";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: mongoose.Types.ObjectId;
    roleId: mongoose.Types.ObjectId;
  };
}
