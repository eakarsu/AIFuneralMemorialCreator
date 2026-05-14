// Legacy letter platform with posthumous milestone-triggered message delivery.
// Audit: batch_04.md / AIFuneralMemorialCreator / Custom Feature Suggestions #2
const router = require('express').Router();
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const pool = require('../db');

const callOpenRouter = async (prompt, systemPrompt) => {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Title': 'AI Funeral Memorial - Legacy Letters'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
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

router.use(auth);

// POST /api/legacy-letters/draft
// Body: { recipient_name, recipient_relationship, milestone, tone?, life_themes?, memorial_id? }
router.post('/draft', async (req, res) => {
  try {
    const {
      recipient_name, recipient_relationship,
      milestone, // 'graduation', 'wedding', '18th_birthday', 'first_child', etc.
      tone = 'warm and reassuring',
      life_themes = [],
      memorial_id
    } = req.body || {};

    if (!recipient_name || !milestone) {
      return res.status(400).json({ error: 'recipient_name and milestone are required' });
    }

    const systemPrompt = `You are a compassionate ghostwriter helping someone draft a letter that will be
delivered to a loved one at a future milestone (after the writer is gone). The voice is the writer's, not
yours. Honor specified life themes and tone. Return STRICT JSON only.`;

    const userPrompt = `Recipient: ${recipient_name} (relationship: ${recipient_relationship || 'loved one'})
Milestone trigger: ${milestone}
Tone: ${tone}
Life themes to weave in: ${JSON.stringify(life_themes)}

Return JSON:
{
  "subject_line": "string",
  "letter_body": "string (3-6 paragraphs, first-person, warm)",
  "delivery_recommendation": { "channel": "email|printed_letter|video_message", "timing_note": "string" },
  "alternate_versions": [{ "tone": "string", "letter_body": "string" }],
  "editorial_notes": ["..."]
}`;

    const raw = await callOpenRouter(userPrompt, systemPrompt);
    const parsed = parseJSON(raw);

    try {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS legacy_letters (
          id SERIAL PRIMARY KEY, user_id INTEGER, memorial_id INTEGER,
          recipient_name TEXT, milestone TEXT, draft JSONB, status TEXT DEFAULT 'draft',
          scheduled_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
        )`
      );
      await pool.query(
        `INSERT INTO legacy_letters (user_id, memorial_id, recipient_name, milestone, draft)
         VALUES ($1,$2,$3,$4,$5)`,
        [req.user.id || null, memorial_id || null, recipient_name, milestone, JSON.stringify(parsed)]
      );
    } catch (_) {}

    res.json({ recipient_name, milestone, draft: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/legacy-letters
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, recipient_name, milestone, status, scheduled_at, created_at
       FROM legacy_letters WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [req.user.id]
    ).catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/legacy-letters/:id/schedule { scheduled_at }
router.patch('/:id/schedule', async (req, res) => {
  try {
    const { scheduled_at } = req.body || {};
    await pool.query(
      `UPDATE legacy_letters SET scheduled_at = $1, status = 'scheduled'
       WHERE id = $2 AND user_id = $3`,
      [scheduled_at, req.params.id, req.user.id]
    ).catch(() => {});
    res.json({ id: req.params.id, status: 'scheduled', scheduled_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
