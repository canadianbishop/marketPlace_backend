"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const connectDb = async () => {
    try {
        const dburl = process.env.DBURL;
        if (!dburl) {
            throw new Error("database connection string is missing");
        }
        await mongoose_1.default.connect(dburl);
        console.log("connected to database  successfully");
    }
    catch (error) {
        console.log("error while connecting to database =>", error);
        process.exit(1);
    }
};
exports.default = connectDb;
