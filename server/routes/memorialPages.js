const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM memorial_pages WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM memorial_pages WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { deceased_name, birth_date, death_date, biography, photo_url, theme, is_public, status } = req.body;
    const result = await pool.query(
      'INSERT INTO memorial_pages (user_id, deceased_name, birth_date, death_date, biography, photo_url, theme, is_public, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [req.user.id, deceased_name, birth_date || null, death_date || null, biography, photo_url, theme || 'classic', is_public !== false, status || 'active']
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { deceased_name, birth_date, death_date, biography, photo_url, theme, is_public, status } = req.body;
    const result = await pool.query(
      'UPDATE memorial_pages SET deceased_name=$1, birth_date=$2, death_date=$3, biography=$4, photo_url=$5, theme=$6, is_public=$7, status=$8, updated_at=NOW() WHERE id=$9 AND user_id=$10 RETURNING *',
      [deceased_name, birth_date || null, death_date || null, biography, photo_url, theme, is_public, status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM memorial_pages WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
