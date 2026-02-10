# Content Management System Guide

## Overview
You can now edit all front-facing page content without touching code through the admin interface at `/dashboard/content-editor`.

## Setup Instructions

### 1. Run the Database Migration
Execute the SQL migration in your Supabase dashboard:
```bash
# The migration file is located at:
careerninja/supabase/migrations/20260210_create_page_content.sql
```

Go to Supabase Dashboard → SQL Editor → New Query → Paste the migration content → Run

### 2. Access the Content Editor
Navigate to: `http://localhost:3000/dashboard/content-editor` (or your production URL)

## How to Use

### Editing Existing Content
1. Select the page tab (Homepage, CV Services, etc.)
2. Find the content section you want to edit
3. Click "Edit"
4. Modify the content value
5. Click "Save Changes"

### Adding New Content
1. Select the page tab
2. Scroll to "Add New Content Section"
3. Fill in:
   - **Section Key**: Unique identifier (e.g., `hero_title`, `cta_button_text`)
   - **Content Type**: text, html, json, or number
   - **Content Value**: Your actual content
   - **Metadata**: Optional JSON for extra data like images, links
4. Click "Create Content Section"

### Content Types
- **text**: Plain text (titles, descriptions)
- **html**: Rich HTML content (formatted paragraphs)
- **json**: Structured data (arrays, objects)
- **number**: Numeric values (stats, prices)

## Using Content in Your Pages

### Example 1: Simple Text Content
```tsx
import { usePageContent, getContentValue } from "@/hooks/usePageContent";

export default function MyPage() {
  const { data: content } = usePageContent("home");
  
  return (
    <h1>{getContentValue(content, "hero_title", "Default Title")}</h1>
  );
}
```

### Example 2: Number Content (Stats)
```tsx
import { usePageContent, getContentValue } from "@/hooks/usePageContent";

export default function StatsSection() {
  const { data: content } = usePageContent("home");
  
  return (
    <div>
      <div className="text-3xl font-bold">
        {getContentValue(content, "stats_jobs", "0")}+
      </div>
      <div className="text-sm">Active Jobs</div>
    </div>
  );
}
```

### Example 3: JSON Content (Lists)
```tsx
import { usePageContent, getJsonContent } from "@/hooks/usePageContent";

export default function BenefitsList() {
  const { data: content } = usePageContent("home");
  const benefits = getJsonContent<string[]>(content, "benefits_list", []);
  
  return (
    <ul>
      {benefits.map((benefit, idx) => (
        <li key={idx}>{benefit}</li>
      ))}
    </ul>
  );
}
```

### Example 4: HTML Content
```tsx
import { usePageContent, getContentValue } from "@/hooks/usePageContent";

export default function RichContent() {
  const { data: content } = usePageContent("services-cv");
  const htmlContent = getContentValue(content, "hero_description", "");
  
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
```

## Page Slugs
- `home` - Homepage
- `services-cv` - CV Services page
- `services-linkedin` - LinkedIn Services page
- `services-cover-letter` - Cover Letter Services page
- `about` - About page
- `contact` - Contact page

## Common Section Keys

### Homepage
- `hero_title` - Main hero title
- `hero_subtitle` - Hero subtitle/description
- `stats_jobs` - Number of active jobs
- `stats_companies` - Number of companies
- `stats_success_rate` - Success rate percentage
- `featured_section_title` - Featured jobs section title
- `cta_title` - Call-to-action title
- `cta_subtitle` - Call-to-action subtitle

### Service Pages
- `hero_title` - Page title
- `hero_subtitle` - Page subtitle
- `hero_description` - Hero description (HTML)
- `why_[service]_matters_title` - Why section title
- `what_we_do_title` - What we do section title

## Best Practices

1. **Use Descriptive Keys**: `hero_title` is better than `title1`
2. **Keep Keys Consistent**: Use snake_case for all keys
3. **Use Fallbacks**: Always provide fallback values in `getContentValue()`
4. **Test Changes**: Preview changes before deploying
5. **Backup Content**: Export content before major changes

## Metadata Examples

### Image with Alt Text
```json
{
  "image_url": "/assets/hero.jpg",
  "alt_text": "Professional team"
}
```

### Link with Label
```json
{
  "url": "https://example.com",
  "label": "Learn More",
  "target": "_blank"
}
```

### Styling Options
```json
{
  "color": "primary",
  "size": "large",
  "icon": "check"
}
```

## Security Notes

- Only authenticated users can edit content (RLS policy)
- Public users can read content
- Consider adding admin role checks for production
- Validate JSON before saving

## Troubleshooting

### Content Not Showing
1. Check if migration ran successfully
2. Verify page_slug and section_key match
3. Check browser console for errors
4. Ensure Supabase connection is working

### Can't Edit Content
1. Verify you're authenticated
2. Check RLS policies in Supabase
3. Ensure you have the correct permissions

### Invalid JSON Error
1. Validate JSON syntax in metadata field
2. Use online JSON validator
3. Start with empty object `{}`

## Future Enhancements

- [ ] Add image upload functionality
- [ ] Add content versioning/history
- [ ] Add preview before save
- [ ] Add bulk import/export
- [ ] Add content scheduling
- [ ] Add multi-language support
- [ ] Add role-based permissions
