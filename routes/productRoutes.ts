import express from 'express';
import { authMiddlware } from '../middleware/authMiddlware.ts';


const productRoutes = express.Router();

productRoutes.get('/allProducts', authMiddlware, (req:any, res:any)=>{
     res.status(200).send('welcome to products page')
})



export default productRoutes;