import mongoose, { Schema } from 'mongoose';

const featureRequestSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['Under Consideration', 'Planned', 'In Progress', 'Completed'],
        default: 'Under Consideration',
    },
}, { timestamps: true });

export const FeatureRequest = mongoose.model('FeatureRequest', featureRequestSchema);