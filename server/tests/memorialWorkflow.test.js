const test = require('node:test');
const assert = require('node:assert/strict');
const { validateDocument, validateTransition } = require('../domain/memorialWorkflow');

test('accepts a versioned document with a SHA-256 checksum', () => assert.equal(validateDocument({ document_type: 'consent', storage_key: 'vault/1', checksum: 'a'.repeat(64), jurisdiction: 'NY', rule_version: '2026-01' }).document_type, 'consent'));
test('rejects unverifiable documents', () => assert.throws(() => validateDocument({ document_type: 'consent', storage_key: 'vault/1', checksum: 'bad', jurisdiction: 'NY', rule_version: '1' }), /SHA-256/));
test('blocks unreviewed model output from publication', () => assert.throws(() => validateTransition('scheduled', 'published', { role: 'licensed_director', identityVerified: true, requiredConsentsComplete: true, publisherReceipt: 'p-1', unreviewedAiOutput: true }), /reviewed/));
