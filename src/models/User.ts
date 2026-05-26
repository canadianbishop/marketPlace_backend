  import mongoose from "mongoose";
  import { Document } from "mongoose";
  import bcrypt from 'bcrypt'
  interface IUser  extends Document {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    role: "buyer" | "seller" | "admin";
    lastPasswordReset: Date;
    lastLogin:Date
  }

  const userSchema = new mongoose.Schema<IUser>(
    {
      email: {
        type: String,
        required: [true, "email is required"],
        lowercase: true,
        trim: true,
        unique: true,
        validate: {
          validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          message: "invalid email format",
        },
      },

      firstname: {
        type: String,
        required: [true, "firstname is requiured"],
        trim: true,
        maxlength: [40, "firstname cannot exceed forty characters"],
      },
      lastname: {
        type: String,
        required: [true, "lastname is requiured"],
        trim: true,
        maxlength: [40, "lastname cannot exceed forty characters"],
      },

      password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "password must be at least 6 characters"],
      },

      role: {
        type: String,
        enum: ["buyer", "seller", "admin"],
        default: "buyer",
      },

      lastPasswordReset: {
        type: Date,
        default:null
      },

      lastLogin:{
        type:Date,
        default:null
      }
    },
    { timestamps: true },
  );

  userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

  });

  export const User = mongoose.model<IUser>("User", userSchema);
