import express from "express";
import { body, query } from "express-validator";
import {
  registerUserController,
  loginUserController,
  forgotPasswordController,
  resetPasswordController,
} from "../controller/authController.ts";
import { resetPasswordValidator } from "../validators/authValidators.ts";

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
export default authRoutes;
