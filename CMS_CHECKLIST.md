# ✅ CMS Implementation Checklist

## Phase 1: Setup (5 minutes)

### Database Setup
- [ ] Open Supabase Dashboard
- [ ] Navigate to SQL Editor
- [ ] Create new query
- [ ] Copy content from `supabase/migrations/20260210_create_page_content.sql`
- [ ] Paste and run the migration
- [ ] Verify no errors in output
- [ ] Check that `page_content` table exists in Table Editor

### Verification
- [ ] Run setup checker: `node scripts/check-cms-setup.js`
- [ ] Verify all checks pass (✅)
- [ ] Confirm default content was inserted

## Phase 2: Test Admin Interface (5 minutes)

### Access Editor
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to `http://localhost:3000/dashboard/content-editor`
- [ ] Verify you can see the interface
- [ ] Check all page tabs are visible (Homepage, CV Services, etc.)

### Test Editing
- [ ] Click on "Homepage" tab
- [ ] Find `hero_title` section
- [ ] Click "Edit" button
- [ ] Change the text to "Test Title"
- [ ] Click "Save Changes"
- [ ] Verify success message appears
- [ ] Verify content updates in the list

### Test Adding
- [ ] Scroll to "Add New Content Section"
- [ ] Fill in:
  - Section Key: `test_section`
  - Content Type: `text`
  - Content Value: `This is a test`
- [ ] Click "Create Content Section"
- [ ] Verify success message
- [ ] Verify new section appears in list

### Test Deleting
- [ ] Find the `test_section` you just created
- [ ] Click the trash icon
- [ ] Confirm deletion
- [ ] Verify success message
- [ ] Verify section is removed from list

## Phase 3: Integrate into Homepage (15 minutes)

### Update Homepage
- [ ] Open `app/page.tsx`
- [ ] Add import: `import { usePageContent, getContentValue } from "@/hooks/usePageContent";`
- [ ] Add hook: `const { data: content } = usePageContent("home");`
- [ ] Replace hardcoded hero title with: `{getContentValue(content, "hero_title", "Your Dream Career Starts Here")}`
- [ ] Replace hardcoded stats with CMS values
- [ ] Test the page loads correctly
- [ ] Verify content displays

### Test Live Updates
- [ ] Keep homepage open in browser
- [ ] Open `/dashboard/content-editor` in new tab
- [ ] Edit `hero_title` to something different
- [ ] Save changes
- [ ] Refresh homepage
- [ ] Verify new title appears

## Phase 4: Integrate Service Pages (30 minutes)

### CV Services Page
- [ ] Open `app/services/cv/page.tsx`
- [ ] Add CMS imports
- [ ] Add `usePageContent("services-cv")` hook
- [ ] Replace hero title with CMS content
- [ ] Replace hero subtitle with CMS content
- [ ] Replace hero description with CMS content
- [ ] Test page loads correctly

### LinkedIn Services Page
- [ ] Open `app/services/linkedin/page.tsx`
- [ ] Add CMS imports
- [ ] Add `usePageContent("services-linkedin")` hook
- [ ] Replace hero sections with CMS content
- [ ] Test page loads correctly

### Cover Letter Services Page
- [ ] Open `app/services/cover-letter/page.tsx`
- [ ] Add CMS imports
- [ ] Add `usePageContent("services-cover-letter")` hook
- [ ] Replace hero sections with CMS content
- [ ] Test page loads correctly

## Phase 5: Add More Content (Ongoing)

### Identify Editable Content
- [ ] Review each page
- [ ] List all text that should be editable
- [ ] Prioritize most frequently changed content

### Add to CMS
For each piece of content:
- [ ] Go to `/dashboard/content-editor`
- [ ] Select appropriate page tab
- [ ] Click "Add New Content Section"
- [ ] Fill in section key (descriptive, snake_case)
- [ ] Choose appropriate content type
- [ ] Enter content value
- [ ] Save

### Update Code
For each piece of content:
- [ ] Open the page file
- [ ] Replace hardcoded text with `getContentValue()`
- [ ] Provide appropriate fallback
- [ ] Test the change

## Phase 6: Documentation (10 minutes)

### Team Training
- [ ] Share `CMS_SETUP_README.md` with team
- [ ] Walk through admin interface
- [ ] Show how to edit content
- [ ] Show how to add new content
- [ ] Explain content types

### Create Content Guide
- [ ] Document all section keys
- [ ] Document which page each key belongs to
- [ ] Document content types for each key
- [ ] Document any special formatting rules

## Phase 7: Production Deployment

### Pre-Deployment
- [ ] Test all pages locally
- [ ] Verify all content loads correctly
- [ ] Check for console errors
- [ ] Test on mobile devices
- [ ] Test with slow network

### Deployment
- [ ] Commit all changes to git
- [ ] Push to repository
- [ ] Deploy to production
- [ ] Run migration on production Supabase
- [ ] Verify production site works

### Post-Deployment
- [ ] Test admin interface on production
- [ ] Edit a piece of content
- [ ] Verify changes appear on live site
- [ ] Check analytics for errors
- [ ] Monitor Supabase logs

## Phase 8: Optimization (Optional)

### Performance
- [ ] Check page load times
- [ ] Verify React Query caching works
- [ ] Monitor Supabase query performance
- [ ] Add loading states if needed

### Security
- [ ] Review RLS policies
- [ ] Add admin role checks if needed
- [ ] Audit who has edit access
- [ ] Set up content approval workflow (if needed)

### Features
- [ ] Add image upload capability
- [ ] Add content versioning
- [ ] Add preview mode
- [ ] Add scheduled publishing
- [ ] Add multi-language support

## Maintenance Checklist (Weekly)

### Content Review
- [ ] Review recent content changes
- [ ] Check for typos or errors
- [ ] Verify all links work
- [ ] Update outdated information

### Technical Review
- [ ] Check Supabase logs for errors
- [ ] Monitor query performance
- [ ] Review user feedback
- [ ] Update documentation if needed

## Troubleshooting Checklist

### Content Not Showing
- [ ] Check if migration ran successfully
- [ ] Verify page_slug matches in code and database
- [ ] Verify section_key matches
- [ ] Check browser console for errors
- [ ] Check Supabase connection

### Can't Edit Content
- [ ] Verify user is authenticated
- [ ] Check RLS policies in Supabase
- [ ] Verify user has correct permissions
- [ ] Check browser console for errors

### Performance Issues
- [ ] Check React Query cache settings
- [ ] Verify Supabase connection pooling
- [ ] Check for unnecessary re-renders
- [ ] Monitor network requests

## Success Criteria

### Phase 1 Complete When:
- [x] Migration runs without errors
- [x] Table exists in Supabase
- [x] Default content is inserted
- [x] Setup checker passes all tests

### Phase 2 Complete When:
- [ ] Admin interface loads
- [ ] Can view all page tabs
- [ ] Can edit existing content
- [ ] Can add new content
- [ ] Can delete content

### Phase 3 Complete When:
- [ ] Homepage uses CMS content
- [ ] Content displays correctly
- [ ] Live updates work
- [ ] No console errors

### Phase 4 Complete When:
- [ ] All service pages use CMS
- [ ] All content displays correctly
- [ ] No console errors
- [ ] Mobile responsive

### Phase 5 Complete When:
- [ ] All frequently changed content is in CMS
- [ ] All section keys are documented
- [ ] Team can edit without help

### Phase 6 Complete When:
- [ ] Team is trained
- [ ] Documentation is complete
- [ ] Content guide exists

### Phase 7 Complete When:
- [ ] Production deployment successful
- [ ] All pages work on production
- [ ] Admin interface works on production
- [ ] No errors in logs

## Quick Reference

### Files Created
- ✅ `src/hooks/usePageContent.ts` - React hook
- ✅ `app/dashboard/content-editor/page.tsx` - Admin interface
- ✅ `supabase/migrations/20260210_create_page_content.sql` - Database schema
- ✅ `scripts/check-cms-setup.js` - Setup verification
- ✅ `app/page-example-with-cms.tsx` - Example implementation
- ✅ `CMS_SETUP_README.md` - Quick start guide
- ✅ `CONTENT_MANAGEMENT_GUIDE.md` - Full documentation
- ✅ `CMS_ARCHITECTURE.md` - Technical details
- ✅ `CMS_VISUAL_GUIDE.md` - Visual walkthrough
- ✅ `CMS_SUMMARY.md` - Overview
- ✅ `CMS_CHECKLIST.md` - This file

### Key URLs
- Admin Interface: `/dashboard/content-editor`
- Supabase Dashboard: https://supabase.com/dashboard
- Documentation: See files above

### Key Commands
```bash
# Verify setup
node scripts/check-cms-setup.js

# Start dev server
npm run dev

# Deploy
git push origin main
```

## Notes

- Check off items as you complete them
- Don't skip verification steps
- Test thoroughly before production
- Keep documentation updated
- Train team members properly

## Status Tracking

**Current Phase**: _______________

**Started**: _______________

**Completed**: _______________

**Team Members Trained**: _______________

**Pages Integrated**: _____ / _____

**Content Sections Added**: _____

**Issues Found**: _____

**Issues Resolved**: _____

---

**Last Updated**: February 10, 2026
