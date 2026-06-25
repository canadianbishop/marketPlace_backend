import { Request, Response } from "express";
import { Product } from "../models/Products";
import { StatusCodes } from "http-status-codes";

// get all products

export const fetchAllProductController = async (
  req: Request,
  res: Response,
) => {
  try {
    // query params page number
    const page = Number(req.query.page) || 1;
    const limit = 10;

    // determine the number of products to skip
    const skip = Number(page - 1) * limit;

    // query params sortBy
    const sortBy = (req.query.sortBy as string) || "createdAt";

    //     total number of products
    const totalProducts = await Product.countDocuments();

    // totalPages
    const totalPages = Math.ceil(totalProducts / limit);

    // fetch product;

    const products = await Product.find()
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(limit)
      .select("name, _id, category, price");

    if(products.length === 0){
      return res.status(StatusCodes.OK).json({
            success:true,
            message:'you currently have no products '
      })
    }

    return res.status(StatusCodes.OK).json({
      success:true,
      message:'products fetch successful',
      pagination:{
         totalProducts,
         currentPage: page,
         totalPages,
         hasNextPage: page < totalPages,
         hasPreviousPage: page > 1
      },
      data:products
    })
  } catch (error) {
    console.log("internal server error something went wrong", error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "server error something went wrong",
    });
  }
};
