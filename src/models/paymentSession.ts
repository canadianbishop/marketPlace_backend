import mongoose, { Types } from "mongoose";
import { type cartItem } from "../controller/orderControllers";
import { Document } from "mongoose";
import { type DeliveryInfo } from "./order";

export interface CheckoutItem {
  productId: Types.ObjectId;
  sellerId: Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image: string;
}

interface PaymentSession extends Document {
  userId: Types.ObjectId;
  reference: string;
  status: "pending" | "completed" | "failed";
  items: CheckoutItem[];
  deliveryInfo: DeliveryInfo;
  shippingFee: number | null;
  tax: number | null;
  discount: number | null;
  total: number;
}

const paymentSessionSchema = new mongoose.Schema<PaymentSession>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reference: {
      type: String,
      required: [true, "payment reference is requiured"],
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    items: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          productName: {
            type: String,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
          unitPrice: {
            type: Number,
            required: true,
          },
          subtotal: {
            type: Number,
            required: true,
          },
          image: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
    },

    tax: {
      type: Number,
      default: null,
    },
    shippingFee: {
      type: Number,
      default: null,
    },
    discount: {
      type: Number,
      default: null,
    },

    deliveryInfo: {
      phone: { type: String, required: true },
      recipientsName: { type: String, required: true },
      shippingAddress: { type: String, required: true },
    },
    total: {
      type: Number,
      required: [true, "session must include a total amount payed"],
    },
  },
  { timestamps: true },
);

export const PaymentSession = mongoose.model<PaymentSession>(
  "PaymentSession",
  paymentSessionSchema,
);
