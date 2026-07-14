import "dotenv/config";
import axios from "axios";
interface IntializeTransactionData {
  email: string;
  amount: number;
}

// initialize payment
export const initializeTransaction = async ({email, amount}:IntializeTransactionData)=>{

    try {
        if (!process.env.PAYSTACK_SECRET_KEY) {
          throw new Error("paystack secret key is missing");
        }
        const INITIALIZE_PAYSTACK_URL =
          "https://api.paystack.co/transaction/initialize";
        const payload = { email, amount };
        const config = {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        };

        const {data} = await axios.post(INITIALIZE_PAYSTACK_URL,payload, config);
        return data;
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.log(error.response?.data)
        }

        throw new Error('something went wrong initializing paystack payment')
    }

}


// verify payment

export const verifyTransaction = async (reference:string)=>{
     try {
      if (!process.env.PAYSTACK_SECRET_KEY) {
        throw new Error("Paystack secret key is missing");
      }
      const verify_url =
        `https://api.paystack.co/transaction/verify/${reference}`;
      
        const config = {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          },
        };
      
        const {data} = await axios.get(verify_url,config)
        return data
     } catch (error) {
      if(axios.isAxiosError(error)){
        console.log(error.response?.data)
      }
     }

     throw new Error('an error occured while verifying transaction')
}