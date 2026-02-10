# SEO Fields Setup Instructions

## Step 1: Run the Database Migration

You need to run the migration file to add SEO columns to your `page_content` table.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/20260210_add_seo_fields.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option B: Using Supabase CLI

If you have Supabase CLI installed:

```bash
cd careerninja
supabase db push
```

## Step 2: Verify the Migration

After running the migration, verify the columns were added:

1. Go to **Table Editor** in Supabase
2. Select the `page_content` table
3. You should see these new columns:
   - `seo_title`
   - `seo_meta_description`
   - `seo_url_slug`
   - `seo_canonical_url`
   - `seo_index`
   - `seo_h1_title`
   - `seo_follow`

## Step 3: Refresh the Content Editor

1. Go to your content editor: `/dashboard/content-editor`
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Click "Edit" on any content item
4. You should now see the **SEO Settings** section with all fields

## Step 4: Test SEO Fields

1. Edit a content item (e.g., homepage hero_title)
2. Scroll down to the "SEO Settings" section
3. Fill in the SEO fields:
   - SEO Title: "CareerSasa - Find Your Dream Job in Kenya"
   - Meta Description: "Discover thousands of job opportunities..."
   - URL Slug: "/"
   - Canonical URL: "https://www.careersasa.co.ke/"
   - H1 Title: "Your Dream Career Starts Here"
   - Check "Index" and "Follow" boxes
4. Click "Save Changes"
5. Refresh and verify the SEO data appears in the blue box

## Troubleshooting

### SEO fields not showing after migration
- Clear your browser cache
- Hard refresh the page (Ctrl+Shift+R)
- Check browser console for errors

### Migration fails
- Make sure you're connected to the correct Supabase project
- Check if the columns already exist (they might have been added already)
- Verify you have the correct permissions

### SEO data not saving
- Check the browser console for errors
- Verify the RLS policies allow authenticated users to update
- Make sure you're logged in as an authenticated user

## Using SEO Data in Your Pages

Once the migration is complete and SEO data is added, you can use it in your pages:

```typescript
import { generateSEOMetadata } from '@/components/SEOHead';
import { getSEOData } from '@/hooks/usePageContent';

// In your page component
export async function generateMetadata() {
  const { data } = await supabase
    .from('page_content')
    .select('*')
    .eq('page_slug', 'home')
    .eq('section_key', 'hero_title')
    .single();

  const seoData = getSEOData(data);
  return generateSEOMetadata(seoData, 'Fallback Title', 'Fallback Description');
}
```

## Default SEO Values

The migration includes default SEO values for:
- Homepage (/)
- CV Services (/services/cv)
- LinkedIn Services (/services/linkedin)
- Cover Letter Services (/services/cover-letter)

You can edit these values in the content editor after running the migration.
