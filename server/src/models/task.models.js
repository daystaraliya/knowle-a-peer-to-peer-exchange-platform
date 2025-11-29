import mongoose, { Schema } from 'mongoose';

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Done'],
        default: 'To Do'
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    assignee: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema);