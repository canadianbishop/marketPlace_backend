import express from 'express';
import { authMiddleware } from '../middleware/authMiddlware';
import { checkoutController } from '../controller/orderControllers';
import { checkoutValidator } from '../validators/ordervalidators';
import { validateReq } from '../utils/validators';

const orderRoutes = express.Router();

// checkout
orderRoutes.post('/checkout',authMiddleware,checkoutValidator,validateReq, checkoutController)


export default orderRoutes;