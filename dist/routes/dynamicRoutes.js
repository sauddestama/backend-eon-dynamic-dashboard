"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/dynamicRoutes.ts
const express_1 = __importDefault(require("express"));
const dynamicController_1 = require("../controllers/dynamicController");
const auth_1 = require("../middleware/auth");
const checkPermission_1 = require("../middleware/checkPermission");
const router = express_1.default.Router();
router.post("/:pageName", auth_1.auth, (0, checkPermission_1.checkPermission)("create"), dynamicController_1.createItem);
router.get("/:pageName", auth_1.auth, (0, checkPermission_1.checkPermission)("read"), dynamicController_1.getItems);
router.put("/:pageName/:id", auth_1.auth, (0, checkPermission_1.checkPermission)("update"), dynamicController_1.updateItem);
router.delete("/:pageName/:id", auth_1.auth, (0, checkPermission_1.checkPermission)("delete"), dynamicController_1.deleteItem);
exports.default = router;
