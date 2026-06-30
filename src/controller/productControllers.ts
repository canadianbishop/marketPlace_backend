import { Request, Response } from "express";
import { Product } from "../models/Products";
import { StatusCodes } from "http-status-codes";
import { SellerApplication } from "../models/SellerApplication";
import { IUser } from "../models/User";

// get all products

export const fetchAllProductController = async (
  req: Request,
  res: Response,
) => {
  try {
    //    get the page number from the request
    const page = Number(req.query.page) || 1;
    const limit = 10;

    // calculate the skip
    const skip = Number(page - 1) * limit;

    // determing the sort params
    const sortBy = (req.query.sortBy as string) || "createdAt";

    // get total number of products
    const totalProducts = await Product.countDocuments();

    // get total number of pages
    const totalPages = Math.ceil(totalProducts / limit);

    // fetch products

    const products = await Product.find()
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(limit)
      .select("_id name category price images");

    return res.status(StatusCodes.OK).json({
      success: true,
      pagination: {
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        totalPages,
        totalProducts,
      },
      data: products,
    });
  } catch (error) {
    console.log("internal server error something went wrong", error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "server error something went wrong",
    });
  }
};

// get product by id;
export const getProductDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //  get product details with seller email firstname and _id
    const product = await Product.findById(id).populate<{ sellerId: IUser }>(
      "sellerId",
      "email firstname _id",
    );

    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "product detail not found",
      });
    }

    //  use the same _id to query the application schema for the storename and location;
    const storeDetails = await SellerApplication.findOne({
      userId: product.sellerId._id,
      status: "approved",
    });

    if (!storeDetails) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "seller is not authorized",
      });
    }

    // create a product details object.
    const productObj = product.toObject();
    const storeObj = storeDetails.toObject();

    const productDets = {
      ...productObj,
      sellerId: {
        ...productObj.sellerId,
        location: storeObj.location,
        storeName: storeObj.storeName,
      },
    };

    return res.status(StatusCodes.OK).json({
      success: true,
      message:'product details fetched successfully',
      data: productDets,
    });
  } catch (error) {
    console.log("internal server error =>", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "internal server errror",
    });
  }
};
