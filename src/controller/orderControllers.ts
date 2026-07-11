import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Cart } from "../models/Cart";
import { Product } from "../models/Products";
import { getCheckoutSummary, getMissingProducts } from "../utils/helpers";

export interface cartItem {
  productId: string;
  quantity: number;
  subTotal?: number;
}

// check out controller

export const checkoutController = async (req: Request, res: Response) => {
  try {
    const { cart } = req.body;
    // get all the product ids;
    const productIds = cart.map((item: cartItem) => item.productId);

    // check if product exists
    const products = await Product.find({
      _id: { $in: productIds },
    });

    // handle missing products
    const unavailableProducts = getMissingProducts(products, cart);

    if (unavailableProducts.length !== 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "some product were  not found",
        issues: unavailableProducts,
      });
    }

    // get check out summary
    const { items, total } = getCheckoutSummary(cart, products);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: items,
      total: total,
    });
  } catch (error) {
    console.log("internal server error =>", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "internal sever error",
    });
  }
};

// paymet initialization controller
export const initializePaymentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { cart } = req.body;
    //  extract all the product ids from the cart
    const productIds = cart.map((item: cartItem) => item.productId);

    // check if all the arrays of ids exist at once in the db;
    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    });

    // handle missing product case
    const unavailableProducts = getMissingProducts(products, cart);
    if (unavailableProducts) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "some product were  not found",
        issues: unavailableProducts,
      });
    }

    // get the cart summary
    const { items, total } = getCheckoutSummary(cart, products);
    
  } catch (error) {}
};
