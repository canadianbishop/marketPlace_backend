import mongoose, { Types } from "mongoose";
import {type cartItem } from "../controller/orderControllers";
import { Document } from "mongoose";

interface PaymentSession extends Document{
      userId:Types.ObjectId;
      reference:string;
      status:'pending' | 'completed';
      cart:cartItem[];
      total:number
}

const paymentSessionSchema = new mongoose.Schema<PaymentSession>({
      userId:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'User',
         required:true
      },

      reference:{
            type:String,
            required:[true, 'payment reference is requiured'],
            unique:true
      },

      status:{
            type:String,
            enum:['pending', 'completed'],
            default:'pending'
            
      },
      cart:{
            type:[
                  {
                        productId:{
                              type:String,
                              required:true
                        },
                        quantity:{
                              type:Number,
                              required:true,
                              min:1
                        }
                  }
            ],
            required:true
      },
      total:{
            type:Number,
            required:[true, 'session must include a total amount payed']
      }
},{timestamps:true})

export const PaymentSession =  mongoose.model<PaymentSession>('PaymentSession', paymentSessionSchema)