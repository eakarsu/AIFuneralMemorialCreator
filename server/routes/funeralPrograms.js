const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM funeral_programs WHERE user_id = $1', [req.user.id]);
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM funeral_programs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [req.user.id, limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM funeral_programs WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { deceased_name, service_date, service_type, venue, officiant, program_content, music_selections, template, status } = req.body;
    const result = await pool.query(
      'INSERT INTO funeral_programs (user_id, deceased_name, service_date, service_type, venue, officiant, program_content, music_selections, template, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [req.user.id, deceased_name, service_date || null, service_type || 'traditional', venue, officiant, program_content, music_selections, template || 'classic', status || 'draft']
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { deceased_name, service_date, service_type, venue, officiant, program_content, music_selections, template, status } = req.body;
    const result = await pool.query(
      'UPDATE funeral_programs SET deceased_name=$1, service_date=$2, service_type=$3, venue=$4, officiant=$5, program_content=$6, music_selections=$7, template=$8, status=$9, updated_at=NOW() WHERE id=$10 AND user_id=$11 RETURNING *',
      [deceased_name, service_date || null, service_type, venue, officiant, program_content, music_selections, template, status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM funeral_programs WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
