import express from "express";
import { sellerApplicationController } from "../controller/sellerController";
import { authMiddleware } from "../middleware/authMiddlware";
import { SellerValidators } from "../validators/sellerValidators";

const SellerRoutes = express.Router();

SellerRoutes.post(
  "/seller-application",
  authMiddleware,
  SellerValidators,
  sellerApplicationController,
);

export default SellerRoutes;
