import mongoose, { Schema } from 'mongoose';

const skillProficiencySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    topic: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true,
        index: true,
    },
    proficiency: {
        type: String,
        enum: ['Novice', 'Intermediate', 'Advanced', 'Expert'],
        required: true,
    },
    lastAssessed: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Ensure a user has only one proficiency entry per topic
skillProficiencySchema.index({ user: 1, topic: 1 }, { unique: true });

export const SkillProficiency = mongoose.model('SkillProficiency', skillProficiencySchema);