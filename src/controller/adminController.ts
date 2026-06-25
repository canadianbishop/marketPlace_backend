import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SellerApplication } from "../models/SellerApplication";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import "dotenv/config";
import { User } from "../models/User";

export const adminDashbordContoller = (req: Request, res: Response) => {
  try {
  } catch (error) {}
};

// get all applications
export const getAllApplicationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { pageNo, pageLimit, sortBy } = req.query!;

    const page = Number(pageNo) || 1;
    const limit = Number(pageLimit) || 10;
    const skip = (page - 1) * limit;
    const totalApplications = await SellerApplication.countDocuments();
    const totalPages = Math.ceil(totalApplications / limit);

    const applications = await SellerApplication.find({})
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    if (applications.length === 0) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "no applications found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      totalPages,
      totalApplications,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      data: applications,
    });
  } catch (error: any) {
    console.log("server error something went wrong", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "internal server error something went wrong",
    });
  }
};

// review seller application

export const reviewSellerController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // handle validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: errors.array(),
      });
    }

    const application = await SellerApplication.findById(id).populate("userId");

    if (!application) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "an application with the provided id was not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      user: application,
    });
  } catch (error) {
    console.log("server error something went wrong", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "internal server error something went wrong",
    });
  }
};

// approve seller
export const approveSellerController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        errors: errors.array(),
      });
    }

    // get application
    const application = await SellerApplication.findById(id).populate(
      "userId",
      "email firstname, role",
    );

    if (!application) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "application not found",
      });
    }

    // get user
    await User.findByIdAndUpdate(
      application?.userId,
      { role: "seller" },
      { new: true },
    );

    // update application
    application.status = "approved";

    if (notes) {
      application.adminNotes = notes;
    }

    const user = application.userId as any;
    const userEmail = user?.email;
    const firstName = user?.firstname;

    const result = await application.save();

    console.log(result);

    //  send an email to the user

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        to: userEmail,
        subject: "SELLER APPLICATION APPROVALL CONFIRMATION",
        html: `
            <p> Congratulations, Dear ${firstName},</p>
            <p> this email is to formally notify you that your application to become a seller has been approved</p>
            <p>you can now upload goods on the platform as a seller and we will link you to your potential customers</p>
            <p> if the request to be a seller was not made by you please contact the support team thank you</p>
         `,
      });
    } catch (emailError) {
      console.error(`Email failed for ${userEmail}`, emailError);
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "application approved successfully",
    });
  } catch (error) {
    console.log("internal server error", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "server errro something went wrong",
    });
  }
};



//decline seller
export const declineSellerController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    //    handle express validator errors;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        errors: errors.array(),
      });
    }

    const application = await SellerApplication.findById(id).populate(
      "userId",
      "firstname, email",
    );

    if (!application) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "application not found",
      });
    }

    application.status = "declined";

    if (notes) {
      application.adminNotes = notes;
    }

    const user = application.userId as any;
    const { email, firstname } = user;

    // send email to notify the user

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        to: email,
        subject: "SELLER APPLICATION DECLINE NOTICE",
        html: `
            <p>  Dear ${firstname},</p>
            <p> this email is to formally notify you that your application to become a seller has been declined</p>
            <p>you will be eligible to apply again after 30 days</p>
            <p> if the request to be a seller was not made by you please contact the support team thank you</p>
         `,
      });
    } catch (emailError) {
      console.log(`Email sending to ${email} failed `);
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "application declined successfully",
    });
  } catch (error) {
    console.log("server error", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "internal serve error something went wrong",
    });
  }
};
