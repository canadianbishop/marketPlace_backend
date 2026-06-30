import express from "express";
import { authMiddleware } from "../middleware/authMiddlware";
import { validateProductId, validateProductQuery } from "../validators/productValidators";
import { fetchAllProductController, getProductDetails } from "../controller/productControllers";
import { validateReq } from "../utils/validators";

const productRoutes = express.Router();

// all products
productRoutes.get('/products', validateProductQuery,validateReq, fetchAllProductController)

// get product by id

productRoutes.get('/products/:id',validateProductId,validateReq, getProductDetails)

export default productRoutes;
