import express from "express";
import { body, query } from "express-validator";
import {
  registerUserController,
  loginUserController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
} from "../controller/authController";
import {
  changePasswordValidator,
  resetPasswordValidator,
} from "../validators/authValidators";
import { authMiddleware } from "../middleware/authMiddlware";

const authRoutes = express.Router();

// register user route
authRoutes.post("/register", registerUserController);

// login user
authRoutes.post("/login", loginUserController);

// forgot password
authRoutes.post(
  "/forgotPassword",
  body("email").isEmail().withMessage("please provide a valid email"),
  forgotPasswordController,
);

// reset password
authRoutes.patch(
  "/resetPassword",
  resetPasswordValidator,
  resetPasswordController,
);

// change password

authRoutes.post(
  "/changePassword",
  authMiddleware,
  changePasswordValidator,
  changePasswordController,
);
export default authRoutes;
