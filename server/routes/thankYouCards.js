const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM thank_you_cards WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM thank_you_cards WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { recipient_name, deceased_name, relationship, gift_or_gesture, message, ai_generated, sent } = req.body;
    const result = await pool.query(
      'INSERT INTO thank_you_cards (user_id, recipient_name, deceased_name, relationship, gift_or_gesture, message, ai_generated, sent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [req.user.id, recipient_name, deceased_name, relationship, gift_or_gesture, message, ai_generated || false, sent || false]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { recipient_name, deceased_name, relationship, gift_or_gesture, message, sent } = req.body;
    const result = await pool.query(
      'UPDATE thank_you_cards SET recipient_name=$1, deceased_name=$2, relationship=$3, gift_or_gesture=$4, message=$5, sent=$6 WHERE id=$7 AND user_id=$8 RETURNING *',
      [recipient_name, deceased_name, relationship, gift_or_gesture, message, sent, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM thank_you_cards WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
