"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordValidator = exports.resetPasswordValidator = void 0;
const express_validator_1 = require("express-validator");
exports.resetPasswordValidator = [
    (0, express_validator_1.body)("newPassword")
        .notEmpty()
        .withMessage("newPassword is required")
        .bail()
        .isLength({ min: 6 })
        .withMessage("newPassword  must be at least 6 characters"),
    (0, express_validator_1.body)("confirmPassword")
        .notEmpty()
        .withMessage("confirmPassword is required")
        .bail()
        .isLength({ min: 6 })
        .withMessage("confirmPassword must be at least 6 characters")
        .bail()
        .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error("passwords do not match");
        }
        return true;
    }),
    (0, express_validator_1.query)("token").notEmpty().withMessage("token is required"),
];
exports.changePasswordValidator = [
    (0, express_validator_1.body)("currentPassword")
        .trim()
        .notEmpty()
        .withMessage("currentPassword is required"),
    (0, express_validator_1.body)("newPassword")
        .trim()
        .notEmpty()
        .withMessage("newPassword is required")
        .bail()
        .isLength({ min: 6 })
        .withMessage("newPassword must be at least six characters")
        .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
            throw new Error("old password reuseage is not allowed");
        }
        return true;
    }),
    (0, express_validator_1.body)("confirmPassword")
        .trim()
        .notEmpty()
        .withMessage("confirmPassword is required")
        .isLength({ min: 6 })
        .bail()
        .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error("new passwords fields do not match");
        }
        return true;
    }),
];
