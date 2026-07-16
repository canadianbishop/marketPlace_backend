import mongoose, { Types } from "mongoose";
import { Document } from "mongoose";

interface OrderItem {
  productId: Types.ObjectId;
  sellerId: Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image: string;
}

export interface DeliveryInfo {
  shippingAddress: string;
  recipientsName: string;
  phone: string;
}

interface OrderData extends Document {
  userId: Types.ObjectId;
  items: OrderItem[];
  orderNumber: string;
  amountPaid: number;
  paymentReference: string;
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "refunded" | "failed";
  deliveryInfo: DeliveryInfo;
  shippingFee: number | null;
  tax: number | null;
  discount: number | null;
  total:number;
}

const orderSchema = new mongoose.Schema<OrderData>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [
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
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "refunded", "failed"],
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    deliveryInfo: {
      shippingAddress: {
        type: String,
        required: true,
      },
      recipientsName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    shippingFee: {
      type: Number,
      default: null,
    },
    tax: {
      type: Number,
      default: null,
    },
    discount: {
      type: Number,
      default: null,
    },
    total: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

export const Order = mongoose.model<OrderData>("Order", orderSchema);
