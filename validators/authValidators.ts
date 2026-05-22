import { body, query } from "express-validator";

export const resetPasswordValidator = [
  body("newPassword")
    .notEmpty()
    .withMessage("newPassword is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("newPassword  must be at least 6 characters"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("confirmPassword is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("confirmPassword must be at least 6 characters")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("passwords do not match");
      }
      return true;
    }),

  query("token").notEmpty().withMessage("token is required")
];
