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
exports.deletePage = exports.updatePage = exports.getPages = exports.getPagesByRole = exports.createPage = void 0;
const Page_1 = __importDefault(require("../models/Page"));
const Role_1 = __importDefault(require("../models/Role"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../config/logger"));
const errorHandler_1 = require("../middleware/errorHandler");
const createPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, fields } = req.body;
        const collectionName = name.toLowerCase().replace(/\s+/g, "_");
        const url = "/" + name.toLowerCase().replace(/\s+/g, "-");
        const page = new Page_1.default({
            name,
            collectionName,
            fields,
            url,
        });
        yield page.save();
        const schema = new mongoose_1.default.Schema(Object.assign(Object.assign({}, fields.reduce((acc, field) => {
            acc[field.fieldName] = { type: field.fieldType };
            return acc;
        }, {})), { createdAt: { type: Date, default: Date.now }, updatedAt: { type: Date, default: Date.now } }));
        mongoose_1.default.model(collectionName, schema);
        logger_1.default.info(`New page created: ${name}`);
        res.status(201).json({ message: "Page created successfully", page });
    }
    catch (error) {
        logger_1.default.error("Error creating page:", error);
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else if (error instanceof Error) {
            if (error.name === "ValidationError") {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: "Error creating page" });
            }
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.createPage = createPage;
const getPagesByRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userReq = req;
        console.log("User from request:", userReq.user);
        if (!userReq.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const roleId = userReq.user.roleId;
        console.log("Role ID:", roleId);
        const role = yield Role_1.default.findById(roleId).populate("pagePermissions.pageId");
        if (!role) {
            logger_1.default.error(`Role not found for ID: ${roleId}`);
            return res.status(404).json({ message: "Role not found" });
        }
        console.log("Found role:", role);
        const allowedPages = yield Promise.all(role.pagePermissions.map((permission) => __awaiter(void 0, void 0, void 0, function* () {
            const page = yield Page_1.default.findById(permission.pageId);
            return page
                ? {
                    id: page._id,
                    name: page.name,
                    url: page.url,
                    actions: permission.actions,
                }
                : null;
        })));
        const filteredPages = allowedPages.filter((page) => page !== null);
        console.log("Allowed pages:", filteredPages);
        res.json(filteredPages);
    }
    catch (error) {
        console.error("Error in getPagesByRole:", error);
        res.status(500).json({
            message: "Error fetching pages by role",
            error: error.message,
        });
    }
});
exports.getPagesByRole = getPagesByRole;
const getPages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pages = yield Page_1.default.find();
        res.json(pages);
    }
    catch (error) {
        logger_1.default.error("Error fetching pages:", error);
        res.status(500).json({ message: "Error fetching pages" });
    }
});
exports.getPages = getPages;
const updatePage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updatedPage = yield Page_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updatedPage);
    }
    catch (error) {
        logger_1.default.error("Error updating page:", error);
        res.status(500).json({ message: "Error updating page" });
    }
});
exports.updatePage = updatePage;
const deletePage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Page_1.default.findByIdAndDelete(id);
        res.json({ message: "Page deleted successfully" });
    }
    catch (error) {
        logger_1.default.error("Error deleting page:", error);
        res.status(500).json({ message: "Error deleting page" });
    }
});
exports.deletePage = deletePage;
