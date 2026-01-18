import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";


export const verifyJWTtoken = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }
    // Verify the token and attach user information to the request
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?.id || decodedToken?._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry");
        if (!user) {
            throw new ApiError(401, "Unauthorized request");
        }
        req.user = user;
        next();
     }
      catch (error) {
        throw new ApiError(401, "Invalid access token");
    }
});

export const validateProjectPermission = (roles = []) => { 
    return asyncHandler(async (req, res, next) => {
        const { projectId } = req.params;


        if (!projectId) {
            throw new ApiError(400, "Project ID is required");
        }

        const project = await ProjectMember.findOne({
                project: new mongoose.Types.ObjectId(projectId),
                user: new mongoose.Types.ObjectId(req.user._id)
            })
        if (!project) {
            throw new ApiError(400, " project not found ");
        }

        const givenRole = project?.role;
        req.user.role = givenRole;
        
        if (!roles.includes(givenRole)) {
            throw new ApiError(403, "Forbidden: You don't have enough permission to perform this action");
        }

        next();

            
    })
};