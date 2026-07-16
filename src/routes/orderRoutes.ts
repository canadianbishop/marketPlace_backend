import express from "express";
import { authMiddleware } from "../middleware/authMiddlware";
import {
  checkoutController,
  initializePaymentController,
  verifyPaymentController,
} from "../controller/orderControllers";
import {
  checkoutValidator,
  verifyPaymentValidator,
} from "../validators/ordervalidators";
import { validateReq } from "../utils/validators";

const orderRoutes = express.Router();

// checkout
orderRoutes.post(
  "/checkout",
  authMiddleware,
  checkoutValidator,
  validateReq,
  checkoutController,
);

// initialize payment;
orderRoutes.post(
  "/initialize-payment",
  authMiddleware,
  checkoutValidator,
  validateReq,
  initializePaymentController,
);

// verify payment
orderRoutes.post(
  "/verify-payment/:reference",
  authMiddleware,
  verifyPaymentValidator,
  validateReq,
  verifyPaymentController,
);

export default orderRoutes;
