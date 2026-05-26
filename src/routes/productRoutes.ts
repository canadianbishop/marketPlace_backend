import express from "express";
import { authMiddleware } from "../middleware/authMiddlware";

const productRoutes = express.Router();

productRoutes.get("/allProducts", authMiddleware, (req: any, res: any) => {
  res.status(200).send("welcome to products page");
});

export default productRoutes;
