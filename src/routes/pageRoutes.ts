// src/routes/pageRoutes.ts
import express from "express";
import {
  createPage,
  getPages,
  updatePage,
  deletePage,
  getPagesByRole,
  getPageByPageUrl, // Import fungsi baru
} from "../controllers/pageController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, createPage);
router.get("/role", auth, getPagesByRole); // Letakkan rute ini sebelum rute dinamis
router.get("/", auth, getPages);
router.get("/:pageUrl", auth, getPageByPageUrl); // Ganti rute dinamis dari :pageName menjadi :pageUrl
router.put("/:id", auth, updatePage);
router.delete("/:id", auth, deletePage);

export default router;
