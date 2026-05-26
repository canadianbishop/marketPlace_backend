"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = require("../controller/authController");
const authValidators_1 = require("../validators/authValidators");
const authMiddlware_1 = require("../middleware/authMiddlware");
const authRoutes = express_1.default.Router();
// register user route
authRoutes.post("/register", authController_1.registerUserController);
// login user
authRoutes.post("/login", authController_1.loginUserController);
// forgot password
authRoutes.post("/forgotPassword", (0, express_validator_1.body)("email").isEmail().withMessage("please provide a valid email"), authController_1.forgotPasswordController);
// reset password
authRoutes.patch("/resetPassword", authValidators_1.resetPasswordValidator, authController_1.resetPasswordController);
// change password
authRoutes.post("/changePassword", authMiddlware_1.authMiddleware, authValidators_1.changePasswordValidator, authController_1.changePasswordController);
exports.default = authRoutes;
