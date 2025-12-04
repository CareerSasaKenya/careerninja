# MyJobMag Kenya Job Scraper - n8n Workflow Setup Guide

## Overview
This n8n workflow automatically scrapes job listings from myjobmag.co.ke, transforms the data to match your Supabase schema, and triggers Next.js revalidation.

## Workflow Architecture

### Phase 1: Scrape Listing Pages
- **Schedule Trigger**: Runs every 6 hours
- **Fetch Job Listings Page**: Gets the main jobs page HTML
- **Extract Job URLs**: Parses HTML to find all job detail page URLs

### Phase 2: Process Job Details
- **Split In Batches**: Processes 5 jobs at a time to avoid overwhelming the server
- **Fetch Job Detail Page**: Gets individual job page HTML
- **Extract Job Data**: Uses CSS selectors to extract key fields

### Phase 3: Transform & Store
- **Transform Data**: Maps scraped data to your Supabase schema
- **Upsert to Supabase**: Inserts new jobs or updates existing ones (based on `identifier` field)
- **Wait (Rate Limiting)**: 2-second delay between requests to be respectful

### Phase 4: Finalize
- **Trigger Next.js Revalidation**: Calls your revalidation API endpoint
- **Generate Summary**: Logs statistics about the scraping run

## Setup Instructions

### 1. Import Workflow to n8n
1. Open your n8n instance
2. Click "Import from File" or "Import from URL"
3. Select `n8n-myjobmag-scraper-workflow.json`
4. The workflow will be imported with all nodes configured

### 2. Configure Supabase Credentials
1. In n8n, go to **Credentials** → **Add Credential**
2. Select **Supabase**
3. Enter your credentials:
   - **Host**: `https://qxuvqrfqkdpfjfwkqatf.supabase.co`
   - **Service Role Key**: (You'll need to get this from Supabase dashboard)
4. Name it: `Supabase CareerNinja`
5. Save the credential

### 3. Create Next.js Revalidation API Endpoint

Create a new file: `careerninja/app/api/revalidate/route.ts`

```typescript
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, secret } = body;

    // Verify secret token
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      );
    }

    // Revalidate the specified path
    revalidatePath(path || '/jobs');
    
    return NextResponse.json({
      revalidated: true,
      path: path || '/jobs',
      now: Date.now()
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 }
    );
  }
}
```

### 4. Add Environment Variables

Add to your `.env` file:
```
REVALIDATE_SECRET=your-secret-token-here
```

Also add this to n8n environment variables:
- Go to n8n Settings → Environment Variables
- Add: `REVALIDATE_SECRET=your-secret-token-here`

### 5. Update Revalidation URL
In the workflow, update the "Trigger Next.js Revalidation" node:
- Replace `https://your-domain.vercel.app/api/revalidate` with your actual domain

### 6. Get Supabase Service Role Key
1. Go to your Supabase dashboard
2. Navigate to Settings → API
3. Copy the **service_role** key (not the anon key)
4. Use this in your n8n Supabase credential

## Important Notes

### CSS Selectors May Need Adjustment
The workflow uses generic CSS selectors. You'll need to inspect myjobmag.co.ke and update them:

1. Visit https://www.myjobmag.co.ke/jobs
2. Right-click → Inspect Element
3. Find the actual class names for:
   - Job title
   - Company name
   - Location
   - Description
   - Salary
   - Employment type
   - Deadline
   - Posted date

4. Update the selectors in the "Extract Job Data" node

### Field Mapping
The workflow maps scraped data to these Supabase fields:

| Scraped Field | Supabase Column | Type |
|--------------|-----------------|------|
| title | title | TEXT |
| company | company, hiring_organization_name | TEXT |
| location | location, job_location_city, job_location_county | TEXT |
| description | description | TEXT |
| salary | salary, salary_min, salary_max | TEXT/INTEGER |
| employmentType | employment_type | ENUM |
| deadline | valid_through | TIMESTAMP |
| postedDate | date_posted | TIMESTAMP |
| jobUrl | apply_link, application_url, identifier | TEXT |

### Deduplication Strategy
Jobs are deduplicated using the `identifier` field (set to the job URL). If a job with the same URL already exists, it will be updated instead of creating a duplicate.

### Rate Limiting
The workflow includes a 2-second delay between requests. Adjust this in the "Wait (Rate Limiting)" node if needed.

### Error Handling
If a job fails to scrape or insert:
- The workflow continues with the next job
- Errors are logged in n8n execution logs
- Check the "Generate Summary" node output for statistics

## Testing the Workflow

### Manual Test Run
1. In n8n, open the workflow
2. Click "Execute Workflow" button
3. Watch the execution flow through each node
4. Check the output of each node for data
5. Verify jobs appear in your Supabase database

### Check Supabase
```sql
-- View recently scraped jobs
SELECT title, company, location, source, created_at
FROM jobs
WHERE source = 'Scraper'
ORDER BY created_at DESC
LIMIT 10;
```

### Test Revalidation
```bash
curl -X POST https://your-domain.vercel.app/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"path": "/jobs", "secret": "your-secret-token-here"}'
```

## Monitoring & Maintenance

### Schedule Adjustments
The workflow runs every 6 hours by default. To change:
1. Edit the "Schedule Trigger" node
2. Adjust the interval (e.g., every 12 hours, daily, etc.)

### Logs
Check n8n execution history for:
- Number of jobs scraped
- Success/failure rates
- Error messages
- Execution time

### Common Issues

**Issue**: No jobs found
- **Solution**: Update CSS selectors to match current site structure

**Issue**: Supabase insert fails
- **Solution**: Check that all required fields are populated
- Verify service role key has insert permissions

**Issue**: Revalidation fails
- **Solution**: Verify REVALIDATE_SECRET matches in both n8n and Next.js
- Check that the API endpoint URL is correct

**Issue**: Rate limiting / IP blocked
- **Solution**: Increase wait time between requests
- Consider using a proxy or rotating IPs

## Advanced Customizations

### Add More Job Sites
Duplicate the workflow and change:
- The listing page URL
- CSS selectors
- URL extraction pattern

### Add Email Notifications
Add an "Send Email" node after "Generate Summary" to get notified of scraping results.

### Add Slack Notifications
Add a "Slack" node to post summaries to a channel.

### Filter Jobs
Add a "Filter" node after "Transform Data" to only insert jobs matching certain criteria (e.g., specific locations, salary ranges).

### Enrich Data
Add additional nodes to:
- Lookup company information
- Geocode locations
- Categorize jobs by industry
- Extract skills from descriptions using AI

## Support

For issues with:
- **n8n workflow**: Check n8n community forums
- **Supabase integration**: Review Supabase documentation
- **Next.js revalidation**: Check Next.js docs on ISR

## License
This workflow is provided as-is for use with the CareerNinja project.
