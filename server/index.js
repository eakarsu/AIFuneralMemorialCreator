require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { aiRateLimiter } = require('./middleware/rateLimiter');
const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters');

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map((value) => value.trim()).filter(Boolean);
app.use(cors({ origin: (origin, callback) => !origin || allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error('CORS not allowed')), credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Public routes (no auth required)
app.use('/', require('./routes/public'));

// Authenticated Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/obituaries', require('./routes/obituaries'));
app.use('/api/eulogies', require('./routes/eulogies'));
app.use('/api/memorial-pages', require('./routes/memorialPages'));
app.use('/api/estate-items', require('./routes/estateItems'));
app.use('/api/grief-support', require('./routes/griefSupport'));
app.use('/api/funeral-programs', require('./routes/funeralPrograms'));
app.use('/api/thank-you-cards', require('./routes/thankYouCards'));
app.use('/api/condolence-letters', require('./routes/condolenceLetters'));
app.use('/api/prayers-readings', require('./routes/prayersReadings'));
app.use('/api/memorial-donations', require('./routes/memorialDonations'));
app.use('/api/photo-gallery', require('./routes/photoGallery'));
app.use('/api/guest-book', require('./routes/guestBook'));
app.use('/api/service-checklists', require('./routes/serviceChecklists'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/timeline-events', require('./routes/timelineEvents'));
app.use('/api/budget-items', require('./routes/budgetItems'));
app.use('/api/venues', require('./routes/venues'));
app.use('/api/music-selections', require('./routes/musicSelections'));
app.use('/api/rsvp-entries', require('./routes/rsvpEntries'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/flower-gifts', require('./routes/flowerGifts'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/travel-accommodations', require('./routes/travelAccommodations'));
app.use('/api/memorial-videos', require('./routes/memorialVideos'));

// Thank-you tracker
app.use('/api/thank-you', require('./routes/thankYouTracker'));

// Apply pass 5 — additive new routes (vendor directory + probate checklist)
app.use('/api/vendor-directory', require('./routes/vendorDirectory'));
app.use('/api/probate', require('./routes/probate'));

// AI routes — rate limited
app.use('/api/ai', aiRateLimiter, require('./routes/ai'));
app.use('/api/legacy-letters', aiRateLimiter, require('./routes/legacyLetterPlatform'));
app.use('/api/family-tree', aiRateLimiter, require('./routes/familyTreeAutoComplete'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/governed-memorials', require('./routes/governedMemorials'));

app.use((error, req, res, next) => {
  console.error('[request error]', error.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
