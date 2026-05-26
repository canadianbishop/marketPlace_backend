"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddlware_1 = require("../middleware/authMiddlware");
const productRoutes = express_1.default.Router();
productRoutes.get("/allProducts", authMiddlware_1.authMiddleware, (req, res) => {
    res.status(200).send("welcome to products page");
});
exports.default = productRoutes;
