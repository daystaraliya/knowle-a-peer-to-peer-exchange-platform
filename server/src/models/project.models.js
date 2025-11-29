import mongoose, { Schema } from 'mongoose';

const projectSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    relatedExchange: {
        type: Schema.Types.ObjectId,
        ref: 'Exchange',
        required: true,
        unique: true
    }
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);