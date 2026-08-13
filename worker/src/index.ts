import { env } from './env'
import { runDiscover, runEnrich, runProcess } from './jobs'
import { startScheduler } from './scheduler'
import { startServer } from './server'

const mode = process.argv[2] || 'schedule'
const extra = process.argv[3]

async function main() {
  switch (mode) {
    case 'discover':
      console.log(JSON.stringify(await runDiscover(extra || undefined), null, 2))
      break

    case 'process': {
      const batch = extra ? parseInt(extra, 10) || 1 : env.processBatch
      console.log(`[worker] processing batch of ${batch}`)
      console.log(JSON.stringify(await runProcess(batch), null, 2))
      break
    }

    case 'enrich': {
      // tsx worker/src/index.ts enrich [scraped|sparse] [limit] [source_id]
      const enrichMode = extra === 'sparse' ? 'sparse' : 'scraped'
      const limit = parseInt(process.argv[4], 10) || 10
      const sourceId = process.argv[5]
      console.log(
        JSON.stringify(await runEnrich({ mode: enrichMode, limit, sourceId }), null, 2)
      )
      break
    }

    case 'schedule':
      startScheduler()
      startServer()
      // Keep the process alive for cron to fire
      setInterval(() => {}, 1 << 30)
      break

    case 'server':
      startServer()
      setInterval(() => {}, 1 << 30)
      break

    default:
      console.error(
        'Usage: tsx src/index.ts <discover|process [batch]|enrich [scraped|sparse] [limit] [source_id]|schedule|server>'
      )
      process.exit(1)
  }
}

main().catch((err) => {
  console.error('[worker] fatal:', err instanceof Error ? err.message : err)
  process.exit(1)
})
