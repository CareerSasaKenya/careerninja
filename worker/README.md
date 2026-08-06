# CareerSasa Background Worker

Runs the heavy background work (scraping, processing, AI enrichment, and — later — social posting) outside of Vercel serverless functions.

It imports the **same code** the Vercel routes use (`src/lib/scrapeDiscover.ts`, `src/lib/scrapeProcess.ts`, `src/lib/supabaseServiceClient.ts`), so behaviour is identical wherever the job runs.

## Architecture

```text
Vercel (storefront)                    GitHub Actions (worker)
  website / API                         scheduled workflows:
  admin dashboard                         discover   → scraper_sources → scrape_queue
  discover/process buttons ──HTTP──►       process    → scrape_queue → jobs + scraped_job_sources
                          (optional)
                      └─────────── Supabase (single source of truth) ──────────┘
```

- Worker reads/writes Supabase **directly** with the service-role key (same as Vercel routes).
- Discover and process are separate scheduled workflows so they can run at different cadences.
- An optional HTTP server (`WORKER_HTTP_PORT`) lets the Vercel admin dashboard proxy its Discover/Process buttons to the worker later.

## Recommended: GitHub Actions (free, no servers)

GitHub Actions runs the worker on scheduled workflows. Because `careerninja` is a **public** repository, Actions minutes are **unlimited** — the heavy scraping runs at zero cost, and Vercel only serves the website.

Two workflows are committed in `.github/workflows/`:

| Workflow | Cron (UTC) | What it does |
|----------|------------|--------------|
| `discover.yml` | `0 */3 * * *` (every 3h) | Sweep all active sources, queue new job links (10-min budget) |
| `process.yml` | `*/15 * * * *` (every 15 min) | Drain the queue — fetch details, AI-enrich, publish (batch up to 25) |

This matches the Vercel cron cadence, so published-job freshness is unchanged.

### 1. Add the secrets (one time)

Repo → **Settings → Secrets and variables → Actions** → **New repository secret**. Add the same values your Vercel project uses:

| Secret | Where to get it |
|--------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (service_role — **secret**, never expose it) |
| `SCRAPER_USER_ID` | The user ID that owns scraped jobs (from your Vercel env or Supabase `auth.users`) |
| `DEEPSEEK_API_KEY` | DeepSeek platform |
| `DEEPSEEK_MODEL` | Optional — defaults to `deepseek-v4-flash` |
| `GEMINI_API_KEY` / `_2` / `_3` | Optional — Gemini is the fallback provider |

### 2. Run it manually once

Repo → **Actions** → pick **Scrape Discover** → **Run workflow** (leave inputs blank). Watch the run finish green. Then run **Scrape Process** the same way.

> The workflows also fire on their cron automatically — discover every 3h, process every 15 min.

### 3. Verify quality/output is unchanged

- Check the Admin → Scraper Sources page — pending/done counts move after a process run.
- Confirm jobs appear on the site with the same fields as before (identical code paths in `src/lib/`).
- Check the Actions run logs for discover queued counts and process published counts.

### 4. Turn off the Vercel scrape crons (once stable)

Once the Actions worker has run successfully a few times, remove the scrape entries from `vercel.json` to stop burning Vercel credits:

```json
{ "path": "/api/cron/scrape-discover", "schedule": "0 */4 * * *" },
{ "path": "/api/cron/scrape-process", "schedule": "*/15 * * * *" }
```

Keep the other crons (`expire-jobs`, `auto-renew-jobs`, etc.) on Vercel — they're lightweight.

> During the transition, running both Vercel and Actions is safe — `job_url` and `content_hash` dedup prevent duplicates.

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
- `/health` — `GET`

Header: `x-worker-secret: <WORKER_SECRET>`.

The Vercel admin buttons can point here instead of running work inside Vercel API routes. If you do this, update `app/api/admin/scraper-sources/discover/route.ts` and `.../process/route.ts` to proxy to `http://<worker-host>:8787`.

## Notes

- Env vars must match the Vercel app (same Supabase project).
- `SCRAPER_USER_ID` is still required — it's the user that owns scraped/published jobs (see `src/lib/scrapeProcess.ts`).
- AI enrichment uses the same provider chain as the app: **DeepSeek → Gemini**. Add `DEEPSEEK_API_KEY` to `.env` to use DeepSeek.
