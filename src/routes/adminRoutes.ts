import express from "express";
import { authMiddleware } from "../middleware/authMiddlware.ts";
import { adminMiddleware } from "../middleware/adminMiddlware.ts";
import {adminDashbordContoller} from "../controller/adminController.ts"

const adminRoute = express.Router();

// admin dashbord

adminRoute.get('/dashboard', authMiddleware, adminMiddleware, adminDashbordContoller)

// metrics of all the products

// deleting seller

// delete user

export default adminRoute;
