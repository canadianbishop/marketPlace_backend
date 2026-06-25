import { body, param, } from "express-validator";

export const SellerValidators = [
  body("storeName").trim().notEmpty().withMessage("storeName is requires"),

  body("categories")
    .isArray({ min: 1 })
    .withMessage("you must select at least one category"),

  body("justification")
    .trim()
    .notEmpty()
    .withMessage("justification field is required")
    .isLength({ min: 20 })
    .withMessage("your justification must be at least twenty characters"),

  body("country")
  .trim()
  .notEmpty()
  .withMessage("country is required"),

  body("state")
  .trim()
  .notEmpty()
  .withMessage("state is required"),

  body("city")
  .trim()
  .notEmpty()
  .withMessage("city is required"),
];





// admin validators

export const validateId = [
  param('id').isMongoId().withMessage('empty or invalid seller Id')
]