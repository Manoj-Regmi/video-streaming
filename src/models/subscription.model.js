import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    subacriber: {
        type: mongoose.Schema.Types.ObjectId, //one who is subscribing
        ref: 'User'
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, //one to whom the subscriber is subscribing
        ref: 'User'
    }
}, {
    timestamps: true
})

export const Subscription = mongoose.model('Subscription', subscriptionSchema);