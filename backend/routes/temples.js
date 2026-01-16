const express = require('express');
const router = express.Router();
const Temple = require('../models/Temple');
const db = require('../lib/dbFallback');

const COLLECTION = 'temples';

// GET All
router.get('/', async (req, res) => {
    try {
        const data = await db.findAll(Temple, COLLECTION);
        res.json(data);
    } catch (err) {
        console.error("GET Error:", err);
        res.json([]);
    }
});

// GET Single
router.get('/:id', async (req, res) => {
    try {
        // Fallback logic for single find is structurally similar to update but readonly
        // For simplicity, we just fetch all and find one in offline mode
        const all = await db.findAll(Temple, COLLECTION);
        const one = all.find(i => i._id.toString() === req.params.id);
        if (one) res.json(one);
        else res.status(404).json({ error: 'Not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE
router.post('/', async (req, res) => {
    try {
        const saved = await db.create(Temple, COLLECTION, req.body);
        res.status(201).json(saved);
    } catch (err) {
        console.error("CREATE Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const updated = await db.update(Temple, COLLECTION, req.params.id, req.body);
        res.json(updated);
    } catch (err) {
        console.error("UPDATE Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await db.delete(Temple, COLLECTION, req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error("DELETE Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
