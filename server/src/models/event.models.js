import mongoose, { Schema } from 'mongoose';

const eventSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    topic: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    durationMinutes: {
        type: Number,
        required: true,
    },
    maxAttendees: {
        type: Number,
        required: true,
        min: 1,
    },
    attendees: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming',
        index: true,
    },
    meetingLink: { // e.g., for Zoom, Google Meet, etc.
        type: String,
        trim: true,
    }
}, { timestamps: true });

export const Event = mongoose.model('Event', eventSchema);