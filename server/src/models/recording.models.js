import mongoose, { Schema } from 'mongoose';

const recordingSchema = new Schema({
    exchange: {
        type: Schema.Types.ObjectId,
        ref: 'Exchange',
        required: true,
        index: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    url: {
        type: String, // Cloudinary URL
        required: true,
    },
    publicId: {
        type: String, // Cloudinary public_id for management
        required: true,
    },
    duration: {
        type: Number, // in seconds
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing',
    },
    transcript: {
        type: String,
        default: '',
    }
}, { timestamps: true });

export const Recording = mongoose.model('Recording', recordingSchema);
