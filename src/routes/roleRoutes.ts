import express from "express";
import {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
} from "../controllers/roleController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", createRole); // Remove auth middleware for testing
router.get("/", auth, getRoles);
router.put("/:id", auth, updateRole);
router.delete("/:id", auth, deleteRole);

export default router;
