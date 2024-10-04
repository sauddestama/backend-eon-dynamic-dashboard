"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.getRoles = exports.createRole = void 0;
const Role_1 = __importDefault(require("../models/Role"));
const Page_1 = __importDefault(require("../models/Page"));
const logger_1 = __importDefault(require("../config/logger"));
const errorHandler_1 = require("../middleware/errorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, pagePermissions } = req.body;
        // Validate pagePermissions
        if (pagePermissions && pagePermissions.length > 0) {
            for (const permission of pagePermissions) {
                if (!mongoose_1.default.Types.ObjectId.isValid(permission.pageId)) {
                    throw new errorHandler_1.AppError(`Invalid page ID format: ${permission.pageId}`, 400);
                }
                const pageExists = yield Page_1.default.findById(permission.pageId);
                if (!pageExists) {
                    throw new errorHandler_1.AppError(`Page not found with ID: ${permission.pageId}`, 404);
                }
            }
        }
        const role = new Role_1.default({ name, pagePermissions });
        yield role.save();
        logger_1.default.info(`New role created: ${name}`);
        res.status(201).json({ message: "Role created successfully", role });
    }
    catch (error) {
        logger_1.default.error("Error creating role:", error);
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.createRole = createRole;
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield Role_1.default.find();
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching roles", error });
    }
});
exports.getRoles = getRoles;
const updateRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, pagePermissions } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errorHandler_1.AppError("Invalid role ID format", 400);
        }
        // Validate pagePermissions
        if (pagePermissions && pagePermissions.length > 0) {
            for (const permission of pagePermissions) {
                if (!mongoose_1.default.Types.ObjectId.isValid(permission.pageId)) {
                    throw new errorHandler_1.AppError(`Invalid page ID format: ${permission.pageId}`, 400);
                }
                const pageExists = yield Page_1.default.findById(permission.pageId);
                if (!pageExists) {
                    throw new errorHandler_1.AppError(`Page not found with ID: ${permission.pageId}`, 404);
                }
            }
        }
        const updatedRole = yield Role_1.default.findByIdAndUpdate(id, { name, pagePermissions }, { new: true, runValidators: true });
        if (!updatedRole) {
            throw new errorHandler_1.AppError("Role not found", 404);
        }
        logger_1.default.info(`Role updated: ${name}`);
        res.json({ message: "Role updated successfully", role: updatedRole });
    }
    catch (error) {
        logger_1.default.error("Error updating role:", error);
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.updateRole = updateRole;
const deleteRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const role = yield Role_1.default.findByIdAndDelete(id);
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.json({ message: "Role deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting role", error });
    }
});
exports.deleteRole = deleteRole;
