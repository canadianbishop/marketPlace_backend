import { body, param } from "express-validator";
import { type cartItem } from "../controller/orderControllers";
export const checkoutValidator = [
  body("cart")
    .isArray({ min: 1 })
    .withMessage("cart must have at least one item")
    .custom((cart) => {
      const productIds = cart.map((item: cartItem) => item.productId);
      const uniqueIds = new Set(productIds);

      if (uniqueIds.size !== productIds.length) {
        throw new Error("duplicate items are not allowed");
      }

      return true;
    }),

  body("phone").trim().notEmpty().withMessage("phone number is required"),
  body("shippingAddress")
    .trim()
    .notEmpty()
    .withMessage("shipping address is required"),
  body("recipientsName")
    .trim()
    .notEmpty()
    .withMessage("recipients name is required"),
];

// verifyPayment validator

export const verifyPaymentValidator = [
  param("reference")
    .isString()
    .withMessage("payment referenct must be a string")
    .trim()
    .notEmpty()
    .withMessage("payment reference is required"),
];
