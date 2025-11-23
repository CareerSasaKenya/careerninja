# Social Media Sharing Setup

## Overview
Job listings on CareerSasa now display custom thumbnails and metadata when shared on social media platforms (Facebook, LinkedIn, Twitter, WhatsApp, etc.).

## What Was Implemented

### 1. Dynamic Open Graph Meta Tags
Each job detail page now generates unique meta tags including:
- Custom title: "Job Title at Company Name"
- Description with job details and location
- Dynamic thumbnail image specific to each job
- Proper OG and Twitter Card tags

### 2. API Route for Thumbnail Generation
**Endpoint:** `/api/og/job/[id]`

This serverless function:
- Fetches job data from Supabase
- Generates an SVG thumbnail with:
  - Job title
  - Company name
  - Location
  - CareerSasa branding
  - Gradient background
- Returns cached SVG (1 hour cache)
- Falls back to default thumbnail if job not found

### 3. Server-Side Metadata Generation
- Created `app/jobs/[id]/layout.tsx` to handle metadata
- Created `app/jobs/[id]/metadata.ts` with generation logic
- Updated `app/layout.tsx` with default OG tags

### 4. Default Site Thumbnail
- Created `public/og-image.svg` for homepage and fallback

## Files Created/Modified

### New Files
```
app/jobs/[id]/layout.tsx          # Layout with metadata generation
app/jobs/[id]/metadata.ts         # Metadata generation logic
app/api/og/job/[id]/route.ts      # Thumbnail API endpoint
public/og-image.svg               # Default site thumbnail
test-og-tags.html                 # Testing guide
```

### Modified Files
```
app/layout.tsx                    # Added default OG tags
```

## How It Works

1. **User visits job page:** `/jobs/[id]`
2. **Server generates metadata:** Layout calls `generateJobMetadata()`
3. **Metadata includes thumbnail URL:** Points to `/api/og/job/[id]`
4. **Social media crawler visits page:** Reads OG meta tags
5. **Crawler fetches thumbnail:** Calls API endpoint
6. **API generates SVG:** Creates custom thumbnail with job details
7. **Social platform displays:** Shows custom thumbnail and metadata

## Testing

### Before Deployment
1. Run the development server
2. Visit a job detail page
3. View page source and verify meta tags are present

### After Deployment
1. Deploy to production (careersasa.co.ke)
2. Get a job detail URL
3. Test with these tools:
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Testing Steps
1. Paste your job URL into the validator
2. Click "Scrape" or "Preview"
3. Verify the thumbnail and metadata appear correctly
4. If needed, click "Scrape Again" to refresh cache

## Example Meta Tags Generated

```html
<meta property="og:title" content="Software Engineer at Tech Company - CareerSasa" />
<meta property="og:description" content="Apply for Software Engineer position at Tech Company in Nairobi..." />
<meta property="og:image" content="https://careersasa.co.ke/api/og/job/123" />
<meta property="og:url" content="https://careersasa.co.ke/jobs/123" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="CareerSasa" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Software Engineer at Tech Company - CareerSasa" />
<meta name="twitter:description" content="Apply for Software Engineer position..." />
<meta name="twitter:image" content="https://careersasa.co.ke/api/og/job/123" />
```

## Thumbnail Specifications

- **Format:** SVG (scalable, lightweight)
- **Dimensions:** 1200x630px (optimal for all platforms)
- **Cache:** 1 hour (3600 seconds)
- **Fallback:** Default CareerSasa thumbnail

## Supported Platforms

✅ Facebook
✅ LinkedIn
✅ Twitter/X
✅ WhatsApp
✅ Telegram
✅ Slack
✅ Discord
✅ Any platform supporting Open Graph protocol

## Troubleshooting

### Thumbnail not showing
- Ensure the site is deployed and accessible
- Check that the API route is working: visit `/api/og/job/[id]` directly
- Use Facebook Debugger to see what the crawler sees
- Clear social media cache using "Scrape Again"

### Wrong job data
- Verify Supabase connection
- Check job ID is correct
- Ensure job exists in database

### Caching issues
- Social platforms cache thumbnails for 24-48 hours
- Use platform-specific tools to force refresh
- Add cache-busting parameter for testing: `?v=2`

## Future Enhancements

Potential improvements:
- Add company logo to thumbnails
- Use PNG instead of SVG for better compatibility
- Add job category icons
- Include salary information if available
- A/B test different thumbnail designs
- Generate thumbnails at build time for popular jobs

## Notes

- The job detail page remains a client component for interactivity
- Metadata generation happens server-side via the layout
- API route uses Edge Runtime for fast global delivery
- SVG format chosen for simplicity and scalability
- Fallback ensures graceful degradation
