import mongoose, { Schema } from 'mongoose';

const mentorshipOfferingSchema = new Schema({
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
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: { // Price in cents
        type: Number,
        required: true
    },
    duration: { // e.g., "60 minutes"
        type: String,
        required: true
    },
}, { timestamps: true });

export const MentorshipOffering = mongoose.model('MentorshipOffering', mentorshipOfferingSchema);