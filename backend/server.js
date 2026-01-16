const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure Uploads Directory Exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Static File Serving (Crucial for Images/Videos)
app.use('/uploads', express.static(uploadDir));

// Database Connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://dipak:Dipak123@cluster0.pbgca.mongodb.net/daily-darshan?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
const templeRoutes = require('./routes/temples');
const uploadRoutes = require('./routes/upload');
const poonamRoutes = require('./routes/poonam');
const grahanRoutes = require('./routes/grahan');

app.use('/api/temples', templeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/poonam', poonamRoutes);
app.use('/api/grahan', grahanRoutes);


app.get('/', (req, res) => {
    res.send('Daily Darshan API is Running 🚀');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);

    // Log Network IP
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`📡 Network accessible at http://${net.address}:${PORT}`);
            }
        }
    }
});
