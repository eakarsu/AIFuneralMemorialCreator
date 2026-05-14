const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM obituaries WHERE user_id = $1', [req.user.id]);
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM obituaries WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [req.user.id, limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM obituaries WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { deceased_name, birth_date, death_date, city, content, ai_generated, status } = req.body;
    const result = await pool.query(
      'INSERT INTO obituaries (user_id, deceased_name, birth_date, death_date, city, content, ai_generated, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [req.user.id, deceased_name, birth_date || null, death_date || null, city, content, ai_generated || false, status || 'draft']
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { deceased_name, birth_date, death_date, city, content, status } = req.body;
    const result = await pool.query(
      'UPDATE obituaries SET deceased_name=$1, birth_date=$2, death_date=$3, city=$4, content=$5, status=$6, updated_at=NOW() WHERE id=$7 AND user_id=$8 RETURNING *',
      [deceased_name, birth_date || null, death_date || null, city, content, status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM obituaries WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
