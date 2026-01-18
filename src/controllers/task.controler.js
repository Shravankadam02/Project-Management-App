import { User } from "../models/user.models.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { Subtask } from "../models/subtask.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";
import asyncHandler from "express-async-handler";
import { pipeline } from "nodemailer/lib/xoauth2/index.js";

const getTask = asyncHandler(async (req, res) => {
    const {projectId} = req.params;

    const project = await Project
        .findById(projectId)

     if(!project) {
        throw new ApiError(404, "Project not found");
    }
    const tasks = await Task
    .find({project : new mongoose.Types.ObjectId(projectId)})
    .populate('assignTo', 'name email username fullName avatar')
    return res
        .status(200)
        .json(new ApiResponse(200, "Tasks fetched successfully", tasks));
});

const getTaskById = asyncHandler(async (req, res) => {
    const {taskId} = req.params;
    const task = await Task
        .aggregate([
            {
                $match : {_id : new mongoose.Types.ObjectId(taskId)}
            },
            {
                $lookup : {
                    from : 'users',
                    localField : 'assignTo',
                    foreignField : '_id',
                    as : 'assignedUser',
                    pipeline : [
                        {
                            _id : 1,
                            username : 1,  
                            email : 1,
                            fullName : 1,
                            avatar : 1
                        }
                        
                    ]
                }
            },
            {
                $lookup : {
                    from : 'subtasks',
                    localField : '_id',
                    foreignField : 'task',
                    as : 'subtasks',
                    pipeline : [
                        {
                            $lookup : {
                                from : 'users',
                                localField : 'createdBy',
                                foreignField : '_id',
                                as : 'createdBy',
                                pipeline : [
                                    {
                                        $project : {
                                            _id : 1,
                                            email : 1,
                                            username : 1,
                                            fullName : 1,
                                            avatar : 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields : {
                                createdBy : {$arrayElemAt : ['$createdBy', 0]}
                            }
                        }
                    ]
                }
            }, 
            {
                $addFields : {
                    assignTo :
                     {$arrayElemAt : ['$assignTo', 0]

                    }
                }
            }
        ])
        .exec();
    if(!task || task.length === 0) {
        throw new ApiError(404, "Task not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Task fetched successfully", task));
}); 

const createTask = asyncHandler(async (req, res) => {
    const {title, description, assignTo, status} = req.body;
    
    const {projectId} = req.params;

    const project = await Project
        .findById(projectId)
    if(!project) {
        throw new ApiError(404, "Project not found");
    }

    const files = req.file || [];

    files.map((file) => {
        return {
            url : `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype : file.mimetype,
            size : file.size
            
        };
    
    })

    const task = await Task.create({
        title,
        description,
        project : new mongoose.Types.ObjectId(projectId),
        assignTo : assignTo ? new mongoose.Types.ObjectId(assignTo) : undefined,
        status,
        assignedBy : new mongoose.Types.ObjectId(req.user._id),
        attachments : files
    });
    return res.status(201)
        .json(new ApiResponse(201, "Task created successfully", task));
});

const updateTask = asyncHandler(async (req, res) => {
    
});

const deleteTask = asyncHandler(async (req, res) => {
    
});

const createSubTask = asyncHandler(async (req, res) => {
    
});

const updateSubTask = asyncHandler(async (req, res) => {
    
});

const deleteSubTask = asyncHandler(async (req, res) => {
    
});

export {
    getTask,
    createTask,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask,
    getTaskById
};


