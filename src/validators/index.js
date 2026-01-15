import { body } from "express-validator";

const userRegistrationValidator = () => {
    return [
        body("email")
            .isEmail()
            .withMessage("Invalid email format")
            .notEmpty()
            .withMessage("Email is required"),
        body("username")
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({ min: 3, max: 15 })
            .withMessage("Username must be between 3 and 15 characters"),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 4 })
            .withMessage("Password must be at least 4 characters long"),
    
    body("fullName")
        .optional()

    ];
}

const userLoginValidator = () => {
    return [
        body("email")
            .optional()
            .isEmail()
            .withMessage("Invalid email format")
            .notEmpty()
            .withMessage("Email is required"),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ];
}

const userChangePasswordValidator = () => {
    return [
        body("oldPassword")
            .notEmpty()
            .withMessage("Old password is required"),
        body("newPassword")
            .notEmpty()
            .withMessage("New password is required")
            .isLength({ min: 4 })
            .withMessage("New password must be at least 4 characters long"),
    ];
}

const userForgotPasswordValidator = () => {
    return [
        body("email")
            .isEmail()
            .withMessage("Invalid email format")
            .notEmpty()
            .withMessage("Email is required"),
    ];
}

const userResetPasswordValidator = () => {
    return [
        body("newPassword")
            .notEmpty()
            .withMessage("New password is required")
            .isLength({ min: 4 })
            .withMessage("New password must be at least 4 characters long"),
    ];
}

export {
    userRegistrationValidator,
    userLoginValidator,
    userChangePasswordValidator,
    userForgotPasswordValidator,
    userResetPasswordValidator
}