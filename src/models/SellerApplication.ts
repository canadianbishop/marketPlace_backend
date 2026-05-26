import mongoose, { Types } from "mongoose";
import { Document } from "mongoose";

interface ISeller extends Document {
  userId: Types.ObjectId | string;
  storeName: string;
  location: {
    state: string;
    city: string;
    country: string;
  };
  justification: string;
  categories: string[];
  status: "pending" | "approved" | "declined";
  reviewedAt: Date | null;
  reviewedBy: Types.ObjectId | string | null;
  adminNotes: string | null;
}

const sellerApplicationSchema = new mongoose.Schema<ISeller>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required to submit an application"],
    },
    storeName: {
      type: String,
      required: [true, "storeName  is required"],
    },
    categories: [String],
    status: {
      type: String,
      default: "pending",
      required: true,
    },
    location: {
      country: {
        type: String,
        required: [true, "country is required"],
      },
      state: {
        type: String,
        required: [true, "state is required"],
      },
      city: {
        type: String,
        required: [true, "city is required"],
      },
    },

    justification: {
      type: String,
      required: [
        true,
        "must provide a few reasons why you should be considered as a seller ",
      ],
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminNotes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export const SellerApplication = mongoose.model(
  "SellerApplication",
  sellerApplicationSchema,
);
