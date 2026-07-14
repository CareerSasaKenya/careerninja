/**
 * Extract plain text from a PDF buffer (Node.js / serverless).
 */

import { PDFParse } from 'pdf-parse'

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    return result.text?.trim() || ''
  } finally {
    await parser.destroy()
  }
}

export async function downloadPdfBuffer(url: string): Promise<Buffer> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; careersasa-scraper/1.0)',
        Accept: 'application/pdf,*/*',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to download PDF (${response.status}): ${url}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } finally {
    clearTimeout(timeout)
  }
}
