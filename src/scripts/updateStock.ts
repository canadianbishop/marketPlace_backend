import "dotenv/config";
import mongoose from "mongoose";
import connectDb from "../database/dbConnection";
import { Product } from "../models/Products";

const updateStock = async () => {
  try {
    await connectDb();
    const result = await Product.updateMany(
      { stock: { $exists: false } },
      { $set: { stock: 5 } },
    );

    console.log(result)
    await mongoose.disconnect()
  } catch (error) {
      console.log(error);
      process.exit(1)
  }
};

updateStock();