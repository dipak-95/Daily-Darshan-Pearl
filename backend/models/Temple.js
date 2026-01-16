const mongoose = require('mongoose');

const VideoContentSchema = new mongoose.Schema({
    morningAarti: String,
    eveningAarti: String,
    morningDarshan: String,
    eveningDarshan: String
}, { _id: false });

const TempleSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    nameHindi: String,
    description: String,
    descriptionHindi: String,
    location: { type: String, required: true },
    locationHindi: String,
    image: String,
    activeContentTypes: [String],
    videos: {
        type: Map,
        of: VideoContentSchema
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Temple', TempleSchema);
