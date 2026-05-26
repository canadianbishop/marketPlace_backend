import type { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import "dotenv/config";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import nodemailer from "nodemailer";

interface DecodedTokenPayload {
  id: string;
  iat: number;
  exp: number;
}

// register user
export const registerUserController = async (req: Request, res: Response) => {
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
    const userExist = await User.findOne({ email: email.toLowerCase() });

    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "user with the provided email already exist",
      });
    }

    const user = new User({
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
  } catch (error: any) {
    console.log("server error =>", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "duplicate user in the database",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message,
      );

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

// login user
export const loginUserController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!password || !email) {
      return res.status(400).json({
        success: false,
        message: "both email  and password is requiured",
      });
    }

    //  check email is valid
    const isValidEmail: boolean = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
      return res.status(400).json({
        success: false,
        message: "email is not valid",
      });
    }

    //  check if user exist

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "invalid password",
      });
    }

    // check if password match
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "invalid credentials",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        lastLogin: Date.now(),
      },
      process.env.JWT_SECRET_KEY!,
      {
        expiresIn: "30m",
      },
    );

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.log("server error =>", error);

    return res.status(500).json({
      success: false,
      message: "server error something went wrong",
    });
  }
};

// reset password

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const errors = validationResult(req);
    // express validation errors
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: errors.array(),
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // return a message of success even if the does not exist;

    if (!user) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "if user exists you will get an email",
      });
    }

    // create the token

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_RESET_KEY!, {
      expiresIn: "15m",
    });
    console.log("this is reset token", resetToken);

    const resetUrl = `http://localhost:8080/api/auth/resetPassword?token=${resetToken}`;

    // create the transporter

    const transporter = nodemailer.createTransport({
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
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "reset link sent",
    });
  } catch (error: any) {
    console.log("server error something went wrong", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "internal server error",
    });
  }
};

// forgot password

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const token = req.query.token;
    const { newPassword } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: errors.array(),
      });
    }

    if (typeof token !== "string") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "wrong token format",
      });
    }

    // verify token
    let decoded: DecodedTokenPayload;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_RESET_KEY!,
      ) as unknown as DecodedTokenPayload;
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "invalid token",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "user not found",
      });
    }

    // compare password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "cant use the same password twice",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.json({
      message: "password changed successfully",
    });
  } catch (error: any) {
    console.log("server error something went wrong", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "internal server error something went wrong",
    });
  }
};

// change password

export const changePasswordController = async (req: Request, res: Response) => {
  try {
    // handle all the validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        errrors: errors.array(),
      });
    }

    // get current userId and inputs
    
    const { id } = req.user!;
    const { currentPassword, newPassword } = req.body;

    // get user
    const user = await User.findById(id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "user not found",
      });
    }

    //  check if the password matches the currently savedPassword in the db;
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "wrong current password",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "password changed successfully",
    });
  } catch (error: unknown) {
    console.log("server error something went wrong =>", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "server errror something went wrong",
    });
  }
};
