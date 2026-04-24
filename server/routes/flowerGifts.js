const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM flower_gifts WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM flower_gifts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { deceased_name, sender_name, item_type, description, received_date, thank_you_sent, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO flower_gifts (user_id, deceased_name, sender_name, item_type, description, received_date, thank_you_sent, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [req.user.id, deceased_name, sender_name, item_type, description, received_date || null, thank_you_sent || false, notes]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { deceased_name, sender_name, item_type, description, received_date, thank_you_sent, notes } = req.body;
    const result = await pool.query(
      'UPDATE flower_gifts SET deceased_name=$1, sender_name=$2, item_type=$3, description=$4, received_date=$5, thank_you_sent=$6, notes=$7 WHERE id=$8 AND user_id=$9 RETURNING *',
      [deceased_name, sender_name, item_type, description, received_date || null, thank_you_sent || false, notes, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM flower_gifts WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
