import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { ProjectNote } from "../models/note.models.js"; 
import { Subtask } from "../models/subtask.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants";

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const project = await Project.create({
        name,
        description,
        createdBY: new mongoose.Types.ObjectId(req.user._id)
    });

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: UserRolesEnum.ADMIN
    });
    res
        .status(201)
        .json(new ApiResponse
            (201, "Project created successfully", project));
});

const updateProject = asyncHandler(async (req, res) => {
    const { name, description} =  req.body;
    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(projectId, {
        name,
        description
    },
    { new: true }
    );

    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Project updated successfully", project));
});

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Project deleted successfully", project));
});

const getProject = asyncHandler(async (req, res) => {
    const projects =  await ProjectMember.aggregate([
        {
            $match: { 
                user: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "projects",
                localField: "projects",
                foreignField: "_id",
                as: "projects",
                pipeline: [
                    {
                        $lookup: {
                            from: "projectmembers",
                            localField: "_id",
                            foreignField: "projects",
                            as: "projectMembers",
                        }  
                    },
                    {
                        $addFields: {
                            memberCount: { $size: "$projectMembers" }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$project"
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                createdBY: 1,
                memberCount: 1,
                createdAt: 1,
                updatedAt: 1
            },
            role: 1,
            _id: 0
        }
    ]);
    return res
        .status(200)
        .json(new ApiResponse(200, "Projects fetched successfully", projects));
});

const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Project fetched successfully", project));
});

const addMembersToProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const {email , role} = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await ProjectMember.findByIdAndUpdate(
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId)
        }, 
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId),
            role: role
        },
        {
            new: true,
            upsert: true
        }
    );
    return res
        .status(200)
        .json(new ApiResponse(200, "Member added to project successfully"));

    
});

const getProjectMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(req.params);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const projectMembers = await ProjectMember.aggregate([
        {
            $match: { 
                project: new mongoose.Types.ObjectId(projectId)
            },

        },

        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                            email: 1
                        }
                    }
                ]

            }
        },
        {
            $addFields: {
                user: { $arrayElemAt: ["$user", 0] }
            }
        },
        {
            $project: {
                project: 1,
                role: 1,
                _id: 0,
                user: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ])
    return res
        .status(200)
        .json(new ApiResponse(200, "Project members fetched successfully", projectMembers));
});

const updateMemberRole = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;
    const { newRole } = req.body;

    if(!AvailableUserRoles.includes(newRole)) {
        throw new ApiError(400, "Invalid role");
    }

    let projectMember = await ProjectMember.findOne(
        {
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(userId)
        });

    if (!projectMember) {
        throw new ApiError(404, "Project member not found");
    }

    projectMember = await ProjectMember.findByIdAndUpdate(
        projectMember._id,
        {
            role: newRole
        },
        { new: true }
    );

    if (!projectMember) {
        throw new ApiError(404, "Project member not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Project member role updated successfully", projectMember));


});

const deleteMember = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;

    let projectMember = await ProjectMember.findOne(
        {
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(userId)
        });

    if (!projectMember) {
        throw new ApiError(404, "Project member not found");
    }

    projectMember = await ProjectMember.findByIdAndDelete(
        projectMember._id
    );
    

    if (!projectMember) {
        throw new ApiError(404, "Project member not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Project member deleted successfully", projectMember));
});

export {
    createProject,
    getProject,
    getProjectById,
    updateProject,
    deleteProject,
    addMembersToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember
};