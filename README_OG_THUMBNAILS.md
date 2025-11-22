# Open Graph Thumbnail Generation

## Overview
This document explains how the Open Graph thumbnail generation feature works for social media sharing of job postings.

## How It Works
1. When a job details page is loaded, it dynamically generates a thumbnail using HTML5 Canvas
2. The thumbnail URL is set in the Open Graph meta tags for social media platforms
3. Social media platforms can access the thumbnail via a serverless API endpoint

## API Endpoint
The thumbnail generation API endpoint is:
```
GET /api/og/job/[id]
```

This endpoint:
- Fetches job data from Supabase
- Generates an SVG thumbnail with job details
- Returns the SVG with proper caching headers

## File Structure
```
/api/og/job/[id].ts     # Serverless function for thumbnail generation
/public/og-image.svg    # Default thumbnail for the site
/src/lib/ogUtils.ts     # Utility functions for OG thumbnail URLs
```

## Social Media Platforms Support
The implementation supports:
- Facebook
- Twitter
- LinkedIn
- WhatsApp
- Other platforms that use Open Graph tags

## Testing
To test the thumbnail generation:
1. Visit a job details page
2. Check the Open Graph meta tags in the HTML source
3. Verify the thumbnail URL points to `/api/og/job/[job-id]`
4. Access that URL directly to see the generated SVG thumbnail

## Caching
Thumbnails are cached for 1 hour to reduce server load:
```
Cache-Control: public, max-age=3600
```

## Fallbacks
If a job is not found or there's an error:
- A default thumbnail is returned
- The default thumbnail shows the CareerSasa branding

## Customization
To customize the thumbnail appearance:
1. Modify the SVG generation code in `/api/og/job/[id].ts`
2. Update colors in the linear gradient
3. Adjust text positioning and styling
4. Modify decorative elements

## Troubleshooting
Common issues:
1. **Thumbnail not appearing** - Check that the API endpoint is accessible
2. **Wrong job data** - Verify the Supabase query is correct
3. **Caching issues** - Test with cache-busting parameters