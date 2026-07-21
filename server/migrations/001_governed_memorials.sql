CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'family';

CREATE TABLE IF NOT EXISTS governed_memorial_cases (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, case_reference TEXT NOT NULL, deceased_display_name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'intake',
  jurisdiction TEXT NOT NULL, rule_version TEXT NOT NULL, identity_verified BOOLEAN NOT NULL DEFAULT false, required_consents_complete BOOLEAN NOT NULL DEFAULT false,
  schedule JSONB NOT NULL DEFAULT '{}'::jsonb, pricing_disclosure JSONB NOT NULL DEFAULT '{}'::jsonb, financial_reconciled BOOLEAN NOT NULL DEFAULT false,
  created_by BIGINT NOT NULL, approved_by BIGINT, version INTEGER NOT NULL DEFAULT 1, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id,case_reference), CONSTRAINT memorial_stage CHECK(status IN ('intake','identity_verified','consents_pending','approved','scheduled','published','aftercare','closed'))
);
CREATE TABLE IF NOT EXISTS memorial_case_documents (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, case_id BIGINT NOT NULL REFERENCES governed_memorial_cases(id), document_type TEXT NOT NULL,
  storage_key TEXT NOT NULL, checksum TEXT NOT NULL, jurisdiction TEXT NOT NULL, rule_version TEXT NOT NULL, contains_sensitive_data BOOLEAN NOT NULL DEFAULT true,
  approved_by BIGINT, approved_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(tenant_id,case_id,document_type,checksum)
);
CREATE TABLE IF NOT EXISTS memorial_integration_runs (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, provider TEXT NOT NULL, operation TEXT NOT NULL, status TEXT NOT NULL,
  external_reference TEXT, error_code TEXT, error_message TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT memorial_integration_status CHECK(status IN ('queued','succeeded','failed','manual_review'))
);
CREATE TABLE IF NOT EXISTS memorial_audit_events (
  id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, actor_user_id BIGINT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
  before_state JSONB, after_state JSONB, request_id TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS memorial_case_tenant_status_idx ON governed_memorial_cases(tenant_id,status);
