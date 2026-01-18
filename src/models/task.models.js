import mongoose, { Schema } from "mongoose";
import { TaskStatusEnum, AvailableTaskStatuses } from "../utils/constants.js";

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: AvailableTaskStatuses,
        default: TaskStatusEnum.TODO
    },
    assignedTo : {
        type: Schema.Types.ObjectId,
        ref: "User",
       
    },
    assignedBy : {
        type: Schema.Types.ObjectId,
        ref: "User",
        
    },
    project : {
        type: Schema.Types.ObjectId,
        ref: "Project",
        
    },
    attachments: {
        type : [{
            url: String,
            mimetype: String,
            size: Number
        }],
        default: []
    }
}, { timestamps: true });

export const Task = mongoose.model("Task", taskSchema);