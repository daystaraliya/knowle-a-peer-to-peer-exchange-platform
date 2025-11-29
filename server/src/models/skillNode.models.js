import mongoose, { Schema } from 'mongoose';

const skillNodeSchema = new Schema({
    topic: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    skillTree: {
        type: Schema.Types.ObjectId,
        ref: 'SkillTree',
        required: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'SkillNode',
        default: null // Root nodes have no parent
    },
    children: [{
        type: Schema.Types.ObjectId,
        ref: 'SkillNode'
    }],
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Beginner'
    }
}, { timestamps: true });

export const SkillNode = mongoose.model('SkillNode', skillNodeSchema);
