import { body } from "express-validator";
import {type cartItem } from "../controller/orderControllers";
export const checkoutValidator = [
  body("cart")
    .isArray({ min: 1 })
    .withMessage("cart must have at least one item")
    .custom((cart) => {
      const productIds=  cart.map((item:cartItem)=> item.productId);
      const uniqueIds = new Set(productIds);

      if(uniqueIds.size !== productIds.length){
            throw new Error('duplicate items are not allowed')
      }

      return true
    }),
];
