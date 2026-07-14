import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Cart } from "../models/Cart";
import { Product } from "../models/Products";
import { getCheckoutSummary, getMissingProducts } from "../utils/helpers";
import { User } from "../models/User";
import { initializeTransaction } from "../services/paystackService";
import productRoutes from "../routes/productRoutes";
import { PaymentSession } from "../models/paymentSession";
import { INSPECT_MAX_BYTES } from "node:buffer";

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
    const id = req.user?.id;
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
    if (unavailableProducts.length !== 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "some product were  not found",
        issues: unavailableProducts,
      });
    }

    // get the cart summary
    const { total, items } = getCheckoutSummary(cart, products);

    // fetch authenticated user email
    const user = await User.findById(id).select("email");
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "user not found while initializing payment",
      });
    }

    const amountInKobo = total * 100;
    const paymentInfo = { email: user.email, amount: amountInKobo };

    // initialize payement
    const paymentResponse = await initializeTransaction(paymentInfo);

    // save safe reference to paymentSession document;

    await PaymentSession.create({
      userId: id,
      reference: paymentResponse.data.reference,
      cart: cart,
      total: total,
    });

    // feed the frontend
    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        url: paymentResponse.data.authorization_url,
        reference: paymentResponse.data.reference,
      },
    });
  } catch (error) {
    console.log("internal server error", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "internal server error",
    });
  }
};
