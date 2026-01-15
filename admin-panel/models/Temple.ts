
import mongoose, { Schema, models } from 'mongoose';

const TempleSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameHindi: { type: String },
    description: { type: String, required: true },
    descriptionHindi: { type: String },
    image: { type: String, required: true }, // Cover Image
    location: { type: String, required: true },
    locationHindi: { type: String },
    // Simplified structure for daily content:
    // videos: { "2024-01-15": { "morningAarti": "url...", "morningDarshan": "url..." } }
    videos: { type: Map, of: Object, default: {} }
}, { timestamps: true });

const TempleModel = models.Temple || mongoose.model('Temple', TempleSchema);
export default TempleModel;
