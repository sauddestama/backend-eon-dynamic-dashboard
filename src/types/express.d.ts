// src/types/express.d.ts
import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        roleId: mongoose.Types.ObjectId;
      };
    }
  }
}
