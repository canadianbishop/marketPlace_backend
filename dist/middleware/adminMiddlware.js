"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const http_status_codes_1 = require("http-status-codes");
const adminMiddleware = (req, res, next) => {
    const user = req.user;
    const role = user.role;
    if (role !== 'admin') {
        return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'admin only route'
        });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
