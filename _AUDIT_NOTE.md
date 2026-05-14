# Audit Apply Notes — AIFuneralMemorialCreator

Audit source: `_AUDIT/reports/batch_04.md` (#7). Verdict: substantive (28 routes, 10 AI endpoints).

## Original recommendations

Missing AI counterparts:
- `/legacy-interview-guide`
- `/timeline-narrative-synthesis`
- `/donations-matching`

## Implementations applied

Added three AI endpoints to `server/routes/ai.js` matching existing `callOpenRouter` style (no schema changes):

1. `POST /api/ai/legacy-interview-guide` — sensitive interview script with warm-ups, memory questions, legacy/values, logistics, and consent guidance. Markdown output.
2. `POST /api/ai/timeline-narrative` — weaves user-supplied life events into a multi-paragraph biographical narrative with chapter headings and gap callouts.
3. `POST /api/ai/donations-matching` — suggests charitable causes matching values; recommends due diligence (Charity Navigator, IRS 990).

Syntax-checked.

## Backlog (prioritized)

### Mechanical
- Persist results similar to existing endpoints (most existing endpoints don't persist either; could add a generic `ai_results` table later).

### Needs creds / external
- Charity verification API (Candid / Charity Navigator).
- Posthumous message scheduled delivery (calendar / email service).
- Public records (census, immigration, military) for biography auto-completion.

### Needs product decision
- Probate workflow vs. light memorial product line.
- Vendor directory monetization.

### Custom features
- Multi-modal memorial video generation (audio+video synthesis).
- Legacy letter / scheduled posthumous delivery platform.
- Grief support chatbot with stage detection.

## Apply pass 3 (frontend)

LEFT-AS-IS. `client/src/pages/AILegacyToolsPage.jsx` already wires the three apply2 endpoints (`/api/ai/legacy-interview-guide`, `/api/ai/timeline-narrative`, `/api/ai/donations-matching`) with a tabbed UI matching existing styling (`btn-primary`, `card`, `page-header`, Playfair Display headings). Auth uses `Authorization: Bearer <token>` from `localStorage`. Page registered in `client/src/App.jsx` at `/ai-legacy-tools/*`. Errors from the backend (including the 503 no-key path) surface via the page's error card. No FE files changed in this pass.

## Apply pass 4 (mechanical backlog)

LEFT-AS-IS. No mechanical backlog items remain. The original audit's three missing AI counterparts (`/legacy-interview-guide`, `/timeline-narrative-synthesis`, `/donations-matching`) were closed in pass 2; FE was verified complete in pass 3. Existing AI surface: 13 endpoints in `server/routes/ai.js`. All remaining items in this audit note are deferred for explicit reasons:
- Generic `ai_results` persistence table — TOO-RISKY (schema change against pre-existing endpoints not using it would risk regressions; "don't touch working code").
- Charity verification API (Candid / Charity Navigator) — NEEDS-CREDS.
- Posthumous message scheduled delivery — NEEDS-CREDS (calendar/email + scheduling infra).
- Public records integration (census, immigration, military) — NEEDS-CREDS.
- Probate workflow vs. light memorial product line, vendor directory monetization — NEEDS-PRODUCT-DECISION.
- Multi-modal memorial video generation, grief-support chatbot with stage detection — NEEDS-PRODUCT-DECISION + media/streaming infra.

No code changes. No smoke test (no code change).
