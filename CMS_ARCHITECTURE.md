# Content Management System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN INTERFACE                          │
│                                                              │
│  /dashboard/content-editor                                   │
│  ┌────────────┬────────────┬────────────┬────────────┐     │
│  │  Homepage  │ CV Services│  LinkedIn  │Cover Letter│     │
│  └────────────┴────────────┴────────────┴────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Edit Content Section                             │      │
│  │  ┌─────────────────────────────────────────────┐ │      │
│  │  │ Section Key: hero_title                     │ │      │
│  │  │ Content Type: text                          │ │      │
│  │  │ Content Value: Your Dream Career...         │ │      │
│  │  │ [Save Changes] [Cancel]                     │ │      │
│  │  └─────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Updates via Supabase API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                         │
│                                                              │
│  Table: page_content                                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ id          │ page_slug │ section_key │ content... │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ uuid-1      │ home      │ hero_title  │ Your Dre...│    │
│  │ uuid-2      │ home      │ stats_jobs  │ 1070       │    │
│  │ uuid-3      │ services  │ hero_title  │ CV Serv... │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Fetches via React Query
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND PAGES                            │
│                                                              │
│  Homepage (/)                                                │
│  ┌──────────────────────────────────────────────────┐      │
│  │  const { data } = usePageContent("home");        │      │
│  │  const title = getContentValue(data, "hero_.."); │      │
│  │                                                   │      │
│  │  <h1>{title}</h1>  ← Displays: "Your Dream..."  │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  Services Pages (/services/*)                               │
│  ┌──────────────────────────────────────────────────┐      │
│  │  const { data } = usePageContent("services-cv"); │      │
│  │  const title = getContentValue(data, "hero_.."); │      │
│  │                                                   │      │
│  │  <h1>{title}</h1>  ← Displays: "CV Services..." │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Admin Edits Content
```
Admin → Content Editor → Supabase API → Database
```

### 2. Frontend Displays Content
```
Page Load → usePageContent Hook → Supabase Query → React Query Cache → Display
```

### 3. Real-time Updates
```
Admin Saves → Database Updated → Query Invalidated → Frontend Refetches → New Content Displayed
```

## File Structure

```
careerninja/
├── app/
│   ├── dashboard/
│   │   └── content-editor/
│   │       └── page.tsx              # Admin interface
│   ├── page.tsx                       # Homepage (to be updated)
│   └── services/
│       ├── cv/page.tsx               # CV services (to be updated)
│       ├── linkedin/page.tsx         # LinkedIn services (to be updated)
│       └── cover-letter/page.tsx     # Cover letter services (to be updated)
├── src/
│   └── hooks/
│       └── usePageContent.ts         # Custom hook for fetching content
└── supabase/
    └── migrations/
        └── 20260210_create_page_content.sql  # Database schema
```

## Component Architecture

### usePageContent Hook
```typescript
usePageContent(pageSlug: string, sectionKey?: string)
  ↓
  Fetches from Supabase
  ↓
  Returns: { data, isLoading, error }
```

### Helper Functions
```typescript
getContentValue(content, key, fallback)
  → Returns string value or fallback

getJsonContent(content, key, fallback)
  → Parses JSON and returns typed object
```

## Database Schema

```sql
page_content
├── id (UUID, Primary Key)
├── page_slug (TEXT) ─────────→ "home", "services-cv", etc.
├── section_key (TEXT) ───────→ "hero_title", "stats_jobs", etc.
├── content_type (TEXT) ──────→ "text", "html", "json", "number"
├── content_value (TEXT) ─────→ Actual content
├── metadata (JSONB) ─────────→ Extra data (images, links, etc.)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Unique constraint: (page_slug, section_key)
```

## Security Model

```
┌─────────────────────────────────────┐
│  Row Level Security (RLS)           │
├─────────────────────────────────────┤
│  Public Users:                      │
│    ✓ SELECT (read content)          │
│    ✗ INSERT/UPDATE/DELETE           │
├─────────────────────────────────────┤
│  Authenticated Users:               │
│    ✓ SELECT                         │
│    ✓ INSERT                         │
│    ✓ UPDATE                         │
│    ✓ DELETE                         │
└─────────────────────────────────────┘
```

## Caching Strategy

```
React Query Cache
├── Query Key: ["page-content", pageSlug, sectionKey]
├── Stale Time: Default (0ms)
├── Cache Time: 5 minutes
└── Refetch: On window focus, on mount
```

## Content Types & Use Cases

| Type | Storage | Use Case | Example |
|------|---------|----------|---------|
| `text` | Plain string | Titles, labels | "Your Dream Career" |
| `html` | HTML string | Rich content | `<p>Join <strong>thousands</strong></p>` |
| `json` | JSON string | Lists, objects | `["benefit1", "benefit2"]` |
| `number` | Numeric string | Stats, counts | "1070" |

## Update Flow Diagram

```
┌──────────┐
│  Admin   │
│  Clicks  │
│  "Edit"  │
└────┬─────┘
     │
     ▼
┌──────────────┐
│ Edit Form    │
│ Opens        │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Admin        │
│ Changes Text │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Clicks       │
│ "Save"       │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ API Call to  │
│ Supabase     │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Database     │
│ Updated      │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Query Cache  │
│ Invalidated  │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Frontend     │
│ Refetches    │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ New Content  │
│ Displayed    │
└──────────────┘
```

## Performance Considerations

1. **React Query Caching**: Content is cached client-side
2. **Supabase Connection Pooling**: Efficient database queries
3. **Lazy Loading**: Content fetched only when page loads
4. **Optimistic Updates**: UI updates before server confirms
5. **Fallback Values**: Always provide defaults for instant render

## Scalability

- **Pages**: Unlimited (add new page_slug values)
- **Sections per Page**: Unlimited (add new section_keys)
- **Content Size**: Up to TEXT limit (~1GB per field)
- **Concurrent Editors**: Supported (last write wins)
- **Read Performance**: Excellent (indexed queries)

## Future Enhancements

1. **Content Versioning**: Track history of changes
2. **Preview Mode**: See changes before publishing
3. **Scheduled Publishing**: Set future publish dates
4. **Multi-language**: Support multiple languages
5. **Media Library**: Upload and manage images
6. **Bulk Operations**: Import/export content
7. **Role-based Access**: Different permission levels
8. **Content Approval**: Workflow for content changes
