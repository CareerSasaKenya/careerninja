/**
 * Live probe for Kenyan Taleo Enterprise boards.
 * Usage: node scripts/verify-taleo-sources.mjs
 */

const boards = [
  ['Equity Bank', 'equitybank.taleo.net', 'ext_new'],
  ['Britam', 'britam.taleo.net', 'ke'],
  ['Aga Khan University', 'aku.taleo.net', 'ex'],
]

async function probe(name, host, section) {
  const listUrl = `https://${host}/careersection/${section}/jobsearch.ftl?lang=en`
  const listRes = await fetch(listUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; careersasa-probe/1.0)' },
  })
  if (!listRes.ok) return `${name}: jobsearch HTTP ${listRes.status}`
  const html = await listRes.text()
  const portal = html.match(/portalNo\s*[:=]\s*['"]?(\d+)/i)?.[1]
  if (!portal) {
    // Legacy joblist boards (e.g. AKU) embed listings in initialHistory.
    const listUrl = `https://${host}/careersection/${section}/joblist.ftl?lang=en`
    const listRes = await fetch(listUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; careersasa-probe/1.0)' },
    })
    if (!listRes.ok) return `${name}: no portal; joblist HTTP ${listRes.status}`
    const listHtml = await listRes.text()
    const history = listHtml.match(/id=["']initialHistory["'][^>]*value=["']([^"']*)["']/i)?.[1] || ''
    const decoded = decodeURIComponent(history.replace(/\+/g, ' '))
    const ke = (decoded.match(/Kenya/gi) || []).length
    return `${name} (${host}/${section}): legacy-joblist kenya_mentions=${ke}`
  }
  const cookie = (listRes.headers.getSetCookie?.() || [])
    .map(c => c.split(';')[0])
    .join('; ')

  const searchRes = await fetch(
    `https://${host}/careersection/rest/jobboard/searchjobs?lang=en&portal=${portal}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; careersasa-probe/1.0)',
        tz: 'GMT+03:00',
        tzname: 'Africa/Nairobi',
        Origin: `https://${host}`,
        Referer: listUrl,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify({
        multilineEnabled: false,
        sortingSelection: {
          sortBySelectionParam: '3',
          ascendingSortingOrder: 'false',
        },
        fieldData: { fields: { KEYWORD: '', LOCATION: '' }, valid: true },
        filterSelectionParam: {
          searchFilterSelections: [
            { id: 'LOCATION', selectedValues: [] },
            { id: 'JOB_FIELD', selectedValues: [] },
          ],
        },
        advancedSearchFiltersSelectionParam: {
          searchFilterSelections: [{ id: 'LOCATION', selectedValues: [] }],
        },
        pageNo: 1,
      }),
    }
  )
  if (!searchRes.ok) return `${name}: searchjobs HTTP ${searchRes.status}`
  const data = await searchRes.json()
  const jobs = data.requisitionList || []
  const ke = jobs.filter(j =>
    String(j.column?.[1] || '')
      .toLowerCase()
      .includes('kenya')
  )
  return `${name} (${host}/${section}): total=${data.pagingData?.totalCount ?? jobs.length}, page=${jobs.length}, ke=${ke.length}, portal=${portal}`
}

console.log('=== Taleo Enterprise (Kenya) ===')
for (const [name, host, section] of boards) {
  console.log(await probe(name, host, section))
}
