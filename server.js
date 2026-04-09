'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Hypixel API key
const HYPIXEL_API_KEY = process.env.HYPIXEL_API_KEY;

if (!HYPIXEL_API_KEY) {
    console.error('Error: HYPIXEL_API_KEY is not set in environment variables.');
    process.exit(1);
}

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const statsRouter = require('./src/routes/stats');
const guildRouter = require('./src/routes/guild');

app.use('/api/stats', statsRouter);
app.use('/api/guild', guildRouter);

app.listen(PORT, () => {
    console.log(`Сервер запущен! link: http://localhost:${PORT}`);
});