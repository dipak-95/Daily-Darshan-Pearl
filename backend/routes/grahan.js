const express = require('express');
const router = express.Router();
const Grahan = require('../models/Grahan');
const db = require('../lib/dbFallback');

const COLLECTION = 'grahan';

router.get('/', async (req, res) => {
    try {
        const data = await db.findAll(Grahan, COLLECTION);
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
    try {
        const saved = await db.create(Grahan, COLLECTION, req.body);
        res.json(saved);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.delete(Grahan, COLLECTION, req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
