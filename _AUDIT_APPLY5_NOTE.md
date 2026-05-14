# Apply Pass 5 — AIFuneralMemorialCreator
Date: 2026-05-08
Stack: Node-Express + React (Postgres `pg`).

## Verified present (audit inventory)
All AI counterparts the audit flagged were already implemented in passes 2–4:
- `/api/ai/legacy-interview-guide`, `/api/ai/timeline-narrative`, `/api/ai/donations-matching`
- 10 original AI endpoints (obituary, eulogy, memorial-bio, estate, grief, program, thank-you, condolence, prayer, donation-thanks).
- 28 non-AI route files (memorialPages, contacts, venues, etc.) all present.

## Implemented this pass (2 mechanical, additive only)
1. **Vendor / service-provider directory** — addresses missing non-AI feature "vendor/service provider directory (florists, caterers, musicians)".
   - `server/routes/vendorDirectory.js` (140 lines): full CRUD + filters + categories endpoint, `CREATE TABLE IF NOT EXISTS vendor_directory`, JWT-bearer auth.
   - Wired in `server/index.js` (1-line addition above `/api/ai`).
2. **Probate timeline generator** — addresses missing non-AI feature "regulatory compliance" + custom suggestion #5 "Probate assistant".
   - `server/routes/probate.js` (90 lines): deterministic state-aware timeline (CA/NY/TX/FL/IL/PA + default), federal-estate-tax flag at >$13.61M (2024), legal-advice disclaimer preserved.
   - Wired in `server/index.js`.
3. **Frontend** — `client/src/pages/VendorAndProbatePage.jsx`, registered at `/vendor-probate/*` in `client/src/App.jsx`. Tabbed UI matching existing styling conventions.

Total new endpoints: 7 (vendor list/get/post/put/delete/categories + probate checklist + state-config = 8 actually). Within 5-item cap (counted as 2 features).

## Deferred
- **Multi-modal memorial video generation** — NEEDS-CREDS (audio/video synthesis APIs) + NEEDS-PRODUCT-DECISION (storage, watermark, codec).
- **Legacy letter scheduled posthumous delivery** — NEEDS-CREDS (scheduler + email/calendar service) + NEEDS-PRODUCT-DECISION (trigger semantics, custodian model).
- **Public records (census/immigration/military) for biography auto-completion** — NEEDS-CREDS (FamilySearch / Ancestry / NARA).
- **Charity verification API (Candid / Charity Navigator)** — NEEDS-CREDS.
- **Grief support chatbot with stage detection** — NEEDS-PRODUCT-DECISION (stateful conversation store, escalation policy, clinical safety review).
- **Generic `ai_results` persistence table** — TOO-RISKY (schema change against pre-existing endpoints).

`_BACKLOG_NEEDS_CREDS.md` not yet written; existing `_AUDIT_NOTE.md` already enumerates these — see Apply pass 4 section.

## Smoke test
- `node -c` on all three new/modified server files — PASS.
- Did not boot server (would require Postgres + JWT_SECRET); table creation is gated through middleware so first request triggers DDL idempotently.
- Existing endpoints unchanged.
