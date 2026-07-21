# Security and operations

Run `scripts/bootstrap.sh`, export `DATABASE_URL`, run `scripts/migrate.sh`, then `./start.sh`. Startup is non-destructive and stops only its own children. Demo data requires explicit confirmation outside production. The root secret has no fallback, passwords require twelve characters, public registration cannot self-assign privileged roles, CORS is allowlisted, and generated gap endpoints are not mounted.

`/api/governed-memorials` persists tenant-scoped cases, versioned jurisdiction rules, identity state, schedules, pricing disclosures, checksummed sensitive documents, consent completeness, licensed approvals, publisher receipts, financial reconciliation, optimistic versions, integration failures and immutable audit events. Unreviewed AI output cannot be published through the governed lifecycle.

Vital-record, map, inventory, payment, e-signature, obituary/publishing and accounting providers require real credentials and agreements. Storage must be private and encrypted with retention/deletion procedures. Identity, consent, death-care rules, dignity, accessibility, licensure and professional review remain external launch gates; grief or probate surfaces are not clinical or legal advice.
