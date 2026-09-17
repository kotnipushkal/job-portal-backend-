const { body, validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

// Runs after the *ValidationRules below; collects errors and returns 400.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(", ");
    return next(new ApiError(400, message));
  }
  next();
};

const registerValidationRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["jobseeker", "employer", "admin"])
    .withMessage("Role must be jobseeker, employer, or admin"),
];

const loginValidationRules = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const jobValidationRules = [
  body("title").trim().notEmpty().withMessage("Job title is required"),
  body("companyName").trim().notEmpty().withMessage("Company name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("employmentType")
    .isIn(["full-time", "part-time", "contract", "internship", "remote"])
    .withMessage("Invalid employment type"),
];

module.exports = {
  validate,
  registerValidationRules,
  loginValidationRules,
  jobValidationRules,
};
