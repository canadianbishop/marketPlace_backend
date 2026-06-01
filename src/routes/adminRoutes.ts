import express from "express";
import { authMiddleware } from "../middleware/authMiddlware.ts";
import { adminMiddleware } from "../middleware/adminMiddlware.ts";
import {
  adminDashbordContoller,
  getAllApplicationsController,
  approveSellerController,
  reviewSellerController,
  declineSellerController,
} from "../controller/adminController.ts";
import { validateId } from "../validators/sellerValidators.ts";

const adminRoute = express.Router();

// admin dashbord

adminRoute.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  adminDashbordContoller,
);

// all applications

adminRoute.get(
  "/dashboard/seller-applications",
  authMiddleware,
  adminMiddleware,
  getAllApplicationsController,
);

// review seller application

adminRoute.post(
  "/dashboard/seller-application/review/:id",
  authMiddleware,
  adminMiddleware,
  validateId,
  reviewSellerController,
);

// approve seller

adminRoute.post(
  "/dashboard/application/approve/:id",
  authMiddleware,
  adminMiddleware,
  validateId,
  approveSellerController,
);


// decline seller
adminRoute.post(
  "/dashboard/application/decline/:id",
  authMiddleware,
  adminMiddleware,
  validateId,
  declineSellerController,
);

// metrics of all the products

// deleting seller

// delete user

export default adminRoute;
