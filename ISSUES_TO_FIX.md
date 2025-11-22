# Critical Issues to Fix Before Deployment

## Status: Jobs page filters ARE working
- Desktop: Sidebar filters visible
- Mobile: Advanced search toggle button
- **This is NOT an issue**

## Issue 1: Job Details Page - "Job Not Found"
**Problem:** When clicking "View Details" on job cards, page loads slowly then shows "job not found"

**Likely Cause:** 
- Job slug/ID mismatch
- Database query issue
- The query tries slug first, then ID - both should work

**To Test:**
1. Check browser console for errors
2. Check if job has `job_slug` field populated
3. Verify Supabase connection

## Issue 2: Job Details Page - Missing Fields
**Problem:** Job details page doesn't show all fields that were in Vite version

**Need to compare:**
- Old: `src/pages-old/JobDetails.tsx`
- New: `app/jobs/[id]/page.tsx`

**Fields to verify:**
- Job description
- Requirements
- Responsibilities
- Benefits
- Company info
- Application method
- Salary details
- Location details
- Skills required

## Issue 3: Footer Links
**Status:** Footer links ARE using `href` correctly - **NOT an issue**

## Next Steps:
1. Start dev server: Use controlPwshProcess
2. Test job details page with browser console open
3. Compare rendered fields between old and new versions
4. Fix any missing data queries
