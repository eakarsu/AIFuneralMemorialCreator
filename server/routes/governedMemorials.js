const router = require('express').Router();
const crypto = require('crypto');
const pool = require('../db');
const auth = require('../middleware/auth');
const { validateDocument, validateTransition } = require('../domain/memorialWorkflow');
router.use(auth);
const tenant = (req) => String(req.user.organization_id || req.user.tenant_id || `personal-${req.user.id}`);

router.get('/', async (req, res, next) => {
  try { const result = await pool.query('SELECT * FROM governed_memorial_cases WHERE tenant_id=$1 ORDER BY created_at DESC', [tenant(req)]); res.json(result.rows); } catch (error) { next(error); }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    for (const field of ['case_reference','deceased_display_name','jurisdiction','rule_version']) if (!req.body[field]) throw new Error(`${field} is required`);
    await client.query('BEGIN');
    const result = await client.query(`INSERT INTO governed_memorial_cases(tenant_id,case_reference,deceased_display_name,jurisdiction,rule_version,schedule,pricing_disclosure,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [tenant(req), req.body.case_reference, req.body.deceased_display_name, req.body.jurisdiction, req.body.rule_version, JSON.stringify(req.body.schedule || {}), JSON.stringify(req.body.pricing_disclosure || {}), req.user.id]);
    await client.query('INSERT INTO memorial_audit_events(tenant_id,actor_user_id,action,entity_type,entity_id,after_state,request_id) VALUES($1,$2,$3,$4,$5,$6,$7)', [tenant(req), req.user.id, 'memorial.created', 'memorial_case', String(result.rows[0].id), result.rows[0], req.get('x-request-id') || crypto.randomUUID()]);
    await client.query('COMMIT'); res.status(201).json(result.rows[0]);
  } catch (error) { await client.query('ROLLBACK'); res.status(400).json({ error: error.message }); } finally { client.release(); }
});

router.post('/:id/documents', async (req, res, next) => {
  try {
    const doc = validateDocument(req.body);
    const result = await pool.query(`INSERT INTO memorial_case_documents(tenant_id,case_id,document_type,storage_key,checksum,jurisdiction,rule_version,contains_sensitive_data) SELECT $1,id,$2,$3,$4,$5,$6,$7 FROM governed_memorial_cases WHERE id=$8 AND tenant_id=$1 ON CONFLICT(tenant_id,case_id,document_type,checksum) DO UPDATE SET checksum=EXCLUDED.checksum RETURNING *`, [tenant(req), doc.document_type, doc.storage_key, doc.checksum, doc.jurisdiction, doc.rule_version, doc.contains_sensitive_data !== false, req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'memorial case not found' }); res.status(201).json(result.rows[0]);
  } catch (error) { if (error.message.includes('required') || error.message.includes('checksum')) return res.status(400).json({ error: error.message }); next(error); }
});

router.post('/:id/transition', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query(`SELECT c.*,COUNT(d.id)::int AS document_count FROM governed_memorial_cases c LEFT JOIN memorial_case_documents d ON d.case_id=c.id AND d.tenant_id=c.tenant_id WHERE c.id=$1 AND c.tenant_id=$2 GROUP BY c.id FOR UPDATE OF c`, [req.params.id, tenant(req)]);
    const item = found.rows[0]; if (!item) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'memorial case not found' }); }
    const identityVerified = item.identity_verified || req.body.status === 'identity_verified';
    const consentComplete = item.required_consents_complete || (req.body.required_consents_complete === true && item.document_count > 0);
    validateTransition(item.status, req.body.status, { role: req.user.role, identityVerified, requiredConsentsComplete: consentComplete, publisherReceipt: req.body.publisher_receipt, unreviewedAiOutput: Boolean(req.body.unreviewed_ai_output) });
    const result = await client.query(`UPDATE governed_memorial_cases SET status=$1,identity_verified=$2,required_consents_complete=$3,financial_reconciled=COALESCE($4,financial_reconciled),approved_by=CASE WHEN $1 IN ('approved','published','closed') THEN $5 ELSE approved_by END,version=version+1,updated_at=NOW() WHERE id=$6 AND tenant_id=$7 AND version=$8 RETURNING *`, [req.body.status, identityVerified, consentComplete, req.body.financial_reconciled, req.user.id, item.id, tenant(req), Number(req.body.version)]);
    if (!result.rows[0]) throw new Error('version conflict');
    await client.query('INSERT INTO memorial_audit_events(tenant_id,actor_user_id,action,entity_type,entity_id,before_state,after_state,request_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8)', [tenant(req), req.user.id, 'memorial.transitioned', 'memorial_case', String(item.id), item, result.rows[0], req.get('x-request-id') || crypto.randomUUID()]);
    await client.query('COMMIT'); res.json(result.rows[0]);
  } catch (error) { await client.query('ROLLBACK'); res.status(409).json({ error: error.message }); } finally { client.release(); }
});

router.post('/integration-runs', async (req, res, next) => {
  try {
    if (!req.body.provider || !req.body.operation || !['queued','succeeded','failed','manual_review'].includes(req.body.status)) return res.status(400).json({ error: 'provider, operation, and valid status required' });
    if (req.body.status === 'failed' && !req.body.error_code) return res.status(400).json({ error: 'error_code required' });
    const result = await pool.query('INSERT INTO memorial_integration_runs(tenant_id,provider,operation,status,external_reference,error_code,error_message) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *', [tenant(req), req.body.provider, req.body.operation, req.body.status, req.body.external_reference || null, req.body.error_code || null, req.body.error_message || null]); res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});
module.exports = router;
