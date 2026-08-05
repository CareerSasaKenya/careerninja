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

## Setup on a cloud VM (Hetzner / Oracle Cloud / any Ubuntu VPS)

The worker lives inside the same repo as the Vercel app and shares its `node_modules`, so a single install is enough.

```bash
# 1. Clone the repo on the server
git clone <your-repo-url> careerninja
cd careerninja

# 2. Install everything (app + worker deps)
npm install

# 3. Configure worker env
cp worker/.env.example worker/.env
nano worker/.env   # add SUPABASE_URL, SERVICE_ROLE_KEY, DEEPSEEK_API_KEY
```

> Note: `npm install` is run from the repo root, not from `worker/`.

## Oracle Cloud Always Free setup (step by step)

A genuinely free-forever VPS: **2 OCPU / 12 GB RAM / 200 GB storage** (ARM Ampere A1). This is the only major free tier that never expires.

### 1. Create the account

1. Go to **oracle.com/cloud/free** → **Start for free**.
2. Fill in your details (name, email, country). You'll need a **credit/debit card** — a small temporary hold appears then is removed. As long as you stay inside Always Free limits, **you are never charged**.
3. Verify your email and phone.
4. Sign in to the OCI console.

> If signup asks you to "upgrade to Pay As You Go": you can, and it still doesn't charge while you stay inside Always Free limits — it just fixes provisioning capacity issues. Set a **budget alert** (Billing → Budgets, e.g. $1) so you'd be warned if anything ever tried to bill.

### 2. Create the VM instance

1. In the console: menu → **Compute → Instances → Create instance**.
2. Name it `careersasa-worker`.
3. **Placement / Image and shape**: keep defaults.
   - **Image**: select **Canonical Ubuntu 22.04 (or 24.04)** (Minimal or Full both fine).
   - **Shape**: choose **Ampere (ARM) — VM.Standard.A1.Flex**. Set:
     - OCPUs: **2**
     - Memory: **12 GB** (within the Always Free limit).
   - > If you get an "out of host capacity" error, try a different **Availability Domain** (the dropdown above), or wait a few minutes, or upgrade to PAYG as noted above.
4. **Networking**: keep the defaults (a new VCN + subnet will be created). Make sure the security list allows **SSH (port 22)** — it does by default.
5. **Add SSH keys**:
   - On your computer, generate a key pair if you don't have one:
     - **Windows PowerShell:**
       ```powershell
       ssh-keygen -t ed25519 -C "careersasa-worker" -f $HOME\.ssh\careersasa
       ```
     - **macOS / Linux:**
       ```bash
       ssh-keygen -t ed25519 -C "careersasa-worker" -f ~/.ssh/careersasa
       ```
   - Choose **Paste public keys**, and paste the contents of `careersasa.pub` into the box.
6. Click **Create**. Wait ~1–2 minutes for it to reach "Running".
7. Copy the **Public IP address** from the instance page.

### 3. First login (SSH)

```bash
# From your computer (adjust path/username to what you chose)
ssh -i ~/.ssh/careersasa ubuntu@<PUBLIC_IP>
```

You'll land at a shell on the new VM. Run these once to be up to date:

```bash
sudo apt update && sudo apt upgrade -y
```

> **Keep this VM busy.** Oracle reclaims Always Free instances that sit near-zero CPU/RAM for ~7 days. Your scheduler runs every 15 minutes, which keeps it alive. If it ever stops, just start it again from the console.

### 4. Install Node.js 20+

```bash
# NodeSource installer for Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
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

> `npm install` pulls the full app dependency tree (Next.js, React, etc.) — heavy but harmless on 12 GB RAM. The worker only *executes* code under `worker/` + `src/lib/`.

### 6. Run as a service (systemd)

```bash
sudo nano /etc/systemd/system/careersasa-worker.service
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
sudo systemctl daemon-reload
sudo systemctl enable --now careersasa-worker
sudo systemctl status careersasa-worker     # should say "active (running)"
journalctl -u careersasa-worker -f          # live logs
```

### 7. First verification

```bash
cd /opt/careerninja
npm run worker:discover        # should queue new jobs into Supabase
npm run worker:process         # processes a few queued items
```

Then check the Admin → Scraper Sources page on Vercel — pending/done counts should move.

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
