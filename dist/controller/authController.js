"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordController = exports.resetPasswordController = exports.forgotPasswordController = exports.loginUserController = exports.registerUserController = void 0;
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const express_validator_1 = require("express-validator");
const http_status_codes_1 = require("http-status-codes");
const nodemailer_1 = __importDefault(require("nodemailer"));
// register user
const registerUserController = async (req, res) => {
    try {
        // validate input field
        const { email, firstname, lastname, password } = req.body;
        if (!email || !firstname || !lastname || !password) {
            return res.status(400).json({
                success: false,
                message: "all field are required",
            });
        }
        // check if user exist
        const userExist = await User_1.User.findOne({ email: email.toLowerCase() });
        if (userExist) {
            return res.status(400).json({
                success: false,
                message: "user with the provided email already exist",
            });
        }
        const user = new User_1.User({
            email: email.toLowerCase(),
            firstname,
            lastname,
            password,
        });
        await user.save();
        // create safe User;
        const { password: _, ...safeUser } = user.toObject();
        return res.status(201).json({
            success: true,
            user: safeUser,
        });
    }
    catch (error) {
        console.log("server error =>", error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "duplicate user in the database",
            });
        }
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({
                success: false,
                errors: messages,
            });
        }
        return res.status(400).json({
            success: false,
            message: "server error something went wrong",
        });
    }
};
exports.registerUserController = registerUserController;
// login user
const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!password || !email) {
            return res.status(400).json({
                success: false,
                message: "both email  and password is requiured",
            });
        }
        //  check email is valid
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValidEmail) {
            return res.status(400).json({
                success: false,
                message: "email is not valid",
            });
        }
        //  check if user exist
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "invalid password",
            });
        }
        // check if password match
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({
                success: false,
                message: "invalid credentials",
            });
        }
        const accessToken = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            role: user.role,
            firstname: user.firstname,
            lastname: user.lastname,
            lastLogin: Date.now(),
        }, process.env.JWT_SECRET_KEY, {
            expiresIn: "30m",
        });
        return res.status(200).json({
            success: true,
            accessToken,
        });
    }
    catch (error) {
        console.log("server error =>", error);
        return res.status(500).json({
            success: false,
            message: "server error something went wrong",
        });
    }
};
exports.loginUserController = loginUserController;
// reset password
const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        // express validation errors
        if (!errors.isEmpty()) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                error: errors.array(),
            });
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        // return a message of success even if the does not exist;
        if (!user) {
            return res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                message: "if user exists you will get an email",
            });
        }
        // create the token
        const resetToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_RESET_KEY, {
            expiresIn: "15m",
        });
        console.log("this is reset token", resetToken);
        const resetUrl = `http://localhost:8080/api/auth/resetPassword?token=${resetToken}`;
        // create the transporter
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const result = await transporter.sendMail({
            to: user.email,
            subject: "request to reset password",
            html: `
      <p>you have requested to reset your password</p>
      <p>if you did not request this action please report back to us</p>
      <p>click the link below to reset you password you will be redirected to the appropriate page</p>
      <a href="${resetUrl}">${resetUrl}</a>
      `,
        });
        console.log("this is result", result);
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "reset link sent",
        });
    }
    catch (error) {
        console.log("server error something went wrong", error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "internal server error",
        });
    }
};
exports.forgotPasswordController = forgotPasswordController;
// forgot password
const resetPasswordController = async (req, res) => {
    try {
        const token = req.query.token;
        const { newPassword } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                error: errors.array(),
            });
        }
        if (typeof token !== "string") {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "wrong token format",
            });
        }
        // verify token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_RESET_KEY);
        }
        catch (error) {
            console.log(error);
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "invalid token",
            });
        }
        const user = await User_1.User.findById(decoded.id);
        if (!user) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                success: false,
                message: "user not found",
            });
        }
        // compare password
        const isSamePassword = await bcrypt_1.default.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "cant use the same password twice",
            });
        }
        user.password = newPassword;
        await user.save();
        return res.json({
            message: "password changed successfully",
        });
    }
    catch (error) {
        console.log("server error something went wrong", error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "internal server error something went wrong",
        });
    }
};
exports.resetPasswordController = resetPasswordController;
// change password
const changePasswordController = async (req, res) => {
    try {
        // handle all the validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                errrors: errors.array(),
            });
        }
        // get current userId and inputs
        const { id } = req.user;
        const { currentPassword, newPassword } = req.body;
        // get user
        const user = await User_1.User.findById(id);
        if (!user) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                success: false,
                message: "user not found",
            });
        }
        //  check if the password matches the currently savedPassword in the db;
        const passwordMatch = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "wrong current password",
            });
        }
        user.password = newPassword;
        await user.save();
        return res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: "password changed successfully",
        });
    }
    catch (error) {
        console.log("server error something went wrong =>", error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "server errror something went wrong",
        });
    }
};
exports.changePasswordController = changePasswordController;
