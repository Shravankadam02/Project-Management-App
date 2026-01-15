import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";


export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  if (!errors.isEmpty()) {
  console.log("VALIDATION ERRORS 👉", errors.array());
  throw new ApiError(422, "Validation Error", extractedErrors);
}

  errors.array().forEach((err) => 
    extractedErrors.push({
        [err.path]: err.msg
    }));
    throw new ApiError(422, "Validation Error", extractedErrors);

  };
  