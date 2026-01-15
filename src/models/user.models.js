import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const userSchema = new Schema(
    {
        avatar: {
            type: {
                url: String,
                localPath: String
            },
            default: {
                url: "https://placehold.co/200x200",
                localPath: ""
            }
        },

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        fullName: {
            type: String,
            trim: true
        },

        password: {
            type: String,
            required: [true, "Password is required"]
        },

        // Fixed field name
        isEmailVerified: {
            type: Boolean,
            default: false
        },

        refreshToken: {
            type: String
        },

        forgotPasswordToken: {
            type: String
        },

        forgotPasswordTokenExpiry: {
            type: Date
        },

        emailVerificationToken: {
            type: String
        },

        emailVerificationTokenExpiry: {
            type: Date
        }
    },
    { timestamps: true }
);

/* 🔐 Hash password before save */
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

/* 🔑 Compare password */
userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password);
};

/* 🔑 Generate Access Token */
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

/* 🔁 Generate Refresh Token */
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

/* ⏳ Generate Temporary Token (for email verify / reset password) */
userSchema.methods.generateTemporaryToken = function () {
    const unHashedToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");

    const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes

    return { hashedToken, unHashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);
    