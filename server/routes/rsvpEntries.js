const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rsvp_entries WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
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
