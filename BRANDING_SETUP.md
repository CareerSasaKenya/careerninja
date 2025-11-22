# Branding Feature Setup Guide

## Quick Start

### 1. Run Database Migrations

Apply the new database migrations to create the `site_settings` table and storage policies:

```bash
# If using Supabase CLI
supabase db push

# Or apply migrations manually in Supabase Dashboard
# Navigate to SQL Editor and run the migration files in order:
# - supabase/migrations/20251119000000_create_site_settings.sql
# - supabase/migrations/20251119000001_create_branding_storage.sql
```

### 2. Verify Storage Bucket

Ensure the `public` storage bucket exists in your Supabase project:

1. Go to Supabase Dashboard → Storage
2. If the `public` bucket doesn't exist, create it
3. Make sure it's set to public access

### 3. Access the Feature

1. Log in as an admin user
2. Navigate to Dashboard
3. Click on the "Branding" tab
4. Start customizing!

## Testing the Feature

### Test Branding Changes

1. **Change Site Name**
   - Enter a new site name
   - Click "Save Branding Settings"
   - Check the navbar - it should update immediately

2. **Upload Logo**
   - Click "Choose File" under Logo
   - Select an image (PNG, JPG, etc.)
   - Wait for upload to complete
   - Logo should appear in navbar

3. **Upload Favicon**
   - Click "Choose File" under Favicon
   - Select a .ico or .png file
   - Wait for upload
   - Check browser tab for new favicon (may need to refresh)

4. **Change Colors**
   - Use color pickers or enter hex codes
   - Preview the gradient
   - Click "Save Branding Settings"
   - Colors should update across the site

### Verify Real-time Updates

1. Open the site in two browser windows
2. In one window, make branding changes as admin
3. In the other window, observe changes appear automatically
4. No page refresh needed!

## Troubleshooting

### Images Not Uploading

**Problem**: File upload fails with error

**Solutions**:
- Check that the `public` storage bucket exists
- Verify storage policies are applied correctly
- Ensure you're logged in as an admin
- Check file size (keep under 5MB)

### Colors Not Applying

**Problem**: Color changes don't appear on the site

**Solutions**:
- Clear browser cache
- Check browser console for errors
- Verify the hex color format (#RRGGBB)
- Try refreshing the page

### Favicon Not Updating

**Problem**: Browser tab still shows old favicon

**Solutions**:
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Try in incognito/private mode
- Wait a few minutes (browsers cache favicons aggressively)

### TypeScript Errors

**Problem**: TypeScript complains about `site_settings` table

**Solutions**:
- Ensure `src/integrations/supabase/types.ts` includes the `site_settings` table definition
- Restart your TypeScript server
- Rebuild the project

## Default Values

The system initializes with these defaults:
- **Site Name**: CareerSasa
- **Primary Color**: #8B5CF6 (Purple)
- **Secondary Color**: #EC4899 (Pink)
- **Logo**: None (uses default briefcase icon)
- **Favicon**: None (uses default favicon.ico)

## Security Notes

- Only users with `admin` role can modify branding
- All users can view current branding settings
- Images are stored in a public bucket (accessible to everyone)
- Branding changes are logged with user ID and timestamp

## Next Steps

After setup, consider:
1. Uploading your company logo
2. Creating a custom favicon
3. Matching colors to your brand guidelines
4. Testing on mobile devices
5. Checking dark mode appearance
