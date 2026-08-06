# CareerSasa Background Worker

Runs the heavy background work (scraping, processing, AI enrichment, and — later — social posting) outside of Vercel serverless functions.

It imports the **same code** the Vercel routes use (`src/lib/scrapeDiscover.ts`, `src/lib/scrapeProcess.ts`, `src/lib/supabaseServiceClient.ts`), so behaviour is identical wherever the job runs.

## Architecture

```text
Vercel (storefront)                    Railway (worker)
  website / API                       built-in cron:
  admin dashboard                       discover   → scraper_sources → scrape_queue
  discover/process buttons ──HTTP──►     process    → scrape_queue → jobs + scraped_job_sources
                          (optional)
                      └─────────── Supabase (single source of truth) ──────────┘
```

- Worker reads/writes Supabase **directly** with the service-role key (same as Vercel routes).
- Discover and process are separate cron jobs so they can run at different cadences.
- An optional HTTP server (`WORKER_HTTP_PORT`) lets the Vercel admin dashboard proxy its Discover/Process buttons to the worker later.

## Recommended: Railway (no server to manage)

Railway is a platform-as-a-service — you connect your GitHub repo, and it builds and runs the worker for you. No SSH, no systemd, no OS upkeep. Its built-in cron runs your jobs on schedule and only charges for the time the worker actually runs.

**Cost for CareerSasa:** roughly $4–6/month (Hobby plan, $5/mo including $5 of usage). The worker is idle most of the time, so usage is low.

### 1. Create the account

1. Go to **railway.com** → **Sign up** (login with GitHub is easiest).
2. Choose the **Hobby** plan when asked ($5/mo). The free trial ($5 credit, no card) also works to start.
3. No ID verification — just a GitHub account and, later, a card for the paid plan.

### 2. Add the repo

1. In Railway, click **New Project** → **Deploy from GitHub repo**.
2. Authorize Railway to access your GitHub, then pick **`careerninja`**.
3. Railway will detect the repo. Since we ship a **`Dockerfile`** at the repo root, Railway builds the worker image from it automatically. (Vercel ignores the Dockerfile and keeps building the Next.js site.)

### 3. Create the two cron services

The worker supports one-shot modes that run, publish, and exit — exactly what Railway cron needs. Create **two services** from the same repo:

| Service | Start command | Cron schedule (UTC) | What it does |
|---------|---------------|---------------------|--------------|
| `discover` | `npm run worker:discover` | `0 5 * * *` | Daily 05:00 — find new job links and queue them |
| `process` | `npm run worker:process` | `*/15 * * * *` | Every 15 min — fetch details, AI-enrich, publish |

In Railway, for each service:

1. **New Project → Deploy from GitHub repo → `careerninja`** (or create a second service in an existing project).
2. Open the service → **Settings → Deploy** → set **Start Command** to the command above (overrides the Dockerfile's default `npm run worker:start`).
3. **Settings → Cron Schedule** → enter the cron expression. Railway schedules are UTC.
4. Remove the **TCP/HTTP port** binding if Railway auto-detects one — the worker doesn't serve web traffic in cron mode.

> Railway cron caveats: minimum interval is **5 minutes**, schedules run in **UTC**, and only one run of a service may be active at a time (a run that hangs blocks the next one). Our worker exits cleanly after each run, so that's fine.

### 4. Set environment variables

In each service → **Variables**, add the same values your Vercel project uses:

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (service_role, **secret** — never expose it) |
| `SCRAPER_USER_ID` | The user ID that owns scraped jobs (from your Vercel env or Supabase `auth.users`) |
| `DEEPSEEK_API_KEY` | DeepSeek platform |
| `DEEPSEEK_MODEL` | Optional, defaults to `deepseek-v4-flash` |
| `GEMINI_API_KEY` / `_2` / `_3` | Optional backup keys (Gemini is the fallback provider) |
| `WORKER_PROCESS_BATCH` | Optional, default `10` — queue items per process run |

> Put the variables in **both** services (Railway does not share variables across services automatically). A project-level variable template can be set in **Project → Variables**.

### 5. Verify

1. Open the `discover` service → **Deployments** → the cron will trigger at 05:00 UTC, or click **Redeploy** to run it now.
2. Open **Logs** — you should see discover output and, in `process`, published jobs.
3. Check the Admin → Scraper Sources page on Vercel — pending/done counts should move.

### 6. Migrate off the Vercel crons

Once the Railway worker is stable, remove these entries from `vercel.json` to avoid double-running:

```json
{ "path": "/api/cron/scrape-discover", "schedule": "0 5 * * *" },
{ "path": "/api/cron/scrape-process", "schedule": "0 6 * * *" }
```

Double-running is safe anyway — `job_url` and `content_hash` dedup — but you don't want two sources of truth.

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
