const express = require('express');
const router = express.Router();
const Poonam = require('../models/Poonam');
const db = require('../lib/dbFallback');

const COLLECTION = 'poonam';

router.get('/', async (req, res) => {
    try {
        const data = await db.findAll(Poonam, COLLECTION);
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
    try {
        const saved = await db.create(Poonam, COLLECTION, req.body);
        res.json(saved);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.delete(Poonam, COLLECTION, req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
