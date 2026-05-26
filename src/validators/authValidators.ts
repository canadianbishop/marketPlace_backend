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

  query("token").notEmpty().withMessage("token is required"),
];

export const changePasswordValidator = [
  body("currentPassword")
    .trim()
    .notEmpty()
    .withMessage("currentPassword is required"),

  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("newPassword is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("newPassword must be at least six characters")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("old password reuseage is not allowed");
      }

      return true;
    }),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("confirmPassword is required")
    .isLength({ min: 6 })
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("new passwords fields do not match");
      }
      return true;
    }),
];
