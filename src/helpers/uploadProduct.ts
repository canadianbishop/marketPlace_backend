import cloudinary from "../config/cloudinary";
import fs from "fs";

interface ResultType {
  imageUrl: string;
  publicId: string;
}

 export const uploadToCloudinary = async (filePath: string): Promise<ResultType> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "products",
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

    //   clear local storage

    fs.unlinkSync(filePath);

    return {
      publicId: result.public_id,
      imageUrl: result.secure_url,
    };
  } catch (error) {
    // clear storage even if file fails

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new Error("failed to upload  to cloudinary");
  }
};
