const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estate_items WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estate_items WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { deceased_name, item_type, title, description, status, due_date, assigned_to, priority, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO estate_items (user_id, deceased_name, item_type, title, description, status, due_date, assigned_to, priority, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [req.user.id, deceased_name, item_type, title, description, status || 'pending', due_date || null, assigned_to, priority || 'medium', notes]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { deceased_name, item_type, title, description, status, due_date, assigned_to, priority, notes } = req.body;
    const result = await pool.query(
      'UPDATE estate_items SET deceased_name=$1, item_type=$2, title=$3, description=$4, status=$5, due_date=$6, assigned_to=$7, priority=$8, notes=$9, updated_at=NOW() WHERE id=$10 AND user_id=$11 RETURNING *',
      [deceased_name, item_type, title, description, status, due_date || null, assigned_to, priority, notes, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM estate_items WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
