const mongoose = require('mongoose');

const GrahanSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    type: { type: String, enum: ['Solar', 'Lunar'], required: true }, // Surya or Chandra Grahan
    title: { type: String, required: true },
    description: String,
    startTime: String,
    endTime: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Grahan', GrahanSchema);
