import 'dotenv/config';
import connectDb from '../database/dbConnection';
import { Product } from '../models/Products';
import mongoose from 'mongoose';

const updateProduct = async ()=>{
      try {
            
            await connectDb();
            const result =  await Product.updateMany(
                  {isDeleted:{$exists:false}},
                  {$set:{isDeleted:false}}
            )

            console.log(result);

            await mongoose.disconnect()
      } catch (error) {
            console.error(error), 
            process.exit(1)
      }
}


updateProduct()