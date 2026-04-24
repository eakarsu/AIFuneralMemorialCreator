const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM travel_accommodations WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM travel_accommodations WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { deceased_name, guest_name, arrival_date, departure_date, accommodation_name, accommodation_address, transport_notes, status, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO travel_accommodations (user_id, deceased_name, guest_name, arrival_date, departure_date, accommodation_name, accommodation_address, transport_notes, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [req.user.id, deceased_name, guest_name, arrival_date || null, departure_date || null, accommodation_name, accommodation_address, transport_notes, status, notes]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { deceased_name, guest_name, arrival_date, departure_date, accommodation_name, accommodation_address, transport_notes, status, notes } = req.body;
    const result = await pool.query(
      'UPDATE travel_accommodations SET deceased_name=$1, guest_name=$2, arrival_date=$3, departure_date=$4, accommodation_name=$5, accommodation_address=$6, transport_notes=$7, status=$8, notes=$9, updated_at=NOW() WHERE id=$10 AND user_id=$11 RETURNING *',
      [deceased_name, guest_name, arrival_date || null, departure_date || null, accommodation_name, accommodation_address, transport_notes, status, notes, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM travel_accommodations WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
