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
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../config/logger"));
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
    if (!token) {
        logger_1.default.warn("Access denied. No token provided.");
        return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        if (!decoded.userId) {
            logger_1.default.warn("Token does not contain userId");
            return res.status(400).json({ message: "Invalid token structure" });
        }
        const user = yield User_1.default.findById(decoded.userId).populate("role");
        if (!user) {
            logger_1.default.warn(`User not found for ID: ${decoded.userId}`);
            return res.status(404).json({ message: "User not found" });
        }
        console.log("Found user:", user);
        // Menetapkan user ke request sebagai AuthenticatedRequest
        req.user = {
            id: user._id,
            roleId: user.role._id,
        };
        console.log("User set on request:", req.user);
        next();
    }
    catch (error) {
        logger_1.default.error("Error in auth middleware:", error);
        res
            .status(400)
            .json({ message: "Invalid token.", error: error.message });
    }
});
exports.auth = auth;
