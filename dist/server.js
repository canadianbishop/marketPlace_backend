"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
require("dotenv/config");
const morgan_1 = __importDefault(require("morgan"));
const dbConnection_js_1 = __importDefault(require("./database/dbConnection.js"));
const express_validator_1 = require("express-validator");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("dev"));
// app.use(compression);
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
(0, dotenv_1.config)();
app.get("/", (0, express_validator_1.query)("person").notEmpty(), (req, res) => {
    const result = (0, express_validator_1.validationResult)(req);
    console.log(result.isEmpty());
    if (!result.isEmpty()) {
        return res.json({
            success: false,
            message: 'please provide your name'
        });
    }
    res.json({
        success: true,
        message: `Welcome to ${req.query.person} Marketplace`,
    });
});
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Health OK!",
        data: {},
    });
});
const PORT = process.env.PORT || 8000;
const startServer = async () => {
    await (0, dbConnection_js_1.default)();
    app.listen(PORT, () => {
        console.log(`Backend is running on http://localhost:${PORT} ...betta go catch it`);
    });
};
startServer();
