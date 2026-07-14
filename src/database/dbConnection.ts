import mongoose from "mongoose";
import 'dotenv/config'

const connectDb = async () => {
  try {
    const dburl = process.env.DBURL;

    if (!dburl) {
      throw new Error("database connection string is missing");
    }

    await mongoose.connect(dburl);
    console.log(mongoose.connection.name)
    console.log("connected to database  successfully");
  } catch (error) {
    console.log("error while connecting to database =>", error);
    process.exit(1);
  }
};


export default connectDb;