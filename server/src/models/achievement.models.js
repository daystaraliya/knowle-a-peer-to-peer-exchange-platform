import mongoose, { Schema } from 'mongoose';

const achievementSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    icon: {
        type: String, // e.g., URL or emoji
        required: true,
    },
    criteria: {
        type: String, // A key to identify this achievement programmatically, e.g., 'FIRST_EXCHANGE'
        required: true,
        unique: true,
    },
    points: {
        type: Number,
        default: 10,
    }
}, { timestamps: true });

export const Achievement = mongoose.model('Achievement', achievementSchema);