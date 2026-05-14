const router = require('express').Router();
const pool = require('../db');

// Ensure slug column exists on startup
pool.query(`ALTER TABLE memorial_pages ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE`).catch(() => {});

// GET /memorial/:slug — public memorial page view
router.get('/memorial/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const pageResult = await pool.query(
      'SELECT * FROM memorial_pages WHERE slug = $1 AND is_public = true',
      [slug]
    );
    if (pageResult.rows.length === 0) return res.status(404).json({ error: 'Memorial page not found or is private' });

    const page = pageResult.rows[0];
    const deceasedName = page.deceased_name;

    const [timelineResult, photosResult, guestBookResult] = await Promise.all([
      pool.query('SELECT * FROM timeline_events WHERE deceased_name = $1 AND user_id = $2 ORDER BY event_date ASC', [deceasedName, page.user_id]),
      pool.query('SELECT * FROM photo_gallery WHERE deceased_name = $1 AND user_id = $2 ORDER BY upload_date DESC', [deceasedName, page.user_id]),
      pool.query('SELECT id, visitor_name, message, created_at FROM guest_book_entries WHERE deceased_name = $1 AND user_id = $2 AND is_approved = true ORDER BY created_at DESC', [deceasedName, page.user_id]),
    ]);

    res.json({
      memorial_page: page,
      timeline_events: timelineResult.rows,
      photo_gallery: photosResult.rows,
      guest_book_entries: guestBookResult.rows,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /memorial/:slug/guestbook — unauthenticated guest book submission
router.post('/memorial/:slug/guestbook', async (req, res) => {
  try {
    const { slug } = req.params;
    const { visitor_name, visitor_email, message } = req.body;

    if (!visitor_name) return res.status(400).json({ error: 'visitor_name is required' });
    if (!message) return res.status(400).json({ error: 'message is required' });

    const pageResult = await pool.query(
      'SELECT id, user_id, deceased_name FROM memorial_pages WHERE slug = $1 AND is_public = true',
      [slug]
    );
    if (pageResult.rows.length === 0) return res.status(404).json({ error: 'Memorial page not found or is private' });

    const page = pageResult.rows[0];
    const result = await pool.query(
      'INSERT INTO guest_book_entries (user_id, deceased_name, visitor_name, visitor_email, message, is_approved) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, visitor_name, message, created_at',
      [page.user_id, page.deceased_name, visitor_name, visitor_email || null, message, false]
    );

    res.status(201).json({ entry: result.rows[0], message: 'Your message has been submitted and is awaiting approval.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
