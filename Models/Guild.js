import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    prefix: {
        type: String,
        default: '!'
    },
    djRole: {
        type: String,
        default: null
    },
    volume: {
        type: Number,
        default: 80,
        min: 0,
        max: 100
    },
    autoplay: {
        type: Boolean,
        default: false
    },
    twentyFourSeven: {
        type: Boolean,
        default: false
    },
    textChannel: {
        type: String,
        default: null
    },
    voiceChannel: {
        type: String,
        default: null
    },
    ignoredChannels: [{
        type: String
    }],
    language: {
        type: String,
        default: 'en'
    },
    noPrefixMode: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Guild', guildSchema);