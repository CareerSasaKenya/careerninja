# 🎨 Content Management System - Quick Setup

## What You Get
A complete admin interface to edit all front-facing page content without touching code!

## 📋 Setup Steps (5 minutes)

### Step 1: Run Database Migration
1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the content from `supabase/migrations/20260210_create_page_content.sql`
5. Paste and click **Run**

### Step 2: Access the Content Editor
Navigate to: `http://localhost:3000/dashboard/content-editor`

You should see tabs for different pages (Homepage, CV Services, etc.)

### Step 3: Test It Out
1. Click on the "Homepage" tab
2. Find "hero_title" section
3. Click "Edit"
4. Change the text to something like "Test Title"
5. Click "Save Changes"
6. Go to your homepage and refresh - you should see the change!

## 🎯 What Can You Edit?

### Homepage (`/`)
- Hero title and subtitle
- Stats numbers (Active Jobs, Companies, Success Rate)
- Featured section titles
- Call-to-action text
- Any other text content

### Service Pages
- CV Services (`/services/cv`)
- LinkedIn Services (`/services/linkedin`)
- Cover Letter Services (`/services/cover-letter`)

All hero sections, descriptions, and text content!

## 📝 How to Use in Your Pages

### Quick Example
Replace hardcoded text in your pages with CMS content:

**Before (hardcoded):**
```tsx
<h1>Your Dream Career Starts Here</h1>
```

**After (CMS-powered):**
```tsx
import { usePageContent, getContentValue } from "@/hooks/usePageContent";

export default function MyPage() {
  const { data: content } = usePageContent("home");
  const title = getContentValue(content, "hero_title", "Default Title");
  
  return <h1>{title}</h1>;
}
```

Now you can edit "hero_title" from the admin panel!

## 🔧 Adding New Editable Content

1. Go to `/dashboard/content-editor`
2. Select the page tab
3. Scroll to "Add New Content Section"
4. Fill in:
   - **Section Key**: `my_new_section` (use snake_case)
   - **Content Type**: `text` (or html, json, number)
   - **Content Value**: Your content
5. Click "Create Content Section"
6. Use it in your code:
   ```tsx
   const myContent = getContentValue(content, "my_new_section", "fallback");
   ```

## 📚 Content Types

| Type | Use For | Example |
|------|---------|---------|
| `text` | Simple text | Titles, labels, short descriptions |
| `html` | Rich content | Formatted paragraphs with `<strong>`, `<em>` |
| `json` | Structured data | Lists, arrays, objects |
| `number` | Numbers | Stats, prices, counts |

## 🎨 Example: Update Your Homepage

See `app/page-example-with-cms.tsx` for a complete example of how to integrate CMS into your homepage.

Key changes:
1. Import the hook: `import { usePageContent, getContentValue } from "@/hooks/usePageContent";`
2. Fetch content: `const { data: content } = usePageContent("home");`
3. Get values: `const title = getContentValue(content, "hero_title", "Default");`
4. Use in JSX: `<h1>{title}</h1>`

## 🚀 Next Steps

1. **Run the migration** (Step 1 above)
2. **Test the editor** at `/dashboard/content-editor`
3. **Update one page** to use CMS (start with homepage)
4. **Add more content sections** as needed
5. **Train your team** to use the editor

## 🔒 Security

- Only authenticated users can edit content
- Public users can read content
- Consider adding admin role checks for production

## 📖 Full Documentation

See `CONTENT_MANAGEMENT_GUIDE.md` for:
- Detailed usage examples
- Best practices
- Troubleshooting
- Advanced features

## 💡 Tips

1. **Use descriptive keys**: `hero_title` not `title1`
2. **Always provide fallbacks**: In case content isn't loaded
3. **Test before deploying**: Preview changes locally first
4. **Keep it simple**: Start with text, add complexity later

## ❓ Need Help?

Common issues:
- **Content not showing?** Check if migration ran successfully
- **Can't edit?** Make sure you're authenticated
- **Invalid JSON?** Validate your JSON syntax

## 🎉 You're Done!

You now have a complete CMS for your front-facing pages. No more code changes for simple text updates!
