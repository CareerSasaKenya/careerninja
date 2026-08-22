-- Automatic social sharing queue for jobs (Facebook + LinkedIn first)

CREATE TABLE IF NOT EXISTS public.social_share_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'linkedin')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'posted', 'failed', 'skipped')),
  caption TEXT,
  share_url TEXT,
  image_url TEXT,
  platform_post_id TEXT,
  error_message TEXT,
  skip_reason TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT social_share_queue_job_platform_unique UNIQUE (job_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_social_share_queue_status_scheduled
  ON public.social_share_queue (status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_social_share_queue_posted_at
  ON public.social_share_queue (posted_at)
  WHERE status = 'posted';

CREATE INDEX IF NOT EXISTS idx_social_share_queue_job_id
  ON public.social_share_queue (job_id);

ALTER TABLE public.social_share_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only social_share_queue" ON public.social_share_queue;
CREATE POLICY "Service role only social_share_queue"
  ON public.social_share_queue
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.social_share_queue IS
  'Queue for auto-posting new active jobs to social platforms during Kenyan business hours';
