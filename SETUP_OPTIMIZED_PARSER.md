# Setup Guide: Optimized Job Parser

Follow these steps to set up the optimized job parser system.

## 1. Database Migration

The database infrastructure should already be in place from the migration file:
```
supabase/migrations/20251214000000_create_job_parsing_infrastructure.sql
```

If not applied yet, run:
```bash
supabase db push
```

## 2. Environment Variables

Add these to your `.env` file:

```env
# Required: AI API Keys (at least one)
GEMINI_API_KEY=your-gemini-key-here
GEMINI_API_KEY_2=backup-gemini-key-here
GEMINI_API_KEY_3=third-gemini-key-here
OPENROUTER_API_KEY=your-openrouter-key-here

# Optional but recommended: Enhanced database permissions
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Cron job security
CRON_SECRET=your-random-secret-key-here
```

### Getting API Keys

**Gemini API (Free):**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy and paste into your `.env` file
4. Repeat for backup keys (recommended)

**OpenRouter API (Paid backup):**
1. Go to [OpenRouter](https://openrouter.ai/keys)
2. Create an account and add credits
3. Generate an API key
4. Copy and paste into your `.env` file

## 3. Deploy to Vercel

Push your changes to your repository and deploy:

```bash
git add .
git commit -m "Add optimized job parser with caching and async processing"
git push origin main
```

Make sure to add the environment variables in your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all the variables from your `.env` file

## 4. Optional: Set Up Cron Jobs

Add this to your `vercel.json` file for automatic background processing:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-jobs",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/cleanup-cache",
      "schedule": "0 2 * * *"
    }
  ]
}
```

This will:
- Process queued jobs every 5 minutes
- Clean up expired cache entries daily at 2 AM

## 5. Test the System

### Option A: Use the UI
1. Go to `/dashboard/admin/parse-job`
2. Try both "Direct Mode" and "Stream Mode"
3. Check `/dashboard/admin/job-parser-stats` for monitoring

### Option B: Use the Test Script
```bash
# Start your development server
npm run dev

# In another terminal, run the test
node test-optimized-parser.js
```

### Option C: Manual API Testing
```bash
# Test direct parsing
curl -X POST http://localhost:3000/api/parse-job \
  -H "Content-Type: application/json" \
  -d '{"jobText": "Software Engineer at TechCorp..."}'

# Test async parsing
curl -X POST http://localhost:3000/api/parse-job \
  -H "Content-Type: application/json" \
  -d '{"jobText": "Software Engineer at TechCorp...", "async": true}'
```

## 6. Monitor Performance

Visit `/dashboard/admin/job-parser-stats` to monitor:
- ✅ Total jobs processed
- ⏳ Jobs in queue
- 📊 Cache hit rates
- ❌ Failed jobs
- 🔄 Recent activity

## 7. Troubleshooting

### Common Issues:

**"No AI API key configured"**
- Add at least one API key (GEMINI_API_KEY or OPENROUTER_API_KEY)
- Redeploy after adding environment variables

**"Function timeout" still occurring**
- Use async mode: `{ "jobText": "...", "async": true }`
- Or use streaming mode in the UI
- Check if API keys are valid and have quota

**Cache not working**
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Check database permissions
- Look for errors in Vercel function logs

**Jobs stuck in "pending" status**
- Manually trigger processing: `POST /api/parse-job/process-queue`
- Set up cron jobs for automatic processing
- Check function logs for errors

### Performance Tips:

1. **Use multiple Gemini keys** to avoid rate limits
2. **Enable cron jobs** for automatic background processing
3. **Monitor cache hit rates** - should be >50% for good performance
4. **Use streaming mode** for better user experience
5. **Clean up old data** regularly to maintain performance

## 8. Success Metrics

After setup, you should see:
- ✅ **No timeout errors** on job parsing
- ⚡ **Sub-second responses** for cached results
- 📈 **High cache hit rates** (>50%)
- 🔄 **Automatic background processing**
- 📊 **Real-time progress updates** in streaming mode

## Need Help?

Check the logs in:
1. Vercel function logs
2. Browser developer console
3. `/dashboard/admin/job-parser-stats` for system status

The optimized parser should handle the timeout issues while providing a much better user experience!