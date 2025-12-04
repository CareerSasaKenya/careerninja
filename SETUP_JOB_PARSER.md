# Quick Setup Guide: AI Job Parser

## Step 1: Get OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to "Keys" section
4. Click "Create Key"
5. Copy your API key

## Step 2: Add API Key to Environment

Open `careerninja/.env` and add:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
NEXT_PUBLIC_SITE_URL=https://careerninja.co.ke
```

**Important:** Replace `sk-or-v1-your-actual-key-here` with your actual OpenRouter API key.

## Step 3: Add Credits to OpenRouter

1. Go to [OpenRouter Credits](https://openrouter.ai/credits)
2. Add at least $5 (will last for ~500 job parses)
3. Verify credits are showing in your account

## Step 4: Restart Development Server

```bash
cd careerninja
npm run dev
```

## Step 5: Test the Feature

1. Log in as admin
2. Go to Dashboard
3. Click "Parse Job Text" button
4. Click "Load Example" to test with sample data
5. Click "Parse Job Text"
6. Review the auto-filled form
7. Save as draft or publish

## Verification Checklist

- [ ] OpenRouter API key is added to `.env`
- [ ] Credits are added to OpenRouter account
- [ ] Development server restarted
- [ ] Can access `/dashboard/admin/parse-job` page
- [ ] "Parse Job Text" button appears in admin dashboard
- [ ] Example job text loads correctly
- [ ] Parsing completes without errors
- [ ] Form is pre-filled with parsed data
- [ ] Can save job to database

## Troubleshooting

### Error: "OpenRouter API key not configured"
- Check `.env` file has `OPENROUTER_API_KEY`
- Restart dev server after adding key
- Verify no typos in environment variable name

### Error: "Failed to parse job text"
- Check OpenRouter account has credits
- Verify API key is valid and active
- Check console for detailed error messages

### Parsed data is empty or incorrect
- Ensure job text is well-formatted
- Try the example text first
- Check that text includes key sections (title, description, requirements)

### Can't access the page
- Verify you're logged in as admin
- Check user role in database
- Clear browser cache and cookies

## Cost Estimate

- **Model**: Claude 3.5 Sonnet
- **Cost per parse**: ~$0.01
- **$5 credit**: ~500 job parses
- **Monthly estimate** (100 jobs): ~$1

## Next Steps

Once setup is complete:
1. Start parsing real job postings
2. Monitor parsing accuracy
3. Adjust job text format for better results
4. Consider batch processing for multiple jobs

## Support

For issues or questions:
- Check `JOB_PARSER_FEATURE.md` for detailed documentation
- Review API logs in Vercel dashboard
- Check OpenRouter usage dashboard
