import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback
}

export const env = {
  supabaseUrl: required('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseServiceKey: required('SUPABASE_SERVICE_ROLE_KEY'),

  cronDiscover: optional('WORKER_CRON_DISCOVER', '0 5 * * *'),
  cronProcess: optional('WORKER_CRON_PROCESS', '*/15 * * * *'),
  processBatch: parseInt(optional('WORKER_PROCESS_BATCH', '10'), 10) || 10,
  /** Soft time budget per process run (ms). Defaults to 240s — safe under most hosts. */
  processBudgetMs: parseInt(optional('WORKER_PROCESS_BUDGET_MS', '240000'), 10) || 240000,

  httpPort: process.env.WORKER_HTTP_PORT ? parseInt(process.env.WORKER_HTTP_PORT, 10) : 0,
  workerSecret: optional('WORKER_SECRET', ''),
}
