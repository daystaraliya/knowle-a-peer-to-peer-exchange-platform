import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: { // URL to navigate to upon clicking the notification
        type: String,
        required: true
    }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);