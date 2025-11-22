# Branding Customization Feature

## Overview
The admin dashboard now includes a comprehensive branding customization system that allows administrators to customize the website's appearance without code changes.

## Features

### Customizable Elements
1. **Site Name** - Change the website name displayed in the navbar and page titles
2. **Logo** - Upload a custom logo to replace the default briefcase icon
3. **Favicon** - Upload a custom favicon for browser tabs
4. **Primary Color** - Customize the primary brand color
5. **Secondary Color** - Customize the secondary brand color

### Real-time Updates
- Changes are applied instantly across the entire website
- All users see the updated branding without refreshing
- Color changes update CSS variables dynamically

## Usage

### Accessing Branding Settings
1. Log in as an admin user
2. Navigate to the Dashboard
3. Click on the "Branding" tab
4. Make your desired changes
5. Click "Save Branding Settings"

### Uploading Images
- **Logo**: Recommended square image, at least 200x200px
- **Favicon**: Recommended .ico or .png file, 32x32px or 64x64px

### Choosing Colors
- Use the color picker or enter hex color codes
- Preview the colors before saving
- Colors are automatically converted to HSL for theme compatibility

## Technical Implementation

### Database
- New `site_settings` table stores branding configuration
- Row-level security ensures only admins can update settings
- Public read access allows all users to see current branding

### Storage
- Images are stored in Supabase Storage under `public/branding/`
- Admins have upload/update/delete permissions
- Public read access for displaying images

### Components
- `BrandingContext` - Provides branding data throughout the app
- `BrandingSettings` - Admin interface for customization
- Updated `Navbar` and `MobileNav` - Display dynamic branding
- Updated `layout.tsx` - Dynamic metadata and favicon

### Files Created/Modified
1. `supabase/migrations/20251119000000_create_site_settings.sql` - Database schema
2. `supabase/migrations/20251119000001_create_branding_storage.sql` - Storage policies
3. `src/contexts/BrandingContext.tsx` - Branding context provider
4. `src/components/dashboards/BrandingSettings.tsx` - Admin UI
5. `src/components/dashboards/AdminDashboard.tsx` - Added branding tab
6. `app/providers.tsx` - Added BrandingProvider
7. `app/layout.tsx` - Dynamic metadata
8. `src/components/Navbar.tsx` - Dynamic branding display
9. `src/components/MobileNav.tsx` - Dynamic branding display

## Migration Instructions

### Running Migrations
```bash
# Apply the database migrations
supabase db push

# Or if using Supabase CLI locally
supabase migration up
```

### Default Settings
The system comes with default settings:
- Site Name: "CareerSasa"
- Primary Color: #8B5CF6 (Purple)
- Secondary Color: #EC4899 (Pink)

## Security

### Permissions
- Only users with `admin` role can update branding settings
- All authenticated users can view branding settings
- Storage policies restrict branding folder access to admins

### Validation
- File uploads are validated for image types
- Color values are validated as hex codes
- Site name is required

## Future Enhancements
- Font customization
- Additional color options (accent, background)
- Logo size/position controls
- Multiple theme presets
- Dark mode color overrides
- Custom CSS injection
