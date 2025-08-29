const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY;

// --- File Paths ---
const PINS_FILE = path.join(__dirname, 'pins.csv');
const REG_FILE = path.join(__dirname, 'registrations.csv');

// --- Constants ---
const MAX_PINS_PER_PHONE = 5;
const REQUEST_DELAY_MS = 3000; // 3 seconds

// --- Middleware ---
// To parse JSON bodies from POST requests
app.use(express.json());
// To serve static files (HTML, CSS, client-side JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- In-memory cache to prevent spam ---
const requestCache = new Map();

function isRequestSpam(key) {
    const lastRequestTime = requestCache.get(key);
    if (lastRequestTime && (Date.now() - lastRequestTime < REQUEST_DELAY_MS)) {
        return true;
    }
    requestCache.set(key, Date.now());
    return false;
}

// --- API Endpoints ---

// [POST] /api/generate-pin
app.post('/api/generate-pin', (req, res) => {
    if (isRequestSpam('generate-pin')) {
        return res.status(429).json({ success: false, message: 'Please wait before generating another PIN.' });
    }

    const { phone, adminKey } = req.body;

    if (!ADMIN_KEY) {
        console.error("CRITICAL: ADMIN_KEY is not set on the server.");
        return res.status(500).json({ success: false, message: 'Server configuration error: Admin key not set.' });
    }
    if (adminKey !== ADMIN_KEY) {
        return res.status(403).json({ success: false, message: 'Invalid Admin Key.' });
    }

    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!phone || !phoneRegex.test(phone.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format.' });
    }

    const trimmedPhone = phone.trim();

    try {
        const pinsData = fs.readFileSync(PINS_FILE, 'utf8');
        const phoneCount = pinsData.split('\n').filter(row => row.startsWith(trimmedPhone + ',')).length;

        if (phoneCount >= MAX_PINS_PER_PHONE) {
            return res.status(400).json({ success: false, message: `Max of ${MAX_PINS_PER_PHONE} PINs reached for this phone.` });
        }

        const pin = `SUDYW-${uuidv4().substring(0, 13)}`; // Shorter UUID
        const newPinRecord = `${trimmedPhone},${pin},${new Date().toISOString()},No\n`;
        fs.appendFileSync(PINS_FILE, newPinRecord);

        res.json({ success: true, pin: pin });

    } catch (err) {
        console.error("Error in /api/generate-pin:", err);
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
});

// [POST] /api/register
app.post('/api/register', (req, res) => {
    if (isRequestSpam('register')) {
        return res.status(429).json({ success: false, message: 'Please wait before submitting again.' });
    }

    const data = req.body;
    const required = ["name", "phone", "pin", "gender", "address", "zone", "branch", "status"];
    for (const field of required) {
        if (!data[field] || !data[field].trim()) {
            return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
        }
    }

    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!phoneRegex.test(data.phone.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format.' });
    }

    const trimmedPhone = data.phone.trim();

    try {
        const pinsData = fs.readFileSync(PINS_FILE, 'utf8').split('\n');
        const regData = fs.readFileSync(REG_FILE, 'utf8');

        if (regData.includes(',' + trimmedPhone + ',')) {
            return res.status(400).json({ success: false, message: 'Phone number already registered.' });
        }

        let pinRowIndex = -1;
        for (let i = 1; i < pinsData.length; i++) {
            const row = pinsData[i];
            const cols = row.split(',');
            // cols[1] is pin, cols[3] is isUsed
            if (cols[1] === data.pin && cols[3] === 'No') {
                pinRowIndex = i;
                break;
            }
        }

        if (pinRowIndex === -1) {
            return res.status(400).json({ success: false, message: 'PIN invalid or already used.' });
        }

        // Mark PIN as used
        const pinCols = pinsData[pinRowIndex].split(',');
        pinCols[3] = 'Yes';
        pinsData[pinRowIndex] = pinCols.join(',');
        fs.writeFileSync(PINS_FILE, pinsData.join('\n'));

        // Append new registration
        // Sanitize data to remove commas to not break CSV format
        const sanitizedData = Object.values(data).map(val => `"${val.replace(/"/g, '""')}"`).join(',');
        const newRegRecord = `${data.name},${trimmedPhone},${data.pin},${data.gender},${data.address},${data.zone},${data.branch},${data.status},${data.email || ''},${new Date().toISOString()}\n`;
        fs.appendFileSync(REG_FILE, newRegRecord);

        res.json({ success: true, message: 'Registration successful!' });

    } catch (err) {
        console.error("Error in /api/register:", err);
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
});

// --- Serve Frontend ---
// The express.static middleware above handles serving all our frontend files.
// We keep the root route to explicitly serve index.html for the base URL.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    if (!ADMIN_KEY) {
        console.warn('WARNING: ADMIN_KEY environment variable is not set. PIN generation will fail.');
    }
});
