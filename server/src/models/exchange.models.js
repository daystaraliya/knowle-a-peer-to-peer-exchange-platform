import mongoose, { Schema } from 'mongoose';

const exchangeSchema = new Schema({
    // User who initiated the exchange
    initiator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // User who is the target of the exchange
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Topic the initiator wants to learn
    topicToLearn: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    // Topic the initiator can teach
    topicToTeach: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    initiatorRating: {
        type: Number,
        min: 1,
        max: 5,
    },
    initiatorReview: {
        type: String,
        trim: true,
    },
    receiverRating: {
        type: Number,
        min: 1,
        max: 5,
    },
    receiverReview: {
        type: String,
        trim: true,
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }],
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }
}, { timestamps: true });

export const Exchange = mongoose.model('Exchange', exchangeSchema);