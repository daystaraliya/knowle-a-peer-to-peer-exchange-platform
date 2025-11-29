import mongoose, { Schema } from 'mongoose';

const verifiedSkillSchema = new Schema({
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
}, { timestamps: true });

// Ensure a user can only have one verified badge per topic
verifiedSkillSchema.index({ user: 1, topic: 1 }, { unique: true });

export const VerifiedSkill = mongoose.model('VerifiedSkill', verifiedSkillSchema);