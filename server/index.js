require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
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
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
