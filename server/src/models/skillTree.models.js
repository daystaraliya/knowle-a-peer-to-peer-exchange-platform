import mongoose, { Schema } from 'mongoose';

const skillTreeSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String, // e.g., URL to an SVG or a name for a font icon
    },
    rootNodes: [{
        type: Schema.Types.ObjectId,
        ref: 'SkillNode'
    }]
}, { timestamps: true });

export const SkillTree = mongoose.model('SkillTree', skillTreeSchema);
