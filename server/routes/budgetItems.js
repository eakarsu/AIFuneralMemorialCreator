const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM budget_items WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM budget_items WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { deceased_name, category, description, estimated_cost, actual_cost, vendor, paid, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO budget_items (user_id, deceased_name, category, description, estimated_cost, actual_cost, vendor, paid, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [req.user.id, deceased_name, category, description, estimated_cost || null, actual_cost || null, vendor, paid || false, notes]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { deceased_name, category, description, estimated_cost, actual_cost, vendor, paid, notes } = req.body;
    const result = await pool.query(
      'UPDATE budget_items SET deceased_name=$1, category=$2, description=$3, estimated_cost=$4, actual_cost=$5, vendor=$6, paid=$7, notes=$8, updated_at=NOW() WHERE id=$9 AND user_id=$10 RETURNING *',
      [deceased_name, category, description, estimated_cost || null, actual_cost || null, vendor, paid || false, notes, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM budget_items WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
