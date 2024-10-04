import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import Role from "../models/Role";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../config/logger";
import { AppError } from "../middleware/errorHandler";
import mongoose from "mongoose";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(role)) {
      throw new AppError("Invalid role ID format", 400);
    }

    const existingRole = await Role.findById(role);
    if (!existingRole) {
      throw new AppError("Role not found", 404);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();
    logger.info(`New user registered: ${username}`);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    logger.error("Error registering user:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      if (error.name === "ValidationError") {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error registering user" });
      }
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("role"); // Populate the role

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      throw new AppError("Invalid credentials", 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for user: ${email}`);
      throw new AppError("Invalid credentials", 400);
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    logger.info(`User logged in: ${email}`);

    // Send response with userId, token, username, and role
    res.json({
      userId: user._id, // User ID
      token, // Auth token
      username: user.username, // Username
      role: user.role._id, // Role ID
    });
  } catch (error) {
    logger.error("Error logging in:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Error logging in" });
    }
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    logger.info("Users list fetched");
    res.json(users);
  } catch (error) {
    logger.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Fungsi untuk memperbarui data pengguna
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    // Validasi ID Role
    if (role && !mongoose.Types.ObjectId.isValid(role)) {
      throw new AppError("Invalid role ID format", 400);
    }

    // Validasi jika Role ada
    if (role) {
      const existingRole = await Role.findById(role);
      if (!existingRole) {
        throw new AppError("Role not found", 404);
      }
    }

    // Hash password jika diberikan
    const updateFields: Partial<IUser> = { username, email, role };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    logger.info(`User updated: ${id}`);
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    logger.error("Error updating user:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Error updating user" });
    }
  }
};

// Fungsi untuk menghapus data pengguna
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      throw new AppError("User not found", 404);
    }

    logger.info(`User deleted: ${id}`);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error("Error deleting user:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Error deleting user" });
    }
  }
};
