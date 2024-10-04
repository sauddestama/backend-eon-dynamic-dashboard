// src/middleware/checkPermission.ts
import { Request, Response, NextFunction } from "express";
import Role from "../models/Role";
import Page from "../models/Page";
import { AppError } from "./errorHandler";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest"; // Gunakan tipe AuthenticatedRequest

// Middleware untuk memeriksa izin akses berdasarkan peran pengguna dan halaman.
export const checkPermission = (
  action: "create" | "read" | "update" | "delete"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageUrl } = req.params; // Gunakan pageUrl, bukan pageName.
      const userReq = req as AuthenticatedRequest; // Casting ke AuthenticatedRequest untuk mendapatkan user ID.

      console.log("Checking permission for:", {
        user: userReq.user,
        pageUrl,
        action,
      });

      // Periksa apakah pengguna telah terautentikasi.
      if (!userReq.user || !userReq.user.id) {
        logger.warn("User not authenticated");
        throw new AppError("User not authenticated", 401);
      }

      // Temukan peran pengguna berdasarkan user.roleId.
      const role = await Role.findById(userReq.user.roleId);
      if (!role) {
        logger.warn(`Role not found for ID: ${userReq.user.roleId}`);
        throw new AppError("Role not found", 404);
      }

      console.log("Found role:", role);

      // Cari halaman berdasarkan pageUrl, bukan pageName.
      const page = await Page.findOne({ url: `/${pageUrl.toLowerCase()}` });
      if (!page) {
        logger.warn(`Page not found for URL: ${pageUrl}`);
        return res.status(404).json({ error: "Page not found" });
      }

      console.log("Found page:", page);

      // Temukan izin akses pada peran berdasarkan pageId.
      const pagePermission = role.pagePermissions.find(
        (perm) => perm.pageId.toString() === page._id.toString()
      );

      // Jika izin akses tidak ditemukan, tolak akses.
      if (!pagePermission) {
        logger.warn(
          `Access denied for user ${userReq.user.id} on page ${pageUrl}`
        );
        throw new AppError("Access denied", 403);
      }

      // Jika izin `read` atau izin spesifik (create, update, delete) diizinkan, lanjutkan.
      if (action === "read" || pagePermission.actions[action]) {
        console.log("Permission granted");
        next();
      } else {
        logger.warn(`Access denied for action ${action} on page ${pageUrl}`);
        throw new AppError("Access denied", 403);
      }
    } catch (error) {
      logger.error("Error in checkPermission:", error);
      next(error);
    }
  };
};
