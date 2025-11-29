import mongoose, { Schema } from 'mongoose';

const premiumContentSchema = new Schema({
    mentor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['article', 'video'],
        default: 'article'
    },
}, { timestamps: true });

export const PremiumContent = mongoose.model('PremiumContent', premiumContentSchema);