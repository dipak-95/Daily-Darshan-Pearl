const express = require('express');
const router = express.Router();
const Temple = require('../models/Temple');
const db = require('../lib/dbFallback');

const COLLECTION = 'temples';

// GET All
router.get('/', async (req, res) => {
    try {
        const rawData = await db.findAll(Temple, COLLECTION);

        // Filter logic: Only send today's darshan data
        const now = new Date();

        // 6 AM Logic: If before 6 AM, consider "today" as "yesterday" (until 6 AM new day starts)
        // Actually user wants "agle din sube 6 baje sab clear ho jaye"
        // Meaning: Data for Date D is valid from D 00:00 to D+1 06:00 ?
        // Or simply: Show data for CURRENT LOGICAL DATE.
        // Let's implement robust Date String logic matching the Frontend (YYYY-MM-DD).

        // If it is before 6 AM, we might arguably show yesterday's darshan?
        // User said: "16 tarikh me jo bhi upload kru vo 17 tarikh subhe 6 baje khali ho jana chahiye"
        // This means content for '2023-01-16' is valid until '2023-01-17 06:00:00'.

        // Current Time
        const currentHour = now.getHours();
        const todayDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

        // Calculate "Previous Date"
        const prevDateObj = new Date(now);
        prevDateObj.setDate(now.getDate() - 1);
        const prevDate = prevDateObj.toISOString().split('T')[0];

        const data = rawData.map(t => {
            const temple = t._doc ? t._doc : t; // Handle mongoose doc vs raw object

            // Clone to avoid mutating DB cache if any
            const tClone = { ...temple };

            // Logic:
            // We need to decide WHICH date key from 'videos' map to keep.
            // If internal map is just an object:
            if (tClone.videos) {
                const newVideos = {};

                // If it is 00:00 to 05:59 -> Show Yesterday's Data AND Today's Data (if any)?
                // Or just show content that hasn't "expired"?
                // User said: "subhe 6 baje khali ho jana chahiye".
                // So at 06:00 AM on 17th, the 16th data disappears.
                // This means 16th data is visible on 16th (All day) AND 17th (00:00-06:00).

                // So valid keys are:
                // 1. TODAY (Always valid)
                // 2. YESTERDAY (Valid ONLY if currentHour < 6)

                if (tClone.videos[todayDate]) {
                    newVideos[todayDate] = tClone.videos[todayDate];
                }

                if (currentHour < 6 && tClone.videos[prevDate]) {
                    newVideos[prevDate] = tClone.videos[prevDate];
                }

                tClone.videos = newVideos;
            }

            return tClone;
        });

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
