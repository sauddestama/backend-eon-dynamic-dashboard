"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/pageRoutes.ts
const express_1 = __importDefault(require("express"));
const pageController_1 = require("../controllers/pageController");
const auth_1 = require("../middleware/auth");
const checkPermission_1 = require("../middleware/checkPermission");
const router = express_1.default.Router();
router.post("/", auth_1.auth, pageController_1.createPage);
router.get("/", auth_1.auth, pageController_1.getPages);
router.put("/:id", auth_1.auth, pageController_1.updatePage);
router.delete("/:id", auth_1.auth, pageController_1.deletePage);
router.get("/role", auth_1.auth, pageController_1.getPagesByRole); // Pastikan auth digunakan untuk validasi user
router.get("/:pageName", auth_1.auth, (0, checkPermission_1.checkPermission)("read"), pageController_1.getPages);
exports.default = router;
