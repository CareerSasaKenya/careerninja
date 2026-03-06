-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  search_params JSONB NOT NULL,
  email_alerts_enabled BOOLEAN DEFAULT false,
  alert_frequency VARCHAR(50) DEFAULT 'daily' CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
  last_alert_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Create job_comparisons table
CREATE TABLE IF NOT EXISTS job_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  job_ids UUID[] NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance (only if tables were created)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'saved_searches') THEN
    CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_searches_email_alerts ON saved_searches(user_id, email_alerts_enabled) WHERE email_alerts_enabled = true;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'saved_jobs') THEN
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'job_comparisons') THEN
    CREATE INDEX IF NOT EXISTS idx_job_comparisons_user_id ON job_comparisons(user_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_searches
CREATE POLICY "Users can view their own saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_jobs
CREATE POLICY "Users can view their own saved jobs"
  ON saved_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
  ON saved_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved jobs"
  ON saved_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved jobs"
  ON saved_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for job_comparisons
CREATE POLICY "Users can view their own job comparisons"
  ON job_comparisons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create job comparisons"
  ON job_comparisons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job comparisons"
  ON job_comparisons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job comparisons"
  ON job_comparisons FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_comparisons_updated_at
  BEFORE UPDATE ON job_comparisons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
