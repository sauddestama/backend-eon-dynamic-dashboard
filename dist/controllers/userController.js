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
exports.getUsers = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const Role_1 = __importDefault(require("../models/Role"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../config/logger"));
const errorHandler_1 = require("../middleware/errorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, role } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(role)) {
            throw new errorHandler_1.AppError("Invalid role ID format", 400);
        }
        const existingRole = yield Role_1.default.findById(role);
        if (!existingRole) {
            throw new errorHandler_1.AppError("Role not found", 404);
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = new User_1.default({
            username,
            email,
            password: hashedPassword,
            role,
        });
        yield user.save();
        logger_1.default.info(`New user registered: ${username}`);
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        logger_1.default.error("Error registering user:", error);
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else if (error instanceof Error) {
            if (error.name === "ValidationError") {
                res.status(400).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: "Error registering user" });
            }
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            logger_1.default.warn(`Login attempt with non-existent email: ${email}`);
            throw new errorHandler_1.AppError("Invalid credentials", 400);
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            logger_1.default.warn(`Failed login attempt for user: ${email}`);
            throw new errorHandler_1.AppError("Invalid credentials", 400);
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        logger_1.default.info(`User logged in: ${email}`);
        res.json({ token });
    }
    catch (error) {
        logger_1.default.error("Error logging in:", error);
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Error logging in" });
        }
    }
});
exports.loginUser = loginUser;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find().select("-password");
        logger_1.default.info("Users list fetched");
        res.json(users);
    }
    catch (error) {
        logger_1.default.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
});
exports.getUsers = getUsers;
