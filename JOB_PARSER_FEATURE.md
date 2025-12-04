# AI Job Text Parser Feature

## Overview
This feature allows admins to paste pre-cleaned job text and have it automatically parsed into structured data using AI (OpenRouter API with Claude 3.5 Sonnet), then review and save it to the Supabase database.

## Workflow

1. **Admin pastes job text** - Navigate to `/dashboard/admin/parse-job` and paste pre-cleaned job text (90%+ ready)
2. **AI parsing** - Click "Parse Job Text" to send the text to OpenRouter API
3. **Structured extraction** - AI extracts all job fields (title, company, description, requirements, salary, location, etc.)
4. **Review & edit** - The job form is pre-filled with parsed data for admin review
5. **Save** - Admin can save as draft or publish immediately to Supabase

## Files Created

### API Route
- `app/api/parse-job/route.ts` - Edge function that handles OpenRouter API calls

### Components
- `src/components/JobTextParser.tsx` - UI component for pasting and parsing job text
- `app/dashboard/admin/parse-job/page.tsx` - Admin page that combines parser and job form

### Modified Files
- `src/components/JobPostingForm.tsx` - Enhanced to accept `initialData` prop for pre-filling
- `src/components/dashboards/AdminDashboard.tsx` - Added "Parse Job Text" button
- `.env` - Added OpenRouter API key configuration

## Setup Instructions

### 1. Get OpenRouter API Key
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Create an API key
3. Add credits to your account

### 2. Configure Environment Variables
Add to your `.env` file:
```env
OPENROUTER_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_SITE_URL=https://careerninja.co.ke
```

### 3. Deploy
The API route uses Edge runtime, so it will work on Vercel automatically.

## Usage

### For Admins
1. Log in as admin
2. Go to Dashboard
3. Click "Parse Job Text" button
4. Paste your pre-cleaned job text
5. Click "Parse Job Text"
6. Review the auto-filled form
7. Edit any fields as needed
8. Save as draft or publish

### Example Job Text Format
```
Software Engineer at TechCorp Kenya
Location: Nairobi, Kenya
Type: Full-time, On-site
Salary: KES 80,000 - 120,000 per month

About the role:
We are looking for a talented Software Engineer to join our growing team...

Responsibilities:
- Develop and maintain web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code

Requirements:
- Bachelor's degree in Computer Science
- 3+ years of experience in software development
- Proficiency in React, Node.js, and TypeScript
- Strong problem-solving skills

How to Apply:
Send your CV to careers@techcorp.co.ke
```

## AI Model
- **Provider**: OpenRouter
- **Model**: `anthropic/claude-3.5-sonnet`
- **Temperature**: 0.1 (for consistent, deterministic parsing)
- **Max Tokens**: 4000

## Parsed Fields
The AI extracts the following fields:
- Basic: title, company, description, responsibilities
- Requirements: qualifications, education level, experience, skills
- Location: country, county, city, work type (remote/hybrid/on-site)
- Compensation: salary range, currency, period
- Application: email, link, deadline
- Metadata: employment type, industry, job function, tags

## Error Handling
- Validates job text is provided
- Checks for OpenRouter API key
- Handles API errors gracefully
- Cleans markdown formatting from AI responses
- Provides user-friendly error messages

## Cost Considerations
- Claude 3.5 Sonnet pricing: ~$3 per million input tokens, ~$15 per million output tokens
- Average job text: ~1,000 tokens input, ~500 tokens output
- Estimated cost per parse: ~$0.01
- For 100 jobs/month: ~$1/month

## Future Enhancements
- [ ] Batch parsing (multiple jobs at once)
- [ ] Support for different job text formats
- [ ] Confidence scores for parsed fields
- [ ] Auto-categorization suggestions
- [ ] Integration with job scraping workflows
- [ ] Parse history and analytics
- [ ] Support for other AI models (GPT-4, etc.)

## Troubleshooting

### "OpenRouter API key not configured"
- Ensure `OPENROUTER_API_KEY` is set in `.env`
- Restart your development server

### "Failed to parse job text"
- Check OpenRouter account has credits
- Verify API key is valid
- Check job text is properly formatted

### Parsed data is incorrect
- Ensure job text is pre-cleaned (90%+ ready)
- Try reformatting the text with clearer sections
- Manually edit the form after parsing

## Security
- API key is stored server-side only (not exposed to client)
- Edge runtime for fast, secure execution
- Admin-only access to parsing feature
- Input validation and sanitization
