import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
   
      const user = req.user as JwtPayload;
      const role = user.role;

      if(role !== 'admin'){
            return res.status(StatusCodes.FORBIDDEN).json({
                  success:false,
                  message:'admin only route'
            })
      }

      next()

};
