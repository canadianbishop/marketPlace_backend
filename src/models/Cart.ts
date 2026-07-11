import mongoose, { Types } from "mongoose";
import { Document } from "mongoose";

interface CartItem {
  productId: Types.ObjectId | string;
  quantity: number;
}

interface ICart extends Document{
  userId: Types.ObjectId | string;
  items: CartItem[];
}

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "cart must have a User Id"],
      unique: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "each product must have an Id"],
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  { timestamps: true },
);


export const Cart = mongoose.model<ICart>('Cart', cartSchema)