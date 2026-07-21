# Completeness Review: AIFuneralMemorialCreator

- **Review date:** 2026-07-18
- **Assessment basis:** Static source and configuration inspection only. Dependencies were not installed, and no build, database migration, external integration, or runtime workflow was executed.

## Classification

**Prototype-demo**

## Verdict

The repository presents a broad death-care operations surface (103 source files and 41 route modules), but static evidence is characteristic of a generated prototype. Pages and endpoints demonstrate concepts; they do not establish a verified execution path to manage cases, authorizations, schedules, remains identity, merchandise, documents, services, billing, and aftercare.

## Why it is not complete

- 18 files are explicitly named as gap/gap-feature implementations; route/page count therefore overstates completed product capability.
- The route/page inventory includes `ailegacy tools page`, `announcements page`, `budget tracker page`, `cf family tree biography auto completion pu`; these surfaces show breadth but not durable execution against authoritative systems.
- 13 files reference model-provider or chat-completion behavior; generic LLM calls are not a substitute for deterministic domain execution, grounding, or evaluation.
- 48 files contain mock, sample, placeholder, or random-data signals, leaving important outcomes disconnected from authoritative systems.
- Only 1 recognizable test file was found, insufficient to prove the full workflow and failure modes.
- No CI workflow was found to continuously verify builds, tests, migrations, or security checks.
- No environment example/template was found, so required configuration and secret boundaries are undocumented.

## Needed features

- 1. Implement a workflow to manage cases, authorizations, schedules, remains identity, merchandise, documents, services, billing, and aftercare.
- 2. Connect vital records, cemetery maps, inventory, payments, e-signature, obituary/publishing, and accounting; replace seed/demo records with durable synchronized data and explicit failure handling.
- 3. Validate identity chain, scheduling, pricing disclosures, document completeness, inventory, and financial reconciliation.
- 4. Preserve dignity/privacy and chain of custody, version jurisdiction rules, and require licensed staff approval.
- 5. Add contract, integration, authorization, migration, and end-to-end tests in CI, plus a documented non-destructive deployment/run path.

## Risks or launch blockers

- Credential/secret fallback or demo-password patterns occur in 3 files and must be removed or made development-only.
- The root launcher can terminate unrelated processes occupying configured ports.
- The root launcher seeds, creates, migrates, or otherwise mutates database state during startup.
- The root launcher installs dependencies at run time, reducing reproducibility and expanding supply-chain risk.
- Ungrounded or malformed model output can become a domain action unless schemas, evidence, evaluations, and approval gates are added.

## Evidence inspected

- `client/package.json` — declared scripts, runtime dependencies, and application boundaries.
- `package.json` — declared scripts, runtime dependencies, and application boundaries.
- `server/index.js` — service composition, middleware, and registered routes.
- `server/routes/ai.js` — implemented API surface and domain/AI request handling.
- `server/routes/announcements.js` — implemented API surface and domain/AI request handling.
- `server/routes/auth.js` — implemented API surface and domain/AI request handling.

## Recommended next action

Treat this as a prototype: use ailegacy tools page and announcements page to select one narrow death-care operations outcome, quarantine generated gap routes, and implement that outcome end to end with real data, deterministic rules, and tests before adding features.

## Implementation progress

- **Needed feature 1 — locally implemented governed core:** `server/domain/memorialWorkflow.js`, `server/routes/governedMemorials.js`, and `server/migrations/001_governed_memorials.sql` add tenant-scoped memorial cases covering intake, identity verification, consent completion, licensed approval, scheduling, receipt-backed publishing, aftercare and financial close. Jurisdiction/rule versions, schedules, disclosures, sensitive documents, consent state and reconciliation are durable; optimistic versions prevent lost transitions.
- **Needed feature 2 — locally implemented boundary; externally blocked adapters:** vital-record, map, inventory, payment, e-signature, obituary/publisher and accounting operations now have durable queued/succeeded/failed/manual-review records, external references and errors. Actual adapters remain blocked on vendor credentials, agreements, webhooks, private storage and authoritative systems.
- **Needed features 3–4 — locally implemented governance:** documents require a private storage key, SHA-256 checksum, jurisdiction and rule version; identity and complete consent gate later stages; licensed-director/manager/admin authority gates approval/publication/closure; publisher receipts and reviewed content gate publication; signed identity scopes tenants; audit events preserve actor/request/before/after state. Dignity, privacy/retention, chain-of-custody, jurisdiction policy, consent sufficiency, accessibility, pricing and licensed-professional acceptance remain external owner gates.
- **Needed feature 5 and launch blockers — implemented:** secret fallbacks, short-password registration, privileged-role self-assignment, permissive CORS, generated gap mounts and destructive startup behavior were addressed. `.env.example`, non-destructive start, separate bootstrap/migration/guarded seed, operations guidance, isolated PostgreSQL CI migration coverage, tests and client builds were added. The focused suite passes 3/3 tests and changed JavaScript/shell syntax checks pass.
- **Remaining external gates:** no real provider, payment, publishing, e-signature, licensed director, legal/regulatory, privacy, production migration, browser end-to-end or professional grief/probate validation was executed or claimed complete.
