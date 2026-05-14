const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/thank-you/pending — flowers + donations where thank_you_sent = false
router.get('/pending', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, deceased_name, sender_name AS contact_name, item_type AS detail, received_date AS date, 'flower' AS source_type
         FROM flower_gifts
         WHERE user_id = $1 AND thank_you_sent = false
       UNION ALL
       SELECT id, deceased_name, donor_name AS contact_name, organization AS detail, donation_date AS date, 'donation' AS source_type
         FROM memorial_donations
         WHERE user_id = $1 AND thank_you_sent = false
       ORDER BY date DESC`,
      [req.user.id]
    );
    res.json({ data: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/thank-you/:type/:id/mark-sent — mark thank_you_sent = true
router.post('/:type/:id/mark-sent', auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    if (type !== 'flower' && type !== 'donation') {
      return res.status(400).json({ error: 'type must be "flower" or "donation"' });
    }
    const table = type === 'flower' ? 'flower_gifts' : 'memorial_donations';
    const result = await pool.query(
      `UPDATE ${table} SET thank_you_sent = true WHERE id = $1 AND user_id = $2 RETURNING id, thank_you_sent`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ success: true, record: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
