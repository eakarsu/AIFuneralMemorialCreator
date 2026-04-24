const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM venues WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM venues WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { deceased_name, name, address, phone, contact_person, venue_type, capacity, notes, booked, event_date } = req.body;
    const result = await pool.query(
      'INSERT INTO venues (user_id, deceased_name, name, address, phone, contact_person, venue_type, capacity, notes, booked, event_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [req.user.id, deceased_name, name, address, phone, contact_person, venue_type, capacity || null, notes, booked || false, event_date || null]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { deceased_name, name, address, phone, contact_person, venue_type, capacity, notes, booked, event_date } = req.body;
    const result = await pool.query(
      'UPDATE venues SET deceased_name=$1, name=$2, address=$3, phone=$4, contact_person=$5, venue_type=$6, capacity=$7, notes=$8, booked=$9, event_date=$10, updated_at=NOW() WHERE id=$11 AND user_id=$12 RETURNING *',
      [deceased_name, name, address, phone, contact_person, venue_type, capacity || null, notes, booked || false, event_date || null, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM venues WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
