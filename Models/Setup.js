import mongoose from 'mongoose';

const setupSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: false
    },
    enabled: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Setup', setupSchema);