import { body } from "express-validator";
import { AvailableUserRoles } from "../utils/constants.js";

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

const createProjectValidator = () => {
    return [
        body("name")
            .notEmpty()
            .withMessage("Project name is required")
            .isLength({ max: 100 })
            .withMessage("Project name must be less than 100 characters"),
        body("description")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Description must be less than 500 characters"),
    ];
}

const addMemberToProjectValidator = () => {
    return [
        body("email")
            .isEmail()
            .withMessage("Invalid email format")
            .notEmpty()
            .withMessage("Email is required"),
        body("role")
            .notEmpty()
            .withMessage("Role is required")
            .isIn(AvailableUserRoles)
            .withMessage("Role must be one of the following: admin, member, viewer"),
    ];
}

export {
    userRegistrationValidator,
    userLoginValidator,
    userChangePasswordValidator,
    userForgotPasswordValidator,
    userResetPasswordValidator,
    createProjectValidator,
    addMemberToProjectValidator
}