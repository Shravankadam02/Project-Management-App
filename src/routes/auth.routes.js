import { Router } from 'express';
import { changeCurrentPassword, forgotPassword, getCurrentUser, refereshAccessToken, registerUser, resendEmailVerification, resetForgotPassword, verifyEmail } from '../controllers/auth.controller.js';
import { login } from '../controllers/auth.controller.js';
import { userChangePasswordValidator, userForgotPasswordValidator, userLoginValidator, userResetPasswordValidator } from '../validators/index.js';
import { validateRequest } from '../middlewares/validator.middleware.js';
import { userRegistrationValidator } from '../validators/index.js';
import { verifyJWTtoken } from '../middlewares/auth.middleware.js';
import { logoutUser } from '../controllers/auth.controller.js';
import { get } from 'mongoose';

const router = Router();

// Public routes 
router.route('/register').post( (userRegistrationValidator()), validateRequest, registerUser);
router.route('/login').post((userLoginValidator()), validateRequest, login);
router.route('/verify-email/:verificationToken').get( verifyEmail);
router.route('/refresh-token').post(refereshAccessToken);
router.route('/forgot-password').post(userForgotPasswordValidator(), validateRequest, forgotPassword);
router.route('/reset-password/:resetToken').post(userResetPasswordValidator(), validateRequest, resetForgotPassword);

// Protected route 
router.route('/logout').post(verifyJWTtoken, logoutUser);
router.route('/current-user').post(verifyJWTtoken, getCurrentUser);
router.route('/change-password').post(verifyJWTtoken, userChangePasswordValidator(), validateRequest, changeCurrentPassword);
router.route('/resend-email-verification').post(verifyJWTtoken, resendEmailVerification);
export default router;      