import mongoose, { Schema } from 'mongoose';

const resourceSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['article', 'link'],
        required: true,
    },
    content: { // For type 'article'
        type: String,
    },
    url: { // For type 'link'
        type: String,
        trim: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    topic: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true,
        index: true,
    },
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
}, { timestamps: true });

export const Resource = mongoose.model('Resource', resourceSchema);