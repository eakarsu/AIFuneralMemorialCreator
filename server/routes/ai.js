const router = require('express').Router();
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const pool = require('../db');

const callOpenRouter = async (prompt, systemPrompt) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Funeral Memorial Creator',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.choices[0].message.content;
};

// Generate Obituary — auto-persists result
router.post('/generate-obituary', auth, async (req, res) => {
  try {
    const { deceased_name, birth_date, death_date, city, details } = req.body;
    if (!deceased_name) return res.status(400).json({ error: 'deceased_name is required' });
    const prompt = `Write a heartfelt and dignified obituary for ${deceased_name}, born ${birth_date || 'date unknown'}, who passed away ${death_date || 'recently'} in ${city || 'their hometown'}. Additional details: ${details || 'A beloved family member and friend.'}`;
    const systemPrompt = 'You are a compassionate obituary writer with decades of experience crafting dignified, heartfelt obituaries. Write in a warm, respectful tone that honors the deceased while providing comfort to the bereaved. Include appropriate structure with life highlights, surviving family, and service information placeholders.';
    const content = await callOpenRouter(prompt, systemPrompt);
    const saved = await pool.query(
      'INSERT INTO obituaries (user_id, deceased_name, birth_date, death_date, city, content, ai_generated, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
      [req.user.id, deceased_name, birth_date || null, death_date || null, city || null, content, true, 'draft']
    );
    res.json({ id: saved.rows[0].id, content, type: 'obituary' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Eulogy — auto-persists result
router.post('/generate-eulogy', auth, async (req, res) => {
  try {
    const { deceased_name, relationship, tone, key_memories } = req.body;
    if (!deceased_name) return res.status(400).json({ error: 'deceased_name is required' });
    const prompt = `Write a ${tone || 'warm and heartfelt'} eulogy for ${deceased_name}. The speaker's relationship: ${relationship || 'close friend'}. Key memories to include: ${key_memories || 'Their kindness, humor, and love for family.'}`;
    const systemPrompt = 'You are an experienced eulogy writer who helps bereaved individuals honor their loved ones. Write eulogies that balance grief with celebration of life, include personal anecdotes, and provide comfort. The tone should be appropriate for a funeral or memorial service.';
    const content = await callOpenRouter(prompt, systemPrompt);
    const saved = await pool.query(
      'INSERT INTO eulogies (user_id, deceased_name, relationship, tone, key_memories, content, ai_generated, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
      [req.user.id, deceased_name, relationship || null, tone || null, key_memories || null, content, true, 'draft']
    );
    res.json({ id: saved.rows[0].id, content, type: 'eulogy' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Memorial Page Bio
router.post('/generate-memorial-bio', auth, async (req, res) => {
  try {
    const { deceased_name, birth_date, death_date, details } = req.body;
    if (!deceased_name) return res.status(400).json({ error: 'deceased_name is required' });
    const prompt = `Write a beautiful memorial biography for ${deceased_name} (${birth_date || ''} - ${death_date || ''}). Details: ${details || 'A wonderful person who touched many lives.'}`;
    const systemPrompt = 'You are a memorial page writer specializing in creating beautiful, lasting digital tributes. Write biographies that capture the essence of a person\'s life, their achievements, personality, and the impact they had on others. Use warm, celebratory language.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'memorial_bio' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Estate Checklist
router.post('/generate-estate-checklist', auth, async (req, res) => {
  try {
    const { deceased_name, details } = req.body;
    if (!deceased_name) return res.status(400).json({ error: 'deceased_name is required' });
    const prompt = `Create a comprehensive estate coordination checklist for managing the affairs of ${deceased_name}. Context: ${details || 'Standard estate with typical assets and documents to manage.'}`;
    const systemPrompt = 'You are an estate planning expert helping families coordinate after a loss. Provide practical, organized checklists covering legal documents, financial accounts, property, insurance, digital assets, and important contacts. Be thorough but compassionate.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'estate_checklist' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Grief Support Message
router.post('/generate-grief-support', auth, async (req, res) => {
  try {
    const { topic, mood, message } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });
    const prompt = `The user is feeling ${mood || 'sad'} and wants to discuss: ${topic}. Their message: "${message || 'I am struggling with my grief.'}"`;
    const systemPrompt = 'You are a compassionate grief counselor with expertise in bereavement support. Provide warm, empathetic, and helpful responses. Validate feelings, offer coping strategies, and remind the person that grief is a natural process. Never minimize their pain. Suggest professional resources when appropriate.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'grief_support' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Funeral Program
router.post('/generate-funeral-program', auth, async (req, res) => {
  try {
    const { deceased_name, service_type, venue, officiant, details } = req.body;
    if (!deceased_name) return res.status(400).json({ error: 'deceased_name is required' });
    const prompt = `Create a ${service_type || 'traditional'} funeral program for ${deceased_name}. Venue: ${venue || 'To be determined'}. Officiant: ${officiant || 'To be determined'}. Details: ${details || ''}`;
    const systemPrompt = 'You are a funeral program designer with extensive experience in creating beautiful, respectful service programs. Include order of service, hymns/music suggestions, scripture readings, and proper formatting. Structure it clearly with times, participants, and activities.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'funeral_program' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Thank You Card — auto-persists result
router.post('/generate-thank-you', auth, async (req, res) => {
  try {
    const { recipient_name, deceased_name, gift_or_gesture, relationship } = req.body;
    if (!recipient_name) return res.status(400).json({ error: 'recipient_name is required' });
    const prompt = `Write a heartfelt thank you note to ${recipient_name} (${relationship || 'friend'}) for their ${gift_or_gesture || 'support and kindness'} following the passing of ${deceased_name || 'our loved one'}.`;
    const systemPrompt = 'You are an expert at writing sincere, heartfelt thank you notes for bereaved families. Keep messages warm, personal, and appropriately brief. Acknowledge the specific gesture or gift, express genuine gratitude, and maintain a tone of gracious appreciation.';
    const content = await callOpenRouter(prompt, systemPrompt);
    const saved = await pool.query(
      'INSERT INTO thank_you_cards (user_id, recipient_name, deceased_name, relationship, gift_or_gesture, message, ai_generated, sent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
      [req.user.id, recipient_name, deceased_name || null, relationship || null, gift_or_gesture || null, content, true, false]
    );
    res.json({ id: saved.rows[0].id, content, type: 'thank_you' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Condolence Letter — auto-persists result
router.post('/generate-condolence', auth, async (req, res) => {
  try {
    const { recipient_name, deceased_name, relationship, tone } = req.body;
    if (!recipient_name) return res.status(400).json({ error: 'recipient_name is required' });
    if (!deceased_name) return res.status(400).json({ error: 'deceased_name is required' });
    const prompt = `Write a ${tone || 'warm'} condolence letter to ${recipient_name} regarding the loss of ${deceased_name}. Writer's relationship to the family: ${relationship || 'friend'}.`;
    const systemPrompt = 'You are skilled at writing condolence letters that offer genuine comfort. Express sympathy authentically, share a brief memory or quality of the deceased if possible, offer specific help, and avoid clichés. The letter should feel personal and sincere.';
    const content = await callOpenRouter(prompt, systemPrompt);
    const saved = await pool.query(
      'INSERT INTO condolence_letters (user_id, recipient_name, deceased_name, relationship, tone, content, ai_generated, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
      [req.user.id, recipient_name, deceased_name, relationship || null, tone || 'warm', content, true, 'draft']
    );
    res.json({ id: saved.rows[0].id, content, type: 'condolence' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Prayer/Reading
router.post('/generate-prayer', auth, async (req, res) => {
  try {
    const { tradition, occasion, deceased_name, category } = req.body;
    const prompt = `Suggest a ${category || 'prayer'} from the ${tradition || 'non-denominational'} tradition for a ${occasion || 'funeral service'} honoring ${deceased_name || 'the deceased'}.`;
    const systemPrompt = 'You are a knowledgeable spiritual advisor with expertise in prayers, readings, and scriptures from various religious and secular traditions. Provide appropriate, respectful selections with proper attribution. Include the full text and any context about when it is traditionally used.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'prayer_reading' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Donation Thank You
router.post('/generate-donation-thanks', auth, async (req, res) => {
  try {
    const { donor_name, deceased_name, organization, amount } = req.body;
    if (!donor_name) return res.status(400).json({ error: 'donor_name is required' });
    const prompt = `Write a thank you letter to ${donor_name} for their ${amount ? '$' + amount : ''} memorial donation to ${organization || 'the memorial fund'} in memory of ${deceased_name || 'our loved one'}.`;
    const systemPrompt = 'You are experienced in writing donation acknowledgment letters for memorial funds. Express heartfelt gratitude, acknowledge the specific donation, mention how it honors the deceased, and provide any tax-related notes. Keep it warm and professional.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'donation_thanks' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Legacy interview guide — questions to ask family before/early in bereavement
router.post('/legacy-interview-guide', auth, async (req, res) => {
  try {
    const { deceased_name, relationship, key_themes = [], audience = 'family' } = req.body || {};
    const prompt = `Generate a guided interview script to capture stories about ${deceased_name || 'the deceased'} for ${audience}.
Relationship of interviewer to the deceased: ${relationship || 'family member'}.
Themes to explore: ${JSON.stringify(key_themes)}.

Provide:
- 5 warm-up questions (low emotional weight)
- 8 deeper memory questions (childhood, career, family, love)
- 4 legacy / values questions
- 3 logistical questions (preferences for the service, charities, traditions)
- A short note on how to navigate emotional moments and consent for recording.

Return clean Markdown so it can be printed.`;
    const systemPrompt = 'You are a sensitive grief and oral-history specialist. Produce a respectful interview guide that helps families capture stories before, during, or shortly after a loss.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'legacy_interview_guide' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Timeline narrative synthesis — weaves life events into a flowing story
router.post('/timeline-narrative', auth, async (req, res) => {
  try {
    const { deceased_name, events = [], tone = 'reflective' } = req.body || {};
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'events array required (e.g., [{ year, title, description }])' });
    }
    const prompt = `Weave the following timeline events into a single flowing biographical narrative for ${deceased_name || 'the deceased'}.
Tone: ${tone}.
Events (chronological): ${JSON.stringify(events, null, 2)}

Output:
1. A 4-6 paragraph narrative.
2. A short list of suggested chapter headings if printed in a memorial booklet.
3. A list of any gaps worth filling with family interviews.

Return Markdown.`;
    const systemPrompt = 'You are a respectful biographer. Synthesize events into a moving but truthful narrative. Avoid embellishment.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'timeline_narrative' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Donations matching — suggest charitable causes aligned to deceased's values
router.post('/donations-matching', auth, async (req, res) => {
  try {
    const { deceased_name, values = [], causes_of_interest = [], geography, budget_size_usd } = req.body || {};
    const prompt = `Suggest 5-8 well-respected charitable causes/organizations that would match the values and interests of ${deceased_name || 'the deceased'}.
Values: ${JSON.stringify(values)}
Causes of interest: ${JSON.stringify(causes_of_interest)}
Geography: ${geography || 'unspecified'}
Suggested gift size USD: ${budget_size_usd || 'unspecified'}

For each suggestion provide:
- Organization name
- Mission summary
- Why it fits
- Typical impact for a gift in the suggested range
- Note about due diligence (charity navigator / IRS 990 checks)

Return Markdown.`;
    const systemPrompt = 'You are a philanthropic advisor. Suggest reputable causes; encourage family to verify each charity independently.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'donations_matching' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
