import mongoose, { Types } from "mongoose";
import { Document } from "mongoose";
import { IUser } from "./User";

interface ProductImages extends Document {
  imageUrl: string;
  publicId: string;
  isMain: boolean;
}

export interface IProduct extends Document {
  name: string;
  price: number;
  images: ProductImages[];
  category: string;
  stock:number;
  sellerId: Types.ObjectId | string 
  description: String;
  isDeleted:boolean
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "product name is required"],
    },
    price: {
      type: Number,
      required: [true, "price is required"],
      min: [0, "price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "category is required"],
    },
    sellerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "seller id is required"],
    },
    images: [
      {
        imageUrl: {
          type: String,
          required: [true, "image url is required"],
        },
        publicId: {
          type: String,
          required: [true, "image url is required"],
        },
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],

    stock:{
      type:Number,
      required:true,
      min:0,
      default:0
    },

    isDeleted:{
      type:Boolean,
      default:false
    },
    description: {
      type: String,
      required: [true, "product description is required"],
    },
  },
  {
    timestamps: true,
  },
);

// ensure only one product is saved as main
productSchema.pre("save", async function () {
  if (!this.images || this.images.length === 0) {
    throw new Error("Product must have at least one image");
  }

  const mainImage = this.images.filter((img:ProductImages)=> img.isMain);
  if(mainImage.length > 1){
    this.images.forEach((img:ProductImages)=> img.isMain = false);
    this.images[0].isMain = true;
  }

  if(mainImage.length === 0){
    this.images[0].isMain= true;
  }
});

productSchema.pre('find', function(){
  this.where({
    isDeleted:false
  })
})

productSchema.pre('findOne', function(){
  this.where({
    isDeleted:false
  })
})

export const Product = mongoose.model<IProduct>("Product", productSchema);
