# Subdomain Automation Plan (`slug.spacelovee.my.id`)

## Goals
- Every newly created space should automatically receive a dedicated subdomain (`{slug}.spacelovee.my.id`).
- Provisioning must be idempotent, retry-friendly, and observable (status + error tracing).
- Support manual re-sync for existing spaces when slug changes or provisioning fails.

## Data Model Changes
- Add columns to `spaces` table:
  - `subdomain` (string, nullable) – canonical host (e.g. `my-space.spacelovee.my.id`).
  - `subdomain_status` (enum/string) – `pending`, `provisioned`, `failed`.
  - `dns_record_id` (string, nullable) – provider record identifier for updates/deletes.
  - `last_subdomain_synced_at` (timestamp, nullable).
- Consider unique index on `subdomain` to prevent duplicates.
- When slugs change, trigger reprovisioning and clean up old DNS records.

## Provisioning Flow
1. `Space` created/updated event dispatches `ProvisionSpaceSubdomain` job.
2. Job resolves desired host `<slug>.spacelovee.my.id` and constructs API payload.
3. Provider integration (based on production setup):
   - **Cloudflare**: `POST zones/:zone_id/dns_records` with CNAME pointing to primary app domain (e.g. `app.spacelovee.my.id`). Store returned record id.
   - **Vercel**: `POST /v9/projects/{projectId}/domains` followed by `PATCH` to configure record.
   - **Other DNS**: adapt accordingly; wrap inside `DnsProvider` interface for swapability.
4. Mark status `provisioned` on success, `failed` on exceptions (persist error message for debugging).
5. Retry policy with exponential backoff (e.g. 5 attempts) and alert via logging/Slack/email on exhaustion.

## Runtime Resolution
- Add middleware that inspects `Request::getHost()`:
  - Strip base domain, look up `Space` by `subdomain`.
  - Inject `currentSpace` into request attributes and enforce authorization.
- Ensure wildcard TLS certificate covers `*.spacelovee.my.id`; otherwise automate certificate issuance (e.g. via Vercel, Cloudflare, or Let’s Encrypt wildcard).
- Redirect canonical `https://slug.spacelovee.my.id` to existing dashboard routes (or serve them directly via route prefix).

## Administration & Monitoring
- Filament admin resource or CLI command to:
  - Re-provision (`artisan spaces:sync-subdomains {--slug=}`).
  - List failed records with last error.
  - Decommission subdomains for archived spaces.
- Log provisioning attempts to separate channel (`dns_provisioning`) for easier tracing.
- Optional: send notification/email to founders when new subdomain live.

## Security & Secrets
- Store provider API tokens in `.env` (`DNS_PROVIDER`, `DNS_API_TOKEN`, `DNS_ZONE_ID`, etc.).
- Rate-limit job dispatches to avoid API throttling (use queue workers with concurrency cap).
- Validate slug compatibility (alphanumeric/hyphen, length limits) before submitting to DNS provider.

## Open Questions
- Confirm hosting provider (Vercel vs Cloudflare vs custom) to finalize API integration.
- Determine if legacy spaces require backfill – create migration/command to enqueue provisioning for all existing records.
- Define behaviour when slug changes while previous DNS record still propagates – likely keep grace period before deleting old record.
