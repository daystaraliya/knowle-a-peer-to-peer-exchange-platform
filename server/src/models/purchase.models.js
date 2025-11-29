import mongoose, { Schema } from 'mongoose';

const purchaseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    item: {
        type: Schema.Types.ObjectId,
        required: true
        // Note: No 'ref' as it could be a MentorshipOffering or a subscription plan
    },
    itemType: {
        type: String,
        enum: ['mentorship', 'subscription'],
        required: true
    },
    amount: { // in cents
        type: Number,
        required: true
    },
    stripePaymentId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        default: 'succeeded'
    }
}, { timestamps: true });

export const Purchase = mongoose.model('Purchase', purchaseSchema);