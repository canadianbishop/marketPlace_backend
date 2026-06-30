import express from "express";
import type { Request, Response } from "express";
import { config } from "dotenv";
import "dotenv/config";
import morgan from "morgan";
import compression from "compression";
import connectDb from "./database/dbConnection";
import { query, validationResult } from "express-validator";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import SellerRoutes from "./routes/sellerRoute";
import adminRoute from "./routes/adminRoutes";

const app = express();

app.use(morgan("dev"));
// app.use(compression);
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoute)
app.use('/api', productRoutes)
app.use('/api/profile', SellerRoutes)
config();

app.get("/", query("person").notEmpty(), (req: Request, res: Response) => {

    const result = validationResult(req);
    console.log(result.isEmpty())
     if (!result.isEmpty()) {
       return res.json({
        success:false,
        message:'please provide your name'
       });
     }

  res.json({
    success: true,
    message: `Welcome to ${req.query.person!} Marketplace`,
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Health OK!",
    data: {},
  });
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await connectDb();

  app.listen(PORT, () => {
    console.log(
      `Backend is running on http://localhost:${PORT} ...betta go catch it`,
    );
  });
};

startServer();
