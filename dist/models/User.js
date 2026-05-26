"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: [true, "email is required"],
        lowercase: true,
        trim: true,
        unique: true,
        validate: {
            validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
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
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, { timestamps: true });
userSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    const salt = await bcrypt_1.default.genSalt(10);
    this.password = await bcrypt_1.default.hash(this.password, salt);
});
exports.User = mongoose_1.default.model("User", userSchema);
