import express from "express";
import {
  sellerApplicationController,
  uploadProductController,
} from "../controller/sellerController";
import { authMiddleware } from "../middleware/authMiddlware";
import { SellerValidators } from "../validators/sellerValidators";
import { sellerMiddleware } from "../middleware/sellermiddlware";
import { upload } from "../config/multer";
import { ProductValidator } from "../validators/productValidators";
import { uploadImage } from "../middleware/uploadProductsMiddlware";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

const SellerRoutes = express.Router();

const validateReq = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      type: err.type,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }
  

  next();
};

SellerRoutes.post(
  "/seller-application",
  authMiddleware,
  SellerValidators,
  sellerApplicationController,
);

// upload products

SellerRoutes.post(
  "/upload-product",
  authMiddleware,
  sellerMiddleware,
  upload.array("image", 4),
  function (req:Request, res:Response, next:NextFunction){
    console.log(req.body, req.files)
    console.log(`this is price`, req.body.price)
    next()
  },
  ProductValidator,
  validateReq,
  uploadImage,
  uploadProductController,
);

export default SellerRoutes;
