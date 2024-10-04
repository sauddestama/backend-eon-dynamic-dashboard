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
exports.checkPermission = void 0;
const Role_1 = __importDefault(require("../models/Role"));
const Page_1 = __importDefault(require("../models/Page"));
const errorHandler_1 = require("./errorHandler");
const logger_1 = __importDefault(require("../config/logger"));
const checkPermission = (action) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { pageName } = req.params;
            const userReq = req; // Casting ke AuthenticatedRequest
            console.log("Checking permission for:", {
                user: userReq.user,
                pageName,
                action,
            });
            if (!userReq.user || !userReq.user.id) {
                logger_1.default.warn("User not authenticated");
                throw new errorHandler_1.AppError("User not authenticated", 401);
            }
            const role = yield Role_1.default.findById(userReq.user.roleId);
            if (!role) {
                logger_1.default.warn(`Role not found for ID: ${userReq.user.roleId}`);
                throw new errorHandler_1.AppError("Role not found", 404);
            }
            console.log("Found role:", role);
            const page = yield Page_1.default.findOne({ name: pageName });
            if (!page) {
                logger_1.default.warn(`Page not found: ${pageName}`);
                throw new errorHandler_1.AppError("Page not found", 404);
            }
            console.log("Found page:", page);
            const pagePermission = role.pagePermissions.find((perm) => perm.pageId.toString() === page._id.toString());
            if (!pagePermission) {
                logger_1.default.warn(`Access denied for user ${userReq.user.id} on page ${pageName}`);
                throw new errorHandler_1.AppError("Access denied", 403);
            }
            if (action === "read" || pagePermission.actions[action]) {
                console.log("Permission granted");
                next();
            }
            else {
                logger_1.default.warn(`Access denied for action ${action} on page ${pageName}`);
                throw new errorHandler_1.AppError("Access denied", 403);
            }
        }
        catch (error) {
            logger_1.default.error("Error in checkPermission:", error);
            next(error);
        }
    });
};
exports.checkPermission = checkPermission;
