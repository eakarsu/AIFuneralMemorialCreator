const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM music_selections WHERE user_id = $1', [req.user.id]);
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM music_selections WHERE user_id = $1 ORDER BY order_number ASC, created_at DESC LIMIT $2 OFFSET $3', [req.user.id, limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM music_selections WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { deceased_name, song_title, artist, service_moment, notes, order_number } = req.body;
    const result = await pool.query(
      'INSERT INTO music_selections (user_id, deceased_name, song_title, artist, service_moment, notes, order_number) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [req.user.id, deceased_name, song_title, artist, service_moment, notes, order_number]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { deceased_name, song_title, artist, service_moment, notes, order_number } = req.body;
    const result = await pool.query(
      'UPDATE music_selections SET deceased_name=$1, song_title=$2, artist=$3, service_moment=$4, notes=$5, order_number=$6 WHERE id=$7 AND user_id=$8 RETURNING *',
      [deceased_name, song_title, artist, service_moment, notes, order_number, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM music_selections WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
