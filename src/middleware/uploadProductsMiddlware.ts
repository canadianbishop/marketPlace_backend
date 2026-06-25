import { uploadToCloudinary } from "../helpers/uploadProduct";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as Express.Multer.File[];
    console.log("upload product middlware is running start");

    if (!files || files.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "at least one image is required",
      });
    }

    if (files.length > 4) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "maximum of four images are allowed",
      });
    }
    let uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      const { imageUrl, publicId } = await uploadToCloudinary(file.path);

      console.log('result from cloudinary,', imageUrl, publicId)

      uploadedImages.push({
        imageUrl,
        publicId,
        isMain: i === 0,
      });
    }

    //     attach image to the request body
    req.body.images = uploadedImages;

    console.log('upload product middlware is running end')

    next();
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "failed to upload images to cloudinary",
    });
  }
};
