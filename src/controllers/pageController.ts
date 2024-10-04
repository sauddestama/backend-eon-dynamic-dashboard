// src/controllers/pageController.ts
import { Request, Response } from "express";
import Page from "../models/Page";
import Role from "../models/Role";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import mongoose from "mongoose";
import logger from "../config/logger";
import { AppError } from "../middleware/errorHandler";

export const createPage = async (req: Request, res: Response) => {
  try {
    const { name, fields } = req.body;

    const nameString = String(name);
    const collectionName = nameString.toLowerCase().replace(/\s+/g, "-");
    const url = "/" + nameString.toLowerCase().replace(/\s+/g, "-");

    const page = new Page({
      name: nameString,
      collectionName,
      fields,
      url,
    });

    await page.save();

    // Membuat koleksi baru
    if (mongoose.connection.readyState !== 1) {
      throw new AppError("Database connection is not established", 500);
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new AppError("Database instance is not available", 500);
    }

    try {
      await db.createCollection(collectionName);
      logger.info(`New collection created: ${collectionName}`);
    } catch (collectionError) {
      logger.error(
        `Error creating collection ${collectionName}:`,
        collectionError
      );
      // Jika koleksi sudah ada, kita bisa mengabaikan error ini
      if ((collectionError as any).code !== 48) {
        throw new AppError(
          `Failed to create collection: ${(collectionError as Error).message}`,
          500
        );
      }
    }

    // Proses penambahan izin ke role Administrator
    const adminRoleId = "66f4ef543336e7123f662bd1";

    const updateRoleResult = await Role.findByIdAndUpdate(
      adminRoleId,
      {
        $push: {
          pagePermissions: {
            pageId: page._id,
            actions: {
              create: true,
              update: true,
              delete: true,
            },
            _id: new mongoose.Types.ObjectId(),
          },
        },
      },
      { new: true }
    );

    if (!updateRoleResult) {
      throw new AppError(
        "Failed to update Administrator role with new page permissions",
        500
      );
    }

    logger.info(
      `New page created: ${nameString} and added to Administrator role in both pages and roles collections`
    );
    res.status(201).json({
      message: "Page created and added to Administrator role successfully",
      page,
    });
  } catch (error: unknown) {
    logger.error("Error creating page:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      if (error.name === "ValidationError") {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error creating page" });
      }
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getPagesByRole = async (req: Request, res: Response) => {
  try {
    const userReq = req as AuthenticatedRequest;

    console.log("User from request:", userReq.user);

    if (!userReq.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const roleId = userReq.user.roleId;
    console.log("Role ID:", roleId);

    const role = await Role.findById(roleId).populate("pagePermissions.pageId");

    if (!role) {
      logger.error(`Role not found for ID: ${roleId}`);
      return res.status(404).json({ message: "Role not found" });
    }

    console.log("Found role:", role);

    const allowedPages = await Promise.all(
      role.pagePermissions.map(async (permission) => {
        const page = await Page.findById(permission.pageId);
        return page
          ? {
              id: page._id,
              name: page.name,
              url: page.url,
              actions: permission.actions,
            }
          : null;
      })
    );

    const filteredPages = allowedPages.filter((page) => page !== null);

    console.log("Allowed pages:", filteredPages);

    res.json(filteredPages);
  } catch (error) {
    console.error("Error in getPagesByRole:", error);
    res.status(500).json({
      message: "Error fetching pages by role",
      error: (error as Error).message,
    });
  }
};

export const getPages = async (req: Request, res: Response) => {
  try {
    const pages = await Page.find();
    res.json(pages);
  } catch (error) {
    logger.error("Error fetching pages:", error);
    res.status(500).json({ message: "Error fetching pages" });
  }
};

export const getPageByPageUrl = async (req: Request, res: Response) => {
  try {
    let { pageUrl } = req.params;

    // Pastikan URL selalu dalam huruf kecil dan format konsisten
    pageUrl = pageUrl.toLowerCase().replace(/-/g, "-");

    // Mencari halaman berdasarkan URL
    const page = await Page.findOne({ url: `/${pageUrl}` });

    if (!page) {
      return res
        .status(404)
        .json({ message: `Page with URL ${pageUrl} not found` });
    }

    res.json(page);
  } catch (error) {
    logger.error(`Error fetching page with URL ${req.params.pageUrl}:`, error);
    res.status(500).json({ message: "Error fetching page by URL" });
  }
};

export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedPage = await Page.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedPage);
  } catch (error) {
    logger.error("Error updating page:", error);
    res.status(500).json({ message: "Error updating page" });
  }
};

export const deletePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Temukan page berdasarkan ID
    const pageToDelete = await Page.findById(id);
    if (!pageToDelete) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Periksa apakah koneksi database sudah tersedia
    if (mongoose.connection && mongoose.connection.db) {
      const collectionName = pageToDelete.collectionName;

      // Hapus data koleksi terkait berdasarkan collectionName
      await mongoose.connection.db
        .dropCollection(collectionName)
        .then(() => {
          logger.info(`Collection ${collectionName} deleted successfully`);
        })
        .catch((err: any) => {
          logger.error(`Error dropping collection ${collectionName}:`, err);
        });
    } else {
      logger.error("Database connection is not established.");
    }

    // Hapus page dari koleksi "pages"
    await Page.findByIdAndDelete(id);

    // Hapus pagePermissions terkait dari semua roles yang memiliki pageId yang sama
    await Role.updateMany(
      {},
      {
        $pull: { pagePermissions: { pageId: id } },
      }
    );

    res.json({ message: "Page and related permissions deleted successfully" });
  } catch (error) {
    logger.error("Error deleting page:", error);
    res.status(500).json({ message: "Error deleting page" });
  }
};
