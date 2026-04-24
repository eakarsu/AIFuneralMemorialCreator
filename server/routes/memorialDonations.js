const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM memorial_donations WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM memorial_donations WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { deceased_name, donor_name, organization, amount, message, status, donation_date, thank_you_sent } = req.body;
    const result = await pool.query(
      'INSERT INTO memorial_donations (user_id, deceased_name, donor_name, organization, amount, message, status, donation_date, thank_you_sent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [req.user.id, deceased_name, donor_name, organization, amount, message, status || 'received', donation_date || new Date(), thank_you_sent || false]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { deceased_name, donor_name, organization, amount, message, status, donation_date, thank_you_sent } = req.body;
    const result = await pool.query(
      'UPDATE memorial_donations SET deceased_name=$1, donor_name=$2, organization=$3, amount=$4, message=$5, status=$6, donation_date=$7, thank_you_sent=$8 WHERE id=$9 AND user_id=$10 RETURNING *',
      [deceased_name, donor_name, organization, amount, message, status, donation_date, thank_you_sent, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM memorial_donations WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
