# Application System Setup Guide

## Overview
This guide covers the complete job application system implementation including database schema, file uploads, and application tracking.

## Step 1.2 Completed Features

### 1. Database Schema Updates
✅ Updated `job_applications` table with full application data:
- Personal info (full_name, email, phone)
- Professional details (years_experience, expected_salary)
- Application data (cover_letter, application_method)
- CV storage (cv_file_url, cv_file_name, cv_file_size)
- Status tracking with enum type
- Timestamps (created_at, updated_at)

### 2. Supabase Storage Setup
✅ Created `application-cvs` storage bucket
✅ Implemented RLS policies for CV uploads:
- Users can upload their own CVs
- Users can view their own CVs
- Employers can view CVs for applications to their jobs
- Users can delete their own CVs

### 3. Functional ApplySection Component
✅ Full form implementation with:
- Years of experience input
- Cover letter textarea
- Expected salary with negotiable option
- Application method selection (profile vs CV)
- CV file upload with validation
- Form submission with error handling
- Success confirmation flow
- Loading states

### 4. Application Tracking Page
✅ Created `/dashboard/applications` page:
- View all user applications
- Status badges with color coding
- Application details display
- Link to view original job posting
- Empty state for no applications

### 5. RLS Policies
✅ Comprehensive security policies:
- Users can view their own applications
- Employers can view applications for their jobs
- Admins can view all applications
- Authenticated users can create applications
- Users can update their own applications
- Employers can update application status
- Users can delete their own applications

### 6. Helper Functions
✅ Created utility functions:
- `get_job_application_count()` - Get application count for a job
- `has_user_applied()` - Check if user has applied to a job
- File upload utilities in `src/lib/storage.ts`

## Database Migration

Run the migration to apply all changes:

```bash
cd careerninja
npx supabase db push
```

Or using Supabase CLI:

```bash
supabase migration up
```

## File Structure

```
careerninja/
├── supabase/
│   └── migrations/
│       ├── 20260224_create_candidate_profiles.sql
│       └── 20260224_update_job_applications.sql
├── src/
│   ├── components/
│   │   └── ApplySection.tsx (Updated)
│   └── lib/
│       └── storage.ts (New)
└── app/
    └── dashboard/
        └── applications/
            └── page.tsx (New)
```

## Usage

### For Candidates

1. **Browse Jobs**: Navigate to `/jobs` to view available positions
2. **Apply to Job**: Click on a job and fill out the application form
3. **Upload CV**: Choose to apply with profile or upload a CV
4. **Track Applications**: View all applications at `/dashboard/applications`

### For Employers

1. **View Applications**: Access applications for your posted jobs
2. **Update Status**: Change application status (pending, reviewing, shortlisted, etc.)
3. **Download CVs**: Access uploaded CVs for review

## Application Status Flow

```
pending → reviewing → shortlisted → interviewed → offered → accepted
                                                         ↓
                                                    rejected
                                                         ↓
                                                    withdrawn
```

## File Upload Specifications

- **Allowed formats**: PDF, DOC, DOCX
- **Max file size**: 5MB
- **Storage location**: Supabase Storage bucket `application-cvs`
- **File naming**: `{user_id}/{timestamp}.{extension}`
- **Security**: Private bucket with RLS policies

## API Endpoints

### Create Application
```typescript
const { data, error } = await supabase
  .from('job_applications')
  .insert({
    job_id: 'uuid',
    user_id: 'uuid',
    full_name: 'string',
    email: 'string',
    // ... other fields
  });
```

### Get User Applications
```typescript
const { data, error } = await supabase
  .from('job_applications')
  .select(`
    *,
    job:jobs (*)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Upload CV
```typescript
const { data, error } = await supabase.storage
  .from('application-cvs')
  .upload(fileName, file);
```

## Testing Checklist

- [ ] User can apply to a job with profile
- [ ] User can apply to a job with CV upload
- [ ] CV file validation works (type and size)
- [ ] Application appears in user's applications list
- [ ] Application status is displayed correctly
- [ ] Duplicate applications are prevented
- [ ] CV files are stored securely
- [ ] Employers can view applications for their jobs
- [ ] Users cannot view other users' applications
- [ ] Success confirmation shows after submission

## Next Steps (Step 1.3)

1. Create employer dashboard to view applications
2. Implement application filtering and search
3. Add email notifications for new applications
4. Create application analytics
5. Add bulk actions for employers

## Troubleshooting

### Issue: CV upload fails
- Check storage bucket exists: `application-cvs`
- Verify RLS policies are enabled
- Ensure user is authenticated
- Check file size and type

### Issue: Application not showing
- Verify RLS policies are correct
- Check user authentication
- Ensure job_id is valid
- Check for duplicate application errors

### Issue: Cannot view applications
- Verify user is authenticated
- Check RLS policies
- Ensure proper foreign key relationships

## Security Considerations

1. All CV uploads are private by default
2. RLS policies prevent unauthorized access
3. File validation prevents malicious uploads
4. User data is encrypted at rest
5. Application data is only visible to authorized users

## Performance Optimizations

1. Indexes on frequently queried columns
2. Efficient foreign key relationships
3. Optimized storage bucket configuration
4. Lazy loading for application lists
5. Caching for frequently accessed data
