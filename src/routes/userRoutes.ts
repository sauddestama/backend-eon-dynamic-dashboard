// File: backend/src/routes/userRoutes.ts

import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import {
  registerUser,
  loginUser,
  getUsers,
  updateUser, // Import fungsi updateUser
  deleteUser, // Import fungsi deleteUser
} from "../controllers/userController";
import { auth } from "../middleware/auth";

const router = express.Router();

// Validasi dan rute register
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("role").notEmpty().withMessage("Role is required"),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  registerUser
);

// Validasi dan rute login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  loginUser
);

// Rute untuk mendapatkan daftar pengguna
router.get("/", auth, getUsers);

// Rute baru untuk memperbarui pengguna berdasarkan ID
router.put(
  "/:id",
  auth,
  [
    body("username")
      .optional()
      .notEmpty()
      .withMessage("Username cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("role").optional().notEmpty().withMessage("Role cannot be empty"),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateUser
);

// Rute baru untuk menghapus pengguna berdasarkan ID
router.delete("/:id", auth, deleteUser);

export default router;
