const router = require('express').Router();
const fetch = require('node-fetch');
const auth = require('../middleware/auth');

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
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
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

// Generate Obituary
router.post('/generate-obituary', auth, async (req, res) => {
  try {
    const { deceased_name, birth_date, death_date, city, details } = req.body;
    const prompt = `Write a heartfelt and dignified obituary for ${deceased_name}, born ${birth_date || 'date unknown'}, who passed away ${death_date || 'recently'} in ${city || 'their hometown'}. Additional details: ${details || 'A beloved family member and friend.'}`;
    const systemPrompt = 'You are a compassionate obituary writer with decades of experience crafting dignified, heartfelt obituaries. Write in a warm, respectful tone that honors the deceased while providing comfort to the bereaved. Include appropriate structure with life highlights, surviving family, and service information placeholders.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'obituary' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Eulogy
router.post('/generate-eulogy', auth, async (req, res) => {
  try {
    const { deceased_name, relationship, tone, key_memories } = req.body;
    const prompt = `Write a ${tone || 'warm and heartfelt'} eulogy for ${deceased_name}. The speaker's relationship: ${relationship || 'close friend'}. Key memories to include: ${key_memories || 'Their kindness, humor, and love for family.'}`;
    const systemPrompt = 'You are an experienced eulogy writer who helps bereaved individuals honor their loved ones. Write eulogies that balance grief with celebration of life, include personal anecdotes, and provide comfort. The tone should be appropriate for a funeral or memorial service.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'eulogy' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Memorial Page Bio
router.post('/generate-memorial-bio', auth, async (req, res) => {
  try {
    const { deceased_name, birth_date, death_date, details } = req.body;
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
    const prompt = `Create a ${service_type || 'traditional'} funeral program for ${deceased_name}. Venue: ${venue || 'To be determined'}. Officiant: ${officiant || 'To be determined'}. Details: ${details || ''}`;
    const systemPrompt = 'You are a funeral program designer with extensive experience in creating beautiful, respectful service programs. Include order of service, hymns/music suggestions, scripture readings, and proper formatting. Structure it clearly with times, participants, and activities.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'funeral_program' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Thank You Card
router.post('/generate-thank-you', auth, async (req, res) => {
  try {
    const { recipient_name, deceased_name, gift_or_gesture, relationship } = req.body;
    const prompt = `Write a heartfelt thank you note to ${recipient_name} (${relationship || 'friend'}) for their ${gift_or_gesture || 'support and kindness'} following the passing of ${deceased_name || 'our loved one'}.`;
    const systemPrompt = 'You are an expert at writing sincere, heartfelt thank you notes for bereaved families. Keep messages warm, personal, and appropriately brief. Acknowledge the specific gesture or gift, express genuine gratitude, and maintain a tone of gracious appreciation.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'thank_you' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Generate Condolence Letter
router.post('/generate-condolence', auth, async (req, res) => {
  try {
    const { recipient_name, deceased_name, relationship, tone } = req.body;
    const prompt = `Write a ${tone || 'warm'} condolence letter to ${recipient_name} regarding the loss of ${deceased_name}. Writer's relationship to the family: ${relationship || 'friend'}.`;
    const systemPrompt = 'You are skilled at writing condolence letters that offer genuine comfort. Express sympathy authentically, share a brief memory or quality of the deceased if possible, offer specific help, and avoid clichés. The letter should feel personal and sincere.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'condolence' });
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
    const prompt = `Write a thank you letter to ${donor_name} for their ${amount ? '$' + amount : ''} memorial donation to ${organization || 'the memorial fund'} in memory of ${deceased_name || 'our loved one'}.`;
    const systemPrompt = 'You are experienced in writing donation acknowledgment letters for memorial funds. Express heartfelt gratitude, acknowledge the specific donation, mention how it honors the deceased, and provide any tax-related notes. Keep it warm and professional.';
    const content = await callOpenRouter(prompt, systemPrompt);
    res.json({ content, type: 'donation_thanks' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
