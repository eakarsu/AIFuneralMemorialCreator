// Family tree + biography auto-completion pulling census, immigration,
// military public records (LLM-knowledge-based stub, ready for archive API
// integration).
// Audit: batch_04.md / AIFuneralMemorialCreator / Custom Feature Suggestions #4
// TODO: configure credentials FAMILYSEARCH_API_KEY, ANCESTRY_API_KEY
const router = require('express').Router();
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const pool = require('../db');

router.use(auth);

const callOpenRouter = async (prompt, systemPrompt) => {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Title': 'AI Funeral Memorial - Family Tree Auto-Complete'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 3000
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'AI failed');
  return data.choices[0].message.content;
};

function parseJSON(text) {
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {}
  return { notes: text };
}

// POST /api/family-tree/suggest
// Body: { decedent_name, birth_year?, death_year?, birthplace?, known_relatives?, immigration_year? }
router.post('/suggest', async (req, res) => {
  try {
    const {
      decedent_name, birth_year, death_year, birthplace,
      known_relatives = [], immigration_year, military_service
    } = req.body || {};
    if (!decedent_name) return res.status(400).json({ error: 'decedent_name required' });

    const credsStatus = {
      familysearch: !!process.env.FAMILYSEARCH_API_KEY,
      ancestry: !!process.env.ANCESTRY_API_KEY
    };

    const systemPrompt = `You are a genealogy assistant for memorial biographers. Given a decedent's basic info,
suggest plausible biographical context (census references, immigration records, military records, likely
relatives). Be cautious: clearly mark each item as 'unconfirmed' until verified. Return STRICT JSON only.`;

    const userPrompt = `Decedent: ${decedent_name}
Birth year: ${birth_year || 'unknown'}
Death year: ${death_year || 'unknown'}
Birthplace: ${birthplace || 'unknown'}
Known relatives: ${JSON.stringify(known_relatives)}
Immigration year (if any): ${immigration_year || 'unknown'}
Military service: ${military_service || 'unknown'}
External archive credentials: ${JSON.stringify(credsStatus)}

Return JSON:
{
  "summary": "...",
  "suggested_records_to_search": [
    { "archive": "us_census|naturalization|military|ship_manifest|church|newspaper", "year_range": "string", "search_query_hint": "string", "expected_value": "string" }
  ],
  "biographical_paragraph_draft": "string (warm, 2-3 paragraphs, hedged language for unconfirmed facts)",
  "plausible_relatives": [{ "name_or_hint": "string", "relation": "string", "confidence": "low|medium|high", "notes": "string" }],
  "follow_up_questions_for_family": ["..."],
  "credentials_status": ${JSON.stringify(credsStatus)},
  "disclaimer": "All items unconfirmed; verify each before publishing in the memorial."
}`;

    const raw = await callOpenRouter(userPrompt, systemPrompt);
    const parsed = parseJSON(raw);

    try {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS family_tree_suggestions (
          id SERIAL PRIMARY KEY, user_id INTEGER, decedent_name TEXT,
          payload JSONB, created_at TIMESTAMPTZ DEFAULT NOW()
        )`
      );
      await pool.query(
        `INSERT INTO family_tree_suggestions (user_id, decedent_name, payload)
         VALUES ($1,$2,$3)`,
        [req.user.id || null, decedent_name, JSON.stringify(parsed)]
      );
    } catch (_) {}

    res.json({ decedent_name, credentials: credsStatus, suggestions: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/family-tree/history
router.get('/history', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, decedent_name, payload, created_at FROM family_tree_suggestions
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    ).catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
