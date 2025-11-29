
import mongoose, { Schema } from 'mongoose';

const topicSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    }
}, { timestamps: true });

export const Topic = mongoose.model('Topic', topicSchema);
