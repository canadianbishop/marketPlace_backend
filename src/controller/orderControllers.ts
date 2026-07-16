import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Cart } from "../models/Cart";
import { Product } from "../models/Products";
import { getCheckoutSummary, getMissingProducts } from "../utils/helpers";
import { User } from "../models/User";
import {
  initializeTransaction,
  verifyTransaction,
} from "../services/paystackService";
import productRoutes from "../routes/productRoutes";
import { PaymentSession } from "../models/paymentSession";
import { Order } from "../models/order";

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
    const { cart, phone, shippingAddress, recipientsName } = req.body;
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
    const user = await User.findById(id).select("email").lean();
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "user not found while initializing payment",
      });
    }

    const amountInKobo = total * 100;
    const paymentInfo = { email: user.email, amount: amountInKobo };

    console.log(paymentInfo)

    // initialize payement
    const paymentResponse = await initializeTransaction(paymentInfo);

    // save safe reference to paymentSession document;

    const deliveryInfo = {phone, shippingAddress, recipientsName};

    await PaymentSession.create({
      userId: id,
      reference: paymentResponse.data.reference,
      deliveryInfo,
      items: items,
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

// verify payment controller

export const verifyPaymentController = async (req: Request, res: Response) => {
  try {
    // get the reference
    const  reference  = req.params.reference as string;

    if (!reference) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Payment reference is required.",
      });
    }

    // check if the reference exists
    const paymentSession = await PaymentSession.findOne({ reference });
    if (!paymentSession) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "payment session not found",
      });
    }

    //check against completed payment
    if (paymentSession.status !== "pending") {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "payment session is no longer active",
      });
    }

    // verify payment;
    const verifyPayment = await verifyTransaction(reference);

    // i know at this point if the payment.data.status is not success we will catch the error in the catch block

    // check the amount paid before the creation of th order;
    if (verifyPayment.data.amount !== paymentSession.total * 100) {
      
      return res.status(StatusCodes.NOT_ACCEPTABLE).json({
        success: false,
        message: "failed to create order invalid amount paid",
      });
    }

    // create order
    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      userId: paymentSession.userId,
      amountPaid: verifyPayment.data.amount / 100,
      items: paymentSession.items,
      shippingFee: paymentSession.shippingFee,
      tax: paymentSession.tax,
      discount: paymentSession.discount,
      paymentReference: reference,
      deliveryInfo: paymentSession.deliveryInfo,
      paymentStatus: "paid",
      orderStatus: "pending",
      total: paymentSession.total,
    });

    // update payment session 
    paymentSession.status= 'completed';
    await paymentSession.save();

    // return a response;
    res.status(StatusCodes.OK).json({
      success:true,
      message:'payment successful , order created !!',
      order
    })
  } catch (error) {
    console.log("something went wrong", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "something went wrong",
    });
  }
};
