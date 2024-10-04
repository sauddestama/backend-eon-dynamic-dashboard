import { Request, Response } from "express";
import Role, { IRole } from "../models/Role";
import Page from "../models/Page";
import logger from "../config/logger";
import { AppError } from "../middleware/errorHandler";
import mongoose from "mongoose";

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, pagePermissions } = req.body;

    // Validate pagePermissions
    if (pagePermissions && pagePermissions.length > 0) {
      for (const permission of pagePermissions) {
        if (!mongoose.Types.ObjectId.isValid(permission.pageId)) {
          throw new AppError(
            `Invalid page ID format: ${permission.pageId}`,
            400
          );
        }
        const pageExists = await Page.findById(permission.pageId);
        if (!pageExists) {
          throw new AppError(
            `Page not found with ID: ${permission.pageId}`,
            404
          );
        }
      }
    }

    const role = new Role({ name, pagePermissions });
    await role.save();
    logger.info(`New role created: ${name}`);
    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    logger.error("Error creating role:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching roles", error });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, pagePermissions } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid role ID format", 400);
    }

    // Validate pagePermissions
    if (pagePermissions && pagePermissions.length > 0) {
      for (const permission of pagePermissions) {
        if (!mongoose.Types.ObjectId.isValid(permission.pageId)) {
          throw new AppError(
            `Invalid page ID format: ${permission.pageId}`,
            400
          );
        }
        const pageExists = await Page.findById(permission.pageId);
        if (!pageExists) {
          throw new AppError(
            `Page not found with ID: ${permission.pageId}`,
            404
          );
        }
      }
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { name, pagePermissions },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      throw new AppError("Role not found", 404);
    }

    logger.info(`Role updated: ${name}`);
    res.json({ message: "Role updated successfully", role: updatedRole });
  } catch (error) {
    logger.error("Error updating role:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await Role.findByIdAndDelete(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting role", error });
  }
};
