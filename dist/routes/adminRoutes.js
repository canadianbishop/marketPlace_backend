"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddlware_ts_1 = require("../middleware/authMiddlware.ts");
const adminMiddlware_ts_1 = require("../middleware/adminMiddlware.ts");
const adminController_ts_1 = require("../controller/adminController.ts");
const adminRoute = express_1.default.Router();
// admin dashbord
adminRoute.get('/dashboard', authMiddlware_ts_1.authMiddlware, adminMiddlware_ts_1.adminMiddleware, adminController_ts_1.adminDashbordContoller);
// metrics of all the products
// deleting seller
// delete user
exports.default = adminRoute;
