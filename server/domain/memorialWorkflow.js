const STAGES = Object.freeze(['intake', 'identity_verified', 'consents_pending', 'approved', 'scheduled', 'published', 'aftercare', 'closed']);

function validateDocument(input) {
  for (const field of ['document_type', 'storage_key', 'checksum', 'jurisdiction', 'rule_version']) {
    if (!input[field] || !String(input[field]).trim()) throw new Error(`${field} is required`);
  }
  if (!/^[a-f0-9]{64}$/i.test(input.checksum)) throw new Error('checksum must be SHA-256');
  return input;
}

function validateTransition(from, to, context = {}) {
  const allowed = { intake: ['identity_verified'], identity_verified: ['consents_pending'], consents_pending: ['approved'], approved: ['scheduled'], scheduled: ['published'], published: ['aftercare'], aftercare: ['closed'], closed: [] };
  if (!allowed[from]?.includes(to)) throw new Error('invalid memorial transition');
  if (to !== 'identity_verified' && !context.identityVerified) throw new Error('identity verification required');
  if (['approved', 'scheduled', 'published', 'closed'].includes(to) && !context.requiredConsentsComplete) throw new Error('required consent versions must be complete');
  if (['approved', 'published', 'closed'].includes(to) && !['licensed_director', 'manager', 'admin'].includes(context.role)) throw new Error('licensed staff approval required');
  if (to === 'published' && (!context.publisherReceipt || context.unreviewedAiOutput)) throw new Error('reviewed content and publisher receipt required');
  return true;
}

module.exports = { STAGES, validateDocument, validateTransition };
