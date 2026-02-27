# How to Regenerate Supabase Types

Since you've applied the migrations to your Supabase database, you need to regenerate the TypeScript types to match.

## Method 1: Using Supabase CLI (Recommended)

```bash
cd careerninja

# Install Supabase CLI globally (if not already installed)
npm install -g supabase

# Link to your project
npx supabase link --project-ref qxuvqrfqkdpfjfwkqatf

# Generate types from your production database
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

## Method 2: Using npx directly

```bash
cd careerninja

# Generate types directly (requires project ref and access token)
npx supabase gen types typescript --project-id qxuvqrfqkdpfjfwkqatf --schema public > src/integrations/supabase/types.ts
```

## Method 3: Manual from Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/qxuvqrfqkdpfjfwkqatf/api
2. Scroll down to "Generate Types"
3. Select "TypeScript"
4. Copy the generated types
5. Replace the content of `src/integrations/supabase/types.ts`

## After Regenerating Types

1. Commit the updated types:
```bash
git add src/integrations/supabase/types.ts
git commit -m "chore: regenerate Supabase types after migrations"
git push
```

2. The build should now succeed with all new tables included

## What This Will Add

The regenerated types will include:
- `candidate_profiles` table
- `candidate_work_experience` table
- `candidate_education` table
- `candidate_skills` table
- `candidate_documents` table
- Updated `job_applications` table with new columns
- `application_status` enum type

## Quick Fix (If CLI doesn't work)

If you can't run the CLI, I can manually update the types file with the new table definitions, but it's better to generate them from your actual database to ensure accuracy.
