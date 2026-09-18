/**
 * Run: npx tsx src/lib/scholarshipFeedAdapter.test.ts
 */
import assert from 'node:assert/strict'
import {
  extractListingLinks,
  extractOfficialApplyUrl,
  isAwardListing,
  isKenyaOrAfricaListing,
  itemPassesFilters,
  normalizeScholarshipFeedJob,
  parseRssItems,
  parseScholarshipDetailHtml,
  parseWpRestPosts,
  urlMatchesInclude,
  type ScholarshipFeedConfig,
} from './scholarshipFeedAdapter'

const config: ScholarshipFeedConfig = {
  type: 'scholarship_feed',
  company: 'Opportunity Desk',
  kenyaOrAfricaOnly: true,
  scholarshipOnly: true,
}

assert.equal(isAwardListing('Mastercard Foundation Scholarship 2027'), true)
assert.equal(isAwardListing('DAAD Fellowship for African Researchers'), true)
assert.equal(isAwardListing('Fully Funded Masters in the UK', 'Scholarships'), true)
assert.equal(isAwardListing('CANEX Create-Thon 2026 ($50,000 prize pool)', 'Africa, Contests'), false)
assert.equal(isAwardListing('Sales Executive', 'Jobs'), false)
assert.equal(isAwardListing('Internship Programme 2026', 'Internships'), false)
assert.equal(
  isAwardListing(
    'Kectil Program 2027 for Young Leaders',
    'Africa',
    'A leadership scholarship for young Africans'
  ),
  false
)

assert.equal(isKenyaOrAfricaListing('Chevening Scholarships', 'Kenya'), true)
assert.equal(isKenyaOrAfricaListing('Teach for Uganda STEM Fellowship', 'Africa'), true)
assert.equal(isKenyaOrAfricaListing('Gates Cambridge Scholarship', 'Developing Countries'), true)
assert.equal(isKenyaOrAfricaListing('California Documentary Project Grants', 'America'), false)

assert.equal(
  itemPassesFilters(
    {
      title: 'Commonwealth Master’s Scholarships',
      categories: 'Africa, Scholarships',
      html: '',
    },
    config
  ),
  true
)
assert.equal(
  itemPassesFilters(
    { title: 'CANEX Create-Thon 2026', categories: 'Africa, Contests', html: '' },
    config
  ),
  false
)

assert.equal(
  urlMatchesInclude(
    'https://opportunitydesk.org/2026/09/16/canex-create-thon-2026/',
    'opportunitydesk\\.org/\\d{4}/\\d{2}/'
  ),
  true
)
assert.equal(
  urlMatchesInclude('https://opportunitydesk.org/category/scholarships/', 'opportunitydesk\\.org/\\d{4}/\\d{2}/'),
  false
)
assert.equal(
  urlMatchesInclude(
    'https://www.scholars4dev.com/2489/cud-development-scholarships-for-developing-countries/',
    'scholars4dev\\.com/\\d+/'
  ),
  true
)

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Opportunity Desk</title>
    <link>https://opportunitydesk.org</link>
    <item>
      <title>Mastercard Foundation Scholarship 2027 for Africans</title>
      <link>https://opportunitydesk.org/2026/09/10/mastercard-foundation-scholarship-2027/</link>
      <pubDate>Wed, 10 Sep 2026 10:00:00 +0000</pubDate>
      <category><![CDATA[Africa]]></category>
      <category><![CDATA[Scholarships]]></category>
      <description><![CDATA[Deadline: January 15, 2027 Fully funded scholarship for African students.]]></description>
    </item>
    <item>
      <title>Hot Jobs: Communications Officer</title>
      <link>https://opportunitydesk.org/2026/09/11/communications-officer/</link>
      <category>Jobs</category>
      <description>A paid job opening in Nairobi.</description>
    </item>
  </channel>
</rss>`

const rssItems = parseRssItems(rss)
assert.equal(rssItems.length, 2)
assert.equal(rssItems[0].title, 'Mastercard Foundation Scholarship 2027 for Africans')
assert.equal(
  rssItems[0].url,
  'https://opportunitydesk.org/2026/09/10/mastercard-foundation-scholarship-2027/'
)
assert.match(rssItems[0].categories, /Africa/)
assert.match(rssItems[0].categories, /Scholarships/)
assert.match(rssItems[0].html, /Fully funded/)
assert.ok(rssItems[0].datePosted)
assert.equal(
  itemPassesFilters(rssItems[0], config),
  true
)
assert.equal(itemPassesFilters(rssItems[1], config), false)

const wpJson = JSON.stringify([
  {
    link: 'https://www.scholars4dev.com/2489/cud-development-scholarships-for-developing-countries/',
    date: '2026-08-24T21:51:12',
    title: { rendered: 'ARES Scholarships in Belgium for Developing Countries' },
    content: { rendered: '<p>Scholarships for students from developing countries including Kenya.</p>' },
  },
])
const wpItems = parseWpRestPosts(wpJson)
assert.equal(wpItems.length, 1)
assert.equal(wpItems[0].title, 'ARES Scholarships in Belgium for Developing Countries')
assert.equal(itemPassesFilters(wpItems[0], config), true)

const listingHtml = `
<html><body>
  <a href="/2489/cud-development-scholarships-for-developing-countries/">ARES Scholarships in Belgium</a>
  <a href="/category/country/africa-scholarships/">Africa</a>
  <a href="/about/">About</a>
</body></html>
`
const listing = extractListingLinks(
  listingHtml,
  'https://www.scholars4dev.com/category/country/africa-scholarships/',
  'scholars4dev\\.com/\\d+/'
)
assert.equal(listing.length, 1)
assert.equal(
  listing[0].url,
  'https://www.scholars4dev.com/2489/cud-development-scholarships-for-developing-countries/'
)

const detailHtml = `
<html><head>
  <meta property="og:title" content="Mastercard Foundation Scholarship 2027 | Opportunity Desk">
</head>
<body>
  <article>
    <div class="entry-content">
      <p>Deadline: 15 January 2027. Fully funded scholarships for African students.</p>
      <p><a href="https://mastercardfdn.org/apply">Visit the official webpage</a></p>
      <p><a href="https://opportunitydesk.org/tag/mastercard/">More on Opportunity Desk</a></p>
    </div>
  </article>
</body></html>
`
const detail = parseScholarshipDetailHtml(
  detailHtml,
  'https://opportunitydesk.org/2026/09/10/mastercard-foundation-scholarship-2027/',
  config
)
assert.equal(detail.title, 'Mastercard Foundation Scholarship 2027')
assert.equal(detail.company, 'Opportunity Desk')
assert.equal(detail.applyLink, 'https://mastercardfdn.org/apply')
assert.equal(detail.occupationalCategory, 'Bursary and Scholarships')
assert.equal(detail.validThrough, '2027-01-15')
assert.match(detail.descriptionHtml, /Fully funded/)

const sameHostApply = extractOfficialApplyUrl(
  '<a href="/apply">Apply now</a>',
  'https://www.chevening.org/scholarships/'
)
assert.equal(sameHostApply, 'https://www.chevening.org/apply')

const officialBeatsNav = extractOfficialApplyUrl(
  `
    <a href="/category/call-for-applications/">Call for Applications</a>
    <a href="https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/">Visit the Official Webpage of the Commonwealth Master’s Scholarships</a>
  `,
  'https://www.opportunitiesforafricans.com/commonwealth-masters-scholarships-2027-2028/'
)
assert.equal(
  officialBeatsNav,
  'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/'
)

const configured = extractOfficialApplyUrl(
  '<a href="https://other.org/x">Official webpage</a>',
  'https://www.chevening.org/scholarships/',
  'https://www.chevening.org/apply/'
)
assert.equal(configured, 'https://www.chevening.org/apply/')

const programme = parseScholarshipDetailHtml(
  '<html><body><p>short</p></body></html>',
  'https://ke.usembassy.gov/u-s-kenya-exchange-programs/',
  {
    type: 'scholarship_feed',
    company: 'Fulbright Kenya',
    fallbackTitle: 'U.S. – Kenya Exchange Programs (Fulbright)',
    fallbackHtml: '<p>Fulbright and other U.S. exchange awards for Kenyans.</p>',
    applyUrl: 'https://ke.usembassy.gov/u-s-kenya-exchange-programs/',
  }
)
assert.equal(programme.title, 'U.S. – Kenya Exchange Programs (Fulbright)')
assert.match(programme.descriptionHtml, /Fulbright/)
assert.equal(programme.applicationUrl, 'https://ke.usembassy.gov/u-s-kenya-exchange-programs/')

const normalized = normalizeScholarshipFeedJob(detail)
assert.equal(normalized.company, 'Opportunity Desk')
assert.equal(normalized.apply_link, 'https://mastercardfdn.org/apply')
assert.match(normalized.tags, /Bursary and Scholarships/)
assert.equal(normalized.job_location_country, 'Kenya')

const cscPage = parseScholarshipDetailHtml(
  `<html><head><meta property="og:title" content="Commonwealth Master’s Scholarships - Commonwealth Scholarship Commission in the UK"></head>
  <body><article><div class="entry-content"><p>${'Eligibility and nominating agencies for Kenyan applicants. '.repeat(8)}</p></div></article></body></html>`,
  'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/',
  {
    type: 'scholarship_feed',
    company: 'Commonwealth Scholarship Commission',
    applyUrl: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/',
  }
)
assert.equal(cscPage.title, 'Commonwealth Master’s Scholarships')

console.log('scholarshipFeedAdapter.test.ts: all assertions passed')
