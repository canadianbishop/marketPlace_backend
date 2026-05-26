import { StatusCodes } from "http-status-codes";
import { Response, Request, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";


export const sellerMiddleware = (req:Request, res:Response, next:NextFunction)=>{
        const user = req.user as JwtPayload;
        const role = user.role;

        if(role !=="seller"  || role !== 'admin'){
            return res.status(StatusCodes.FORBIDDEN).json({
                  success:false,
                  message:'admin and seller only route'
            })
        }
   next();
}


