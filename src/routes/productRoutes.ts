import express from "express";
import { authMiddleware } from "../middleware/authMiddlware";
import { validateProductQuery } from "../validators/productValidators";
import { fetchAllProductController } from "../controller/productControllers";
import { validateReq } from "../utils/validators";

const productRoutes = express.Router();

// all products

productRoutes.get('products', validateProductQuery,validateReq, fetchAllProductController)



productRoutes.post
export default productRoutes;
