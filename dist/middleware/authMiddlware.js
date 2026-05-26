"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const authMiddleware = (req, res, next) => {
    let authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(400).json({
            success: false,
            message: "no bearer token found",
        });
    }
    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET_KEY;
    try {
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "invalid  or missing token",
            });
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
        req.user = {
            role: decodedToken.role,
            id: decodedToken.id
        };
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
    console.log(authHeader);
    next();
};
exports.authMiddleware = authMiddleware;
