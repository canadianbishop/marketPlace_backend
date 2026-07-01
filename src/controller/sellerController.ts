import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import nodemailer from "nodemailer";
import "dotenv/config";
import { User } from "../models/User";
import { SellerApplication } from "../models/SellerApplication";
import { Product } from "../models/Products";

// seller application
export const sellerApplicationController = async (
  req: Request,
  res: Response,
) => {
  try {
    // get userId
    const { id } = req.user!;
    const { storeName, country, state, city, justification, categories } =
      req.body;

    // handle validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: errors.array(),
      });
    }

    // get user from db;

    const user = await User.findById(id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "user not found",
      });
    }

    // prevent multiple application;
    const appliedBefore = await SellerApplication.findOne({
      userId: user._id,
    });

    if (appliedBefore) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message:
          "multiple applications is not allowed please wait for feedback",
      });
    }

    //     create application
    await SellerApplication.create({
      userId: user._id,
      storeName,
      categories,
      status: "pending",
      location: {
        country,
        state,
        city,
      },
      justification,
    });

    //     send confirmation mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "APPLICATION TO BECOME A SELLER",
      html: `
            <p> Dear ${user?.firstname},</p>
            <p> your application to become a seller has been duly receieved by the management and
             it is currently under review</p>
            <p> if you don't get a response in then next 5 working days please contact the admin 
            through the contact us button on your dashboard</p>
         `,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "application recieved",
    });
  } catch (error: any) {
    console.log("server error something went wrong", error);
    //     mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message,
      );

      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: messages,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "internal server errror something went wrong",
    });
  }
};

// upload product

export const uploadProductController = async (req: Request, res: Response) => {
  try {
    const { images, name, price, category, description } = req.body;
    const { id } = req.user!;

    //  check if images is present ;
    if (!images || images.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "product image is required",
      });
    }

    const product = await Product.create({
      name,
      price: Number(price),
      category,
      description,
      sellerId: id,
      images,
      isDeleted: false,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "product uploaded successfully",
      product: product.name,
    });
  } catch (error) {
    console.log("internal server error =>", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "internal server error something went wrong",
    });
  }
};

// update product

export const updateProductController = async (req: Request, res: Response) => {
  try {
    //  get the id of the product
    const { id } = req.params;

    // validate if the seller trying to update product is the seller that uploaded the product
    const userId = req.user?.id;

    const productDets = await Product.findById(id);

    if (!productDets) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "product not found",
      });
    }

    if (productDets.sellerId.toString() !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "product can only be updated by authorized seller",
      });
    }

    // define the allowed feilds to update
    const allowedFields = ["name", "price", "category", "description"];

    if (!req.body) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "req.body is not a valid object",
      });
    }

    // get the sent feilds
    const sentFields = Object.keys(req.body);

    // return an error if the array is empty;
    if (sentFields.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "you must at least send one updated field",
      });
    }

    // check if all the sent fields are allowed
    const isValidFields = sentFields.every((field) =>
      allowedFields.includes(field),
    );

    if (!isValidFields) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "at least one unallowed fields is included",
      });
    }

    // update the db
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "product updated successfully",
      data: product,
    });
  } catch (error) {
    console.log("something went wrong server error =>", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "internal server error",
    });
  }
};

// delet product

export const deleteProductController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    
    // validate seller
    const userId = req.user?.id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "product not found",
      });
    }

    if (product.sellerId.toString() !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "unauthorized seller",
      });
    }

    // delete product and return a message;
    product.isDeleted= true;

    await product.save()

    return res.status(StatusCodes.OK).json({
      success:true, 
      message:'product deleted successfully'
    })
  } catch (error) {
    console.log("internal server error=>", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "internal server error",
    });
  }
};
