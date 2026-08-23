# CareerSasa Background Worker

Runs the heavy background work (scraping, processing, AI enrichment, and social posting via Buffer) outside of Vercel serverless functions.

It imports the **same code** the Vercel routes use (`src/lib/scrapeDiscover.ts`, `src/lib/scrapeProcess.ts`, `src/lib/supabaseServiceClient.ts`), so behaviour is identical wherever the job runs.

## Architecture

```text
Vercel (storefront + light crons)      GitHub Actions (heavy scrape worker)
  website / API                         scheduled workflows:
  admin dashboard                         discover   → scraper_sources → scrape_queue
  expire/renew/email crons                process    → scrape_queue → jobs
  social-auto-queue cron ──Buffer──►      enrich     → sparse/scraped AI normalize
                      └─────────── Supabase (single source of truth) ──────────┘
```

- Worker reads/writes Supabase **directly** with the service-role key (same as Vercel routes).
- Discover, process, and enrich stay on GitHub Actions. Social auto-queue runs on **Vercel Cron** (`/api/cron/social-auto-queue`) because it is small (at most 9 Buffer posts per run).
- The admin Scraper Sources page dispatches Discover/Process/Enrich to GitHub Actions. Social can still be dry-run from Actions → **Social Auto-Queue**, or `npm run worker:social`.

## Recommended: GitHub Actions (free, no servers)

GitHub Actions runs the worker on scheduled workflows. Because `careerninja` is a **public** repository, Actions minutes are **unlimited** — the heavy scraping runs at zero cost, and Vercel only serves the website.

Three scrape workflows plus social auto-queue are committed in `.github/workflows/`:

| Workflow | Schedule (UTC) | Effective cadence | What it does |
|----------|----------------|-------------------|--------------|
| `discover.yml` | hourly tick, ~40% run chance | mean ≈ 2.5h (range ~1–5h) | Sweep all active sources, queue new job links (10-min budget) |
| `process.yml` | 15-min tick, ~85% run chance | mean ≈ 17.6 min | Drain the queue — fetch details, AI-enrich, publish (batch up to 25) |
| `enrich.yml` | every 4h + 0–90 min jitter | ~4h | AI-enrich sparse active jobs (scheduled); also supports re-enriching published scraped jobs |
| `social.yml` | manual only | — | Dry-run / one-off Buffer refill. Production cadence is Vercel Cron |

The intervals are **randomized** (probability-skip + jitter per tick) so scraping looks natural instead of firing on a fixed clock. Manual dispatch via the admin UI or API always runs immediately.

### 1. Add the secrets (one time)

Repo → **Settings → Secrets and variables → Actions** → **New repository secret**. Add the same values your Vercel project uses:

| Secret | Where to get it |
|--------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (service_role — **secret**, never expose it) |
| `SCRAPER_USER_ID` | The user ID that owns scraped jobs (from your Vercel env or Supabase `auth.users`) |
| `DEEPSEEK_API_KEY` / `_2` | DeepSeek platform |
| `DEEPSEEK_MODEL` | Optional — defaults to `deepseek-v4-flash` |
| `GEMINI_API_KEY` / `_2` / `_3` | Optional — Gemini is the fallback provider |
| `BUFFER_API_KEY` | Optional if Buffer was connected in Admin → Social Publishing (stored in `buffer_config`). Recommended in production. Generate at publish.buffer.com/settings/api |

To trigger runs **from the admin UI**, also add a GitHub Personal Access Token with the `workflow` scope as the Vercel env var `GITHUB_ACTIONS_TOKEN` (Settings → Developer settings → Personal access tokens → Fine-grained, repo `careerninja`, **Actions: write**). The UI buttons call `POST /api/admin/gh-actions/trigger`.

### 2. Run it manually once

Repo → **Actions** → pick **Scrape Discover** → **Run workflow** (leave inputs blank). Watch the run finish green. Then run **Scrape Process** the same way. Or use Admin → Scraper Sources → the Discover / Process / Enrich buttons, which dispatch the same workflows.

> The workflows also fire on their randomized schedules automatically.

### 3. Verify quality/output is unchanged

- Check the Admin → Scraper Sources page — pending/done counts move after a process run.
- Confirm jobs appear on the site with the same fields as before (identical code paths in `src/lib/`).
- Check the Actions run logs for discover queued counts and process published counts.

### 4. Turn off the Vercel scrape crons (once stable)

The Vercel scrape crons (`scrape-discover`, `scrape-process`, `enrich-jobs`) were intended to move fully to GitHub Actions. Keep the lightweight crons on Vercel (`expire-jobs`, `auto-renew-jobs`, `expire-promotions`, `email-automations`, `enrich-company-logos`, **`social-auto-queue`**).

## Alternative: VPS (Hetzner / InterServer / Oracle)

If you'd rather run on your own Linux VM:

### Hetzner

A **CX22** (2 vCPU / 4 GB RAM) at ~€4.15/month handles the workload easily.

1. **Sign up** at hetzner.com/cloud (may ask for photo ID verification for some regions).
2. **Add Server**: location `fsn1` Frankfurt or `nbg1`; image **Ubuntu 24.04**; type **CX22**; add an SSH key; name it `careersasa-worker`; Create & Buy.
3. **Login**:
   ```bash
   ssh -i ~/.ssh/careersasa root@<SERVER_IP>
   apt update && apt upgrade -y
   ```
4. **Install Node 20**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs git
   ```
5. **Deploy** (private repo — use a GitHub deploy key or PAT):
   ```bash
   git clone git@github.com:CareerSasaKenya/careerninja.git /opt/careerninja
   cd /opt/careerninja
   npm install
   cp worker/.env.example worker/.env
   nano worker/.env
   ```
6. **Run as a service** — `/etc/systemd/system/careersasa-worker.service`:
   ```ini
   [Unit]
   Description=CareerSasa Background Worker
   After=network.target

   [Service]
   Type=simple
   WorkingDirectory=/opt/careerninja
   ExecStart=/usr/bin/npm run worker:start
   Restart=always
   RestartSec=10
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```
   ```bash
   systemctl daemon-reload
   systemctl enable --now careersasa-worker
   systemctl status careersasa-worker
   ```

### InterServer

US host, card/PayPal signup (no ID verification). **Cloud VPS** starts at ~$6/mo (price-locked). Shared hosting is *not* suitable — you need a VPS for a Node worker. Setup steps are identical to Hetzner above once you have root SSH access.

### Oracle Cloud Always Free

Free-forever ARM VM (2 OCPU / 12 GB RAM). Only works if you have a **physical Visa/Mastercard** — Oracle's card verification rejects PIN-based debit, virtual, prepaid, and mobile-money cards. Sign up at oracle.com/cloud/free, create an **Ampere A1** instance, and log in as `ubuntu@<PUBLIC_IP>`.

> **Keep the VM busy.** Oracle reclaims Always Free instances idle near-zero CPU/RAM for ~7 days. Your 15-minute scheduler keeps it alive.

## Run modes

```bash
# One-shot: discover all active sources and queue new jobs
npm run worker:discover

# One-shot: process 5 queued items
npm run worker:process

# One-shot: process N items
npm run worker:process:n          # or: npm run worker:process -- 10

# One-shot: AI-enrich active jobs missing fields (sparse mode)
npm run worker:enrich -- sparse 10

# One-shot: re-normalize published scraped jobs (scraped mode, optional source)
npm run worker:enrich -- scraped 10 myjobmag-kenya

# One-shot: fill Buffer queues (3 posts/channel/Nairobi day). --dry-run previews only.
npm run worker:social
npm run worker:social -- --dry-run

# Long-running: scheduler + HTTP trigger
npm run worker:start

# HTTP trigger only
npm run worker:server
```

## Scheduling (defaults, UTC)

| Job | Cron | Default |
|-----|------|---------|
| Discover | `WORKER_CRON_DISCOVER` | `0 5 * * *` (05:00 daily) |
| Process | `WORKER_CRON_PROCESS` | `*/15 * * * *` (every 15 min) |
| Social | `WORKER_CRON_SOCIAL` | `0 5,11 * * *` (VPS fallback only — production uses Vercel Cron) |

`WORKER_PROCESS_BATCH` controls how many queue items each process run handles (default 10).

## HTTP trigger (optional)

Enable in `.env`:

```ini
WORKER_HTTP_PORT=8787
WORKER_SECRET=some-long-random-string
```

Endpoints (all `POST`):

- `/discover` — body `{ "source_id"?: string }`
- `/process` — body `{ "max"?: number }`
- `/social` — body `{ "dry_run"?: boolean }`
- `/health` — `GET`

Header: `x-worker-secret: <WORKER_SECRET>`.

The Vercel admin buttons now dispatch GitHub Actions workflows instead (see above), so the HTTP trigger is only needed for self-hosted VPS setups.

## Notes

- Env vars must match the Vercel app (same Supabase project).
- `SCRAPER_USER_ID` is still required — it's the user that owns scraped/published jobs (see `src/lib/scrapeProcess.ts`).
- AI enrichment uses the same provider chain as the app: **DeepSeek → Gemini**. Add `DEEPSEEK_API_KEY` to `.env` to use DeepSeek.
- Social auto-queue sends **3 posts per channel per Nairobi day** through Buffer Free (`addToQueue`). Routing is exclusive: featured/professional → LinkedIn, visual/youth → Instagram, high-volume/entry → Facebook. The same job is never generated for two platforms. Set three posting times per channel in Buffer so the queue drips through the day.
