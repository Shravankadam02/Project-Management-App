import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail } from "../utils/mail.js";
import { emailVerificationMailgenContent } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { forgotPasswordMailgenContent } from "../utils/mail.js";


/* 🔐 Generate tokens */
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};

/* 🧾 Register user */
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // ✅ Validation
    if (!username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(400, "Username or email already in use");
    }

    // ✅ Create user
    const user = await User.create({
        username,
        email,
        password,
        isEmailVerified: false
    });

    // ✅ Generate email verification token
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    // ✅ Send verification email
    await sendEmail({
        email: user.email,
        subject: "Verify your email for Project Management App",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });

    // ✅ Remove sensitive fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry"
    );

    if (!createdUser) {
        throw new ApiError(500, "Error creating user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const login = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    if ((!email || !username) || !password) {
        throw new ApiError(400, "Email or username and password are required");
    }
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry"
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200).cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: { refreshToken: null }
        },
        { new: true }
    );
    const options = {
        httpOnly: true,
        secure: true,
        expires: new Date(0)
    };
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, "Verification token is required");
    }

    let hashedToken = crypto.createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: Date.now() }

    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, { isEmailVerified: true }, "Email verified successfully")
    );

});

const resendEmailVerification = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (user.isEmailVerified) {
        throw new ApiError(400, "Email is already verified");
    }

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    // ✅ Send verification email
    await sendEmail({
        email: user.email,
        subject: "Verify your email for Project Management App",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        ),
    });
    return res
    .status(200)
    .json(
        new ApiResponse(200, null, "Verification email resent successfully")
    );
});

const refereshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?.id || decodedToken?._id);
        if (!user || user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token mismatch");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully"));

    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});

const forgotPassword = asyncHandler(async (req, res) => {
     const { email } = req.body;

     const user = await User.findOne({ email });
     if (!user) {
         throw new ApiError(404, "User not found");
     }

    const { unHashedToken, hashedToken, tokenExpiry } =
         user.generateTemporaryToken();
        user.forgotPasswordToken = hashedToken;
        user.forgotPasswordTokenExpiry = tokenExpiry;

     await user.save({ validateBeforeSave: false });

     await sendEmail({
         email: user.email,
         subject: "Reset your password for Project Management App",
         mailgenContent: forgotPasswordMailgenContent(
             user.username,
             `${process.env.FORGOT_PASSWORD_REDIRECT_URL}?token=${unHashedToken}`
         ),

     });

        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Forgot password email sent successfully")
        );
    });

const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    let hashedToken = crypto.createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOneAndUpdate(
        {
            forgotPasswordToken: hashedToken,
            forgotPasswordTokenExpiry: { $gt: Date.now() }
        }
    );  
    
    if (!user) {
        throw new ApiError(400, "Invalid or expired password reset token");
    } 

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Password reset successfully")
    );  
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});

export { registerUser , login , logoutUser , getCurrentUser, verifyEmail, resendEmailVerification, refereshAccessToken, forgotPassword, resetForgotPassword, changeCurrentPassword };   