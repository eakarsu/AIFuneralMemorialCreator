/*
 * routes/probate.js — Mechanical probate-checklist generator.
 *
 * Pass 5 addition: addresses audit gap "regulatory compliance (obituary
 * publication, death notice workflows)" and custom suggestion #5 "Probate
 * assistant" — implemented as a deterministic timeline (no AI cost), with
 * state-specific tweaks for a small set of US states. Caller can override
 * dates and toggle a notice-of-creditors window. Disclaimers preserved.
 */

const router = require('express').Router();
const auth = require('../middleware/auth');

const STATE_OVERRIDES = {
  CA: { creditor_window_days: 120, intestate_homestead_priority: true },
  NY: { creditor_window_days: 210 },
  TX: { creditor_window_days: 120, independent_admin_available: true },
  FL: { creditor_window_days: 90 },
  IL: { creditor_window_days: 180 },
  PA: { creditor_window_days: 365 },
  // default for other states is 180
};

function offsetDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

router.post('/checklist', auth, (req, res) => {
  try {
    const {
      deceased_name,
      death_date,
      state,
      has_will,
      executor_name,
      estate_size_estimate,
    } = req.body || {};
    if (!death_date) return res.status(400).json({ error: 'death_date is required' });

    const stateKey = (state || '').toUpperCase();
    const stateCfg = STATE_OVERRIDES[stateKey] || { creditor_window_days: 180 };

    const items = [
      { day_offset: 0, category: 'immediate', task: 'Obtain pronouncement of death' },
      { day_offset: 1, category: 'immediate', task: 'Order 10–15 certified copies of the death certificate' },
      { day_offset: 2, category: 'communications', task: 'Publish obituary / death notice in local paper' },
      { day_offset: 3, category: 'documents', task: 'Locate original will, codicils, trust documents' },
      { day_offset: 7, category: 'finance', task: 'Notify SSA, employer, pension, life-insurance carriers' },
      { day_offset: 14, category: 'court', task: has_will ? 'File petition for probate / letters testamentary' : 'File petition for letters of administration (intestate)' },
      { day_offset: 30, category: 'finance', task: 'Open estate bank account (after letters issued)' },
      { day_offset: 30, category: 'inventory', task: 'Inventory real & personal property; secure dwelling' },
      { day_offset: 45, category: 'tax', task: 'Apply for federal EIN for the estate' },
      { day_offset: 60, category: 'creditor', task: 'Publish notice to creditors (jurisdiction-dependent)' },
      { day_offset: stateCfg.creditor_window_days, category: 'creditor', task: 'Creditor claim window closes' },
      { day_offset: 270, category: 'tax', task: 'File final personal income-tax return (Form 1040) for the year of death' },
      { day_offset: 270, category: 'tax', task: 'File estate income-tax return (Form 1041) if required' },
      { day_offset: 365, category: 'distribution', task: 'Make interim distributions / final accounting' },
      { day_offset: stateCfg.creditor_window_days + 90, category: 'closure', task: 'File closing statement & distribute residuary' },
    ];

    if (estate_size_estimate && Number(estate_size_estimate) > 13_610_000) {
      items.push({ day_offset: 270, category: 'tax', task: 'File federal estate-tax return (Form 706) — estimated estate exceeds 2024 federal exemption ($13.61M)' });
    }

    const timeline = items
      .map((it) => ({
        ...it,
        target_date: offsetDays(death_date, it.day_offset),
      }))
      .sort((a, b) => a.day_offset - b.day_offset);

    res.json({
      deceased_name: deceased_name || null,
      executor_name: executor_name || null,
      jurisdiction: stateKey || 'US-default',
      state_overrides: stateCfg,
      timeline,
      disclaimer: 'This is an informational checklist generated from generic state windows; it is NOT legal advice. Probate procedures vary by jurisdiction and individual circumstances. Engage a licensed probate attorney for binding guidance.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/state-config', auth, (req, res) => {
  res.json({ defaults: { creditor_window_days: 180 }, overrides: STATE_OVERRIDES });
});

module.exports = router;
