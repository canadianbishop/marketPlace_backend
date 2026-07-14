import express from 'express';
import { authMiddleware } from '../middleware/authMiddlware';
import { checkoutController, initializePaymentController } from '../controller/orderControllers';
import { checkoutValidator } from '../validators/ordervalidators';
import { validateReq } from '../utils/validators';

const orderRoutes = express.Router();

// checkout
orderRoutes.post('/checkout',authMiddleware,checkoutValidator,validateReq, checkoutController);

// initialize payment;
orderRoutes.post('/initialize-payment', authMiddleware,checkoutValidator,validateReq,initializePaymentController);


export default orderRoutes;