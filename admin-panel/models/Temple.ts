import mongoose, { Schema, models } from 'mongoose';

const TempleSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameHindi: { type: String },
    description: { type: String, required: true },
    descriptionHindi: { type: String },
    image: { type: String, required: true },
    location: { type: String, required: true },
    locationHindi: { type: String },
    activeContentTypes: { type: [String], default: [] },
    videos: { type: Map, of: Object, default: {} }
}, { timestamps: true });

const TempleModel = models.Temple || mongoose.model('Temple', TempleSchema);
export default TempleModel;
