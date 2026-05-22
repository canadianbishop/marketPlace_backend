import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const authMiddlware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let authHeader: string = req.headers["authorization"]!;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({
      success: false,
      message: "no bearer token found",
    });
  }

  const token: string = authHeader.split(" ")[1];
  const secretKey = process.env.JWT_SECRET_KEY!;

  try {
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "invalid  or missing token",
      });
    }
    const decodedToken = jwt.verify(token, secretKey)
    req.user= decodedToken;
     
  } catch (error: any) {
      console.error(error);
      throw new Error('error =>', error)
  }

  console.log(authHeader);

  next();
};
