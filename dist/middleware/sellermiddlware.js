"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerMiddleware = void 0;
const http_status_codes_1 = require("http-status-codes");
const sellerMiddleware = (req, res, next) => {
    const user = req.user;
    const role = user.role;
    if (role !== "seller" || role !== 'admin') {
        return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'admin and seller only route'
        });
    }
    next();
};
exports.sellerMiddleware = sellerMiddleware;
