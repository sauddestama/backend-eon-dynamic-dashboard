"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const pageRoutes_1 = __importDefault(require("./routes/pageRoutes"));
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
const dynamicRoutes_1 = __importDefault(require("./routes/dynamicRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect to database
if (process.env.NODE_ENV !== "test") {
    (0, database_1.default)();
}
// Routes
app.use("/api/users", userRoutes_1.default);
app.use("/api/pages", pageRoutes_1.default);
app.use("/api/roles", roleRoutes_1.default);
app.use("/api/dynamic", dynamicRoutes_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
exports.default = app;
