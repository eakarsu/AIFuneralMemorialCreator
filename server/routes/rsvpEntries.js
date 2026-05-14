const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM rsvp_entries WHERE user_id = $1', [req.user.id]);
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM rsvp_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [req.user.id, limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rsvp_entries WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { deceased_name, service_name, guest_name, email, phone, rsvp_status, guests_count, dietary_needs, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO rsvp_entries (user_id, deceased_name, service_name, guest_name, email, phone, rsvp_status, guests_count, dietary_needs, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [req.user.id, deceased_name, service_name, guest_name, email, phone, rsvp_status, guests_count || 1, dietary_needs, notes]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { deceased_name, service_name, guest_name, email, phone, rsvp_status, guests_count, dietary_needs, notes } = req.body;
    const result = await pool.query(
      'UPDATE rsvp_entries SET deceased_name=$1, service_name=$2, guest_name=$3, email=$4, phone=$5, rsvp_status=$6, guests_count=$7, dietary_needs=$8, notes=$9, updated_at=NOW() WHERE id=$10 AND user_id=$11 RETURNING *',
      [deceased_name, service_name, guest_name, email, phone, rsvp_status, guests_count || 1, dietary_needs, notes, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM rsvp_entries WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
