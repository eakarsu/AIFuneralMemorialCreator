/*
 * routes/vendorDirectory.js — Vendor / service-provider directory.
 *
 * Pass 5 addition: addresses audit gap "No vendor/service provider directory
 * (florists, caterers, musicians)". Pure CRUD over a new additive table; uses
 * CREATE TABLE IF NOT EXISTS so existing schema is untouched. Mirrors the
 * style of existing CRUD routes (contacts.js, venues.js).
 */

const router = require('express').Router();
const auth = require('../middleware/auth');
const pool = require('../db');

const ALLOWED_CATEGORIES = [
  'florist', 'caterer', 'musician', 'celebrant', 'photographer',
  'videographer', 'transportation', 'casket_supplier', 'urn_supplier',
  'monument', 'reception_venue', 'cleaner', 'other',
];

let _ensured = false;
async function ensureTable() {
  if (_ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vendor_directory (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      contact_name TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      address TEXT,
      city TEXT,
      service_area TEXT,
      price_tier TEXT,
      rating NUMERIC(3,1),
      notes TEXT,
      is_preferred BOOLEAN DEFAULT FALSE,
      last_used_at DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  _ensured = true;
}

router.use(async (req, res, next) => {
  try { await ensureTable(); next(); } catch (err) {
    res.status(500).json({ error: 'Vendor directory unavailable: ' + err.message });
  }
});

// List vendors (optional filters: category, is_preferred, search)
router.get('/', auth, async (req, res) => {
  try {
    const { category, is_preferred, search } = req.query;
    const clauses = ['user_id = $1'];
    const params = [req.user.id];
    if (category) { params.push(category); clauses.push(`category = $${params.length}`); }
    if (is_preferred !== undefined) { params.push(is_preferred === 'true'); clauses.push(`is_preferred = $${params.length}`); }
    if (search) { params.push(`%${search}%`); clauses.push(`(name ILIKE $${params.length} OR notes ILIKE $${params.length})`); }
    const r = await pool.query(
      `SELECT * FROM vendor_directory WHERE ${clauses.join(' AND ')} ORDER BY is_preferred DESC, name ASC`,
      params
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/categories', auth, (req, res) => {
  res.json({ categories: ALLOWED_CATEGORIES });
});

router.get('/:id', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM vendor_directory WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'name and category are required' });
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of ${ALLOWED_CATEGORIES.join(', ')}` });
    }
    const cols = ['user_id','name','category','contact_name','phone','email','website','address','city','service_area','price_tier','rating','notes','is_preferred','last_used_at'];
    const vals = [req.user.id, name, category,
      req.body.contact_name || null, req.body.phone || null, req.body.email || null,
      req.body.website || null, req.body.address || null, req.body.city || null,
      req.body.service_area || null, req.body.price_tier || null,
      req.body.rating ?? null, req.body.notes || null,
      !!req.body.is_preferred, req.body.last_used_at || null,
    ];
    const placeholders = vals.map((_, i) => `$${i+1}`).join(',');
    const r = await pool.query(
      `INSERT INTO vendor_directory (${cols.join(',')}) VALUES (${placeholders}) RETURNING *`,
      vals
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const fields = ['name','category','contact_name','phone','email','website','address','city','service_area','price_tier','rating','notes','is_preferred','last_used_at'];
    const sets = [];
    const params = [];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        params.push(req.body[f]);
        sets.push(`${f} = $${params.length}`);
      }
    });
    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });
    sets.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id, req.user.id);
    const r = await pool.query(
      `UPDATE vendor_directory SET ${sets.join(', ')} WHERE id=$${params.length-1} AND user_id=$${params.length} RETURNING *`,
      params
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM vendor_directory WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
