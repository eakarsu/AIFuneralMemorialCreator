require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { aiRateLimiter } = require('./middleware/rateLimiter');

// === Batch 04 Gaps & Frontend Mounts ===
const route_gap_no_legacy_interview_guide_endpoint_quest = require('./routes/gap-no-legacy-interview-guide-endpoint-quest');
const route_gap_no_timeline_narrative_synthesis_weave_li = require('./routes/gap-no-timeline-narrative-synthesis-weave-li');
const route_gap_no_donations_matching_causes_by_deceased = require('./routes/gap-no-donations-matching-causes-by-deceased');
const route_gap_no_grief_stage_classifier_exposed_to = require('./routes/gap-no-grief-stage-classifier-exposed-to');
const route_gap_no_webhook_receivers_for_online_tribute = require('./routes/gap-no-webhook-receivers-for-online-tribute');
const route_gap_no_real_time_chat_between_family = require('./routes/gap-no-real-time-chat-between-family');
const route_gap_no_smsemail_send_infrastructure_notifica = require('./routes/gap-no-smsemail-send-infrastructure-notifica');
const route_gap_no_payment_processing_for_donations_or = require('./routes/gap-no-payment-processing-for-donations-or');
const route_gap_no_multi_tenant_funeral_home_onboarding = require('./routes/gap-no-multi-tenant-funeral-home-onboarding');
const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

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


app.use('/api/gap-no-legacy-interview-guide-endpoint-quest', route_gap_no_legacy_interview_guide_endpoint_quest);
app.use('/api/gap-no-timeline-narrative-synthesis-weave-li', route_gap_no_timeline_narrative_synthesis_weave_li);
app.use('/api/gap-no-donations-matching-causes-by-deceased', route_gap_no_donations_matching_causes_by_deceased);
app.use('/api/gap-no-grief-stage-classifier-exposed-to', route_gap_no_grief_stage_classifier_exposed_to);
app.use('/api/gap-no-webhook-receivers-for-online-tribute', route_gap_no_webhook_receivers_for_online_tribute);
app.use('/api/gap-no-real-time-chat-between-family', route_gap_no_real_time_chat_between_family);
app.use('/api/gap-no-smsemail-send-infrastructure-notifica', route_gap_no_smsemail_send_infrastructure_notifica);
app.use('/api/gap-no-payment-processing-for-donations-or', route_gap_no_payment_processing_for_donations_or);
app.use('/api/gap-no-multi-tenant-funeral-home-onboarding', route_gap_no_multi_tenant_funeral_home_onboarding);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
