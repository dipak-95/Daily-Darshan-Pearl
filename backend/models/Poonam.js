const mongoose = require('mongoose');

const PoonamSchema = new mongoose.Schema({
    date: { type: Date, required: true }, // The actual date of Poonam
    title: { type: String, required: true }, // e.g. "Sharad Purnima"
    description: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Poonam', PoonamSchema);
