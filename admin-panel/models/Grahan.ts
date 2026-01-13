import mongoose, { Schema, models } from 'mongoose';

const GrahanSchema = new Schema({
    id: { type: String, required: true, unique: true },
    startDateTime: { type: String, required: true },
    endDateTime: { type: String, required: true },
    affectedPlaces: { type: String, required: true },
    affectedPlacesHindi: { type: String },
    description: { type: String, required: true },
    descriptionHindi: { type: String }
}, { timestamps: true });

const GrahanModel = models.Grahan || mongoose.model('Grahan', GrahanSchema);
export default GrahanModel;
