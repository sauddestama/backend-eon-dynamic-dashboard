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
exports.deleteItem = exports.updateItem = exports.getItems = exports.createItem = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Page_1 = __importDefault(require("../models/Page"));
const errorHandler_1 = require("../middleware/errorHandler");
const createItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pageName } = req.params;
        const page = yield Page_1.default.findOne({ name: pageName });
        if (!page) {
            throw new errorHandler_1.AppError("Page not found", 404);
        }
        const DynamicModel = mongoose_1.default.model(page.collectionName);
        const newItem = new DynamicModel(req.body);
        yield newItem.save();
        res
            .status(201)
            .json({ message: "Item created successfully", item: newItem });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res
                .status(500)
                .json({ message: "An error occurred while creating the item" });
        }
    }
});
exports.createItem = createItem;
const getItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pageName } = req.params;
        const page = yield Page_1.default.findOne({ name: pageName });
        if (!page) {
            throw new errorHandler_1.AppError("Page not found", 404);
        }
        const DynamicModel = mongoose_1.default.model(page.collectionName);
        const items = yield DynamicModel.find();
        res.json(items);
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res
                .status(500)
                .json({ message: "An error occurred while fetching items" });
        }
    }
});
exports.getItems = getItems;
const updateItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pageName, id } = req.params;
        const page = yield Page_1.default.findOne({ name: pageName });
        if (!page) {
            throw new errorHandler_1.AppError("Page not found", 404);
        }
        const DynamicModel = mongoose_1.default.model(page.collectionName);
        const updatedItem = yield DynamicModel.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (!updatedItem) {
            throw new errorHandler_1.AppError("Item not found", 404);
        }
        res.json({ message: "Item updated successfully", item: updatedItem });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res
                .status(500)
                .json({ message: "An error occurred while updating the item" });
        }
    }
});
exports.updateItem = updateItem;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pageName, id } = req.params;
        const page = yield Page_1.default.findOne({ name: pageName });
        if (!page) {
            throw new errorHandler_1.AppError("Page not found", 404);
        }
        const DynamicModel = mongoose_1.default.model(page.collectionName);
        const deletedItem = yield DynamicModel.findByIdAndDelete(id);
        if (!deletedItem) {
            throw new errorHandler_1.AppError("Item not found", 404);
        }
        res.json({ message: "Item deleted successfully" });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res
                .status(500)
                .json({ message: "An error occurred while deleting the item" });
        }
    }
});
exports.deleteItem = deleteItem;
