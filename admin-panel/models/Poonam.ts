import mongoose, { Schema, models } from 'mongoose';

const PoonamSchema = new Schema({
    id: { type: String, required: true, unique: true },
    startDateTime: { type: String, required: true },
    endDateTime: { type: String, required: true },
    description: { type: String, required: true },
    descriptionHindi: { type: String }
}, { timestamps: true });

const PoonamModel = models.Poonam || mongoose.model('Poonam', PoonamSchema);
export default PoonamModel;
