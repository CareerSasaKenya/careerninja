# How to Apply Database Migrations

## Important: Migrations Need to be Applied to Production

The new database migrations in `supabase/migrations/` need to be applied to your production Supabase database before the new features will work.

## Method 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/qxuvqrfqkdpfjfwkqatf

2. Navigate to **SQL Editor** (left sidebar)

3. Apply migrations in this order:

### Step 1: Create Candidate Profiles Tables
- Open `supabase/migrations/20260224_create_candidate_profiles.sql`
- Copy the entire content
- Paste into SQL Editor
- Click "Run"

### Step 2: Update Job Applications Table
- Open `supabase/migrations/20260224_update_job_applications.sql`
- Copy the entire content
- Paste into SQL Editor
- Click "Run"

## Method 2: Via Supabase CLI (Alternative)

If you have Supabase CLI installed and linked:

```bash
cd careerninja

# Link to your project (one-time setup)
npx supabase link --project-ref qxuvqrfqkdpfjfwkqatf

# Push migrations
npx supabase db push
```

## Method 3: Manual SQL Execution

You can also execute the SQL directly in your database:

1. Go to **Database** > **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy and paste each migration file content
4. Execute

## After Applying Migrations

Once migrations are applied, you need to regenerate TypeScript types:

```bash
cd careerninja

# Generate types from your database
npx supabase gen types typescript --project-id qxuvqrfqkdpfjfwkqatf > src/integrations/supabase/types.ts
```

## Verify Migrations

After applying, verify the tables exist:

```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'candidate_profiles',
  'candidate_work_experience',
  'candidate_education',
  'candidate_skills',
  'candidate_documents'
);

-- Check if job_applications was updated
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'job_applications';
```

## What These Migrations Do

### Migration 1: Create Candidate Profiles
- Creates `candidate_profiles` table
- Creates `candidate_work_experience` table
- Creates `candidate_education` table
- Creates `candidate_skills` table
- Creates `candidate_documents` table
- Sets up RLS policies
- Adds indexes for performance

### Migration 2: Update Job Applications
- Adds new columns to `job_applications` table:
  - full_name, email, phone
  - years_experience
  - cover_letter
  - expected_salary_min, expected_salary_max, salary_negotiable
  - application_method
  - cv_file_url, cv_file_name, cv_file_size
  - candidate_profile_id
- Creates `application_status` enum
- Creates `application-cvs` storage bucket
- Sets up storage RLS policies
- Adds helper functions

## Troubleshooting

### Error: "relation already exists"
- Some tables may already exist. You can skip those CREATE TABLE statements or use `CREATE TABLE IF NOT EXISTS`

### Error: "column already exists"
- Some columns may already exist. You can skip those ALTER TABLE statements or use `ADD COLUMN IF NOT EXISTS`

### Error: "type already exists"
- The enum type may already exist. You can skip the CREATE TYPE statement

### Permission Errors
- Make sure you're using a database user with sufficient permissions
- You may need to use the service role key

## Current Status

The code has been updated to work with the existing database schema until migrations are applied. Once you apply the migrations:

1. The full application form will work with all fields
2. CV uploads will be functional
3. Profile management will have all features
4. Application tracking will show complete details

## Need Help?

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Verify your database connection
3. Ensure you have the correct permissions
4. Contact support if needed
