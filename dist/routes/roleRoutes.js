"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleController_1 = require("../controllers/roleController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/", roleController_1.createRole); // Remove auth middleware for testing
router.get("/", auth_1.auth, roleController_1.getRoles);
router.put("/:id", auth_1.auth, roleController_1.updateRole);
router.delete("/:id", auth_1.auth, roleController_1.deleteRole);
exports.default = router;
