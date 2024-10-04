// src/routes/dynamicRoutes.ts

import express from "express";
import multer from "multer";
import {
  createItem,
  getItemDinamisByPageUrl,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/dynamicController";
import { auth } from "../middleware/auth";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

// Konfigurasi multer untuk menyimpan file di memory
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/:pageUrl",
  auth,
  checkPermission("create"),
  upload.any(),
  createItem
);
router.get("/:pageUrl", auth, checkPermission("read"), getItemDinamisByPageUrl);
router.get("/:pageUrl/:id", auth, checkPermission("read"), getItemById);
router.put(
  "/:pageUrl/:id",
  auth,
  checkPermission("update"),
  upload.any(),
  updateItem
);
router.delete("/:pageUrl/:id", auth, checkPermission("delete"), deleteItem);

export default router;
