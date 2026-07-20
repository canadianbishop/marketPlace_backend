import { body, param, query } from "express-validator";

// upload product validator
export const ProductValidator = [
  body("name").trim().notEmpty().withMessage("product must have a name"),

  body("price")
    .trim()
    .notEmpty()
    .withMessage("product must have a price")
    .isNumeric()
    .withMessage("price must be a number"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("product must have a category"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("product must have a description"),

  body("stock").isInt({ min: 1 }).withMessage("stock must be at least one"),
];

// get all product validator
const allowedFeilds = ["name", "price", "category"];

export const validateProductQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "name", "price", "category"])
    .withMessage("sortBy must be: name, price, category"),
];

// product details validator

export const validateProductId = [
  param("id")
    .notEmpty()
    .withMessage("product id not provided")
    .isMongoId()
    .withMessage("product id is not a valid mongoId"),
];
