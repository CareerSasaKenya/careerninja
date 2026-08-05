# CareerSasa Background Worker

Runs the heavy background work (scraping, processing, AI enrichment, and — later — social posting) on a long-lived server instead of Vercel serverless functions.

It imports the **same code** the Vercel routes use (`src/lib/scrapeDiscover.ts`, `src/lib/scrapeProcess.ts`, `src/lib/supabaseServiceClient.ts`), so behaviour is identical wherever the job runs.

## Architecture

```text
Vercel (storefront)                  Cloud VM (worker)
  website / API                     Oracle Cloud / Hetzner / any VPS:
  admin dashboard                      node-cron:
  discover/process buttons ──HTTP──►     discover   → scraper_sources → scrape_queue
                          (optional)     process    → scrape_queue → jobs + scraped_job_sources
                      └─────────── Supabase (single source of truth) ──────────┘
```

- Worker reads/writes Supabase **directly** with the service-role key (same as Vercel routes).
- Discover and process are separate cron jobs so they can run at different cadences.
- An optional HTTP server (`WORKER_HTTP_PORT`) lets the Vercel admin dashboard proxy its Discover/Process buttons to the worker later.

## Requirements

- Node.js 20+ (Ubuntu on the server: `sudo apt install nodejs npm`, or use NodeSource LTS)

## Setup on a cloud VM (Hetzner / any Ubuntu VPS)

The worker lives inside the same repo as the Vercel app and shares its `node_modules`, so a single install is enough.

## Hetzner Cloud setup (step by step)

Hetzner is the reliable paid option used for CareerSasa: a **CX22** (2 vCPU / 4 GB RAM) at ~€4.15/month handles the full scraping + processing + AI workload easily.

### 1. Create the account

1. Go to **hetzner.com/cloud** → **Sign up**.
2. Choose an **individual** account. Fill in your details.
3. Payment: **credit card (Visa/Mastercard)** or **PayPal** (the common fallback for users outside Europe). Card is a normal friendly checkout — no aggressive fraud screening like Oracle.
4. Verify your email.
5. Hetzner may ask for **identity verification** (photo ID + selfie) for some regions/countries. Have your national ID or passport handy. It's usually approved within minutes to a few hours.

### 2. Create the server

In the **Hetzner Cloud Console** (console.hetzner.cloud):

1. **Add Server**.
2. **Location**: any — for Kenya, `fsn1` Frankfurt or `nbg1` Nuremberg (closest, cheapest).
3. **Image**: **Ubuntu 24.04** (or 22.04).
4. **Type**: **CX22** (2 vCPU / 4 GB RAM, ~€4.15/mo).
5. **SSH Key**: **Add SSH key** → name it `careersasa-worker` → paste your public key (see below).
6. **Name**: `careersasa-worker`.
7. Leave the rest default, click **Create & Buy**. Boot takes ~30 seconds.

### 3. First login (SSH)

From your computer:

```bash
# Windows PowerShell
ssh -i $HOME\.ssh\careersasa root@<SERVER_IP>

# macOS / Linux
ssh -i ~/.ssh/careersasa root@<SERVER_IP>
```

You'll land at a shell. Update packages once:

```bash
apt update && apt upgrade -y
```

### 4. Install Node.js 20+

```bash
# NodeSource installer for Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git
node --version   # should print v20.x
```

### 5. Deploy the worker

**Private repo?** You can't `git clone` it without credentials. Pick one:

- **Option A — GitHub deploy key (recommended, secure):**
  ```bash
  # On the server, generate a key pair for cloning
  ssh-keygen -t ed25519 -C "careersasa-worker" -f ~/.ssh/github_deploy
  cat ~/.ssh/github_deploy.pub   # copy this output
  ```
  Then on GitHub: repo → **Settings → Deploy keys → Add deploy key** → paste, tick "Allow write access" **off** (read-only is enough), save.
  ```bash
  # Back on the server, clone using the deploy key
  eval "$(ssh-agent -s)"
  ssh-add ~/.ssh/github_deploy
  git clone git@github.com:CareerSasaKenya/careerninja.git /opt/careerninja
  ```
- **Option B — Personal access token (PAT):**
  GitHub → profile → **Settings → Developer settings → Personal access tokens → Tokens (classic)** → Generate → scope **repo** → copy token.
  ```bash
  git clone https://<YOUR_GITHUB_USERNAME>:<TOKEN>@github.com/CareerSasaKenya/careerninja.git /opt/careerninja
  ```

Then, whichever option:

```bash
cd /opt/careerninja
npm install

# Env config
cp worker/.env.example worker/.env
nano worker/.env    # paste the same Supabase + AI keys as your Vercel project
```

> `npm install` pulls the full app dependency tree (Next.js, React, etc.) — heavy but harmless on 4 GB RAM. The worker only *executes* code under `worker/` + `src/lib/`.

### 6. Run as a service (systemd)

```bash
nano /etc/systemd/system/careersasa-worker.service
```

Paste:

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

Enable + start:

```bash
systemctl daemon-reload
systemctl enable --now careersasa-worker
systemctl status careersasa-worker     # should say "active (running)"
journalctl -u careersasa-worker -f      # live logs
```

### 7. First verification

```bash
cd /opt/careerninja
npm run worker:discover        # should queue new jobs into Supabase
npm run worker:process         # processes a few queued items
```

Then check the Admin → Scraper Sources page on Vercel — pending/done counts should move.

## Alternative: Oracle Cloud Always Free

A genuinely free-forever VPS: **2 OCPU / 12 GB RAM / 200 GB storage** (ARM Ampere A1). Only attempt this if you have a **physical Visa/Mastercard** — Oracle's card verification rejects PIN-based debit, virtual, prepaid, and mobile-money cards. See [oracle.com/cloud/free](https://www.oracle.com/cloud/free/) → sign up → **Compute → Instances → Create instance** → choose the **Ampere A1** shape, paste your public key, and log in as `ubuntu@<PUBLIC_IP>`.

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

The Vercel admin buttons can point here instead of running work inside Vercel API routes. If you do this, update `app/api/admin/scraper-sources/discover/route.ts` and `.../process/route.ts` to proxy to `http://<worker-ip>:8787`.

## Migrating off Vercel crons

Once the worker is stable, remove these entries from `vercel.json` to avoid double-running:

```json
{ "path": "/api/cron/scrape-discover", "schedule": "0 5 * * *" },
{ "path": "/api/cron/scrape-process", "schedule": "0 6 * * *" }
```

Double-running is safe anyway — `job_url` and `content_hash` dedup — but you don't want two sources of truth.

## Notes

- Env vars must match the Vercel app (same Supabase project).
- `SCRAPER_USER_ID` is still required — it's the user that owns scraped/published jobs (see `src/lib/scrapeProcess.ts`).
- AI enrichment uses the same provider chain as the app: **DeepSeek → Gemini**. Add `DEEPSEEK_API_KEY` to `.env` to use DeepSeek.
