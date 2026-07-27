-- Google Indexing API queue for job posting URL notifications.
-- DB triggers enqueue URL_UPDATED / URL_DELETED on publish and unpublish.

CREATE TABLE IF NOT EXISTS public.google_indexing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  url_path TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('URL_UPDATED', 'URL_DELETED')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'done', 'failed', 'skipped')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_google_indexing_queue_pending
  ON public.google_indexing_queue (created_at ASC)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_google_indexing_queue_job_id
  ON public.google_indexing_queue (job_id);

-- At most one pending notification per job; latest type wins via upsert helper.
CREATE UNIQUE INDEX IF NOT EXISTS idx_google_indexing_queue_pending_job
  ON public.google_indexing_queue (job_id)
  WHERE status = 'pending' AND job_id IS NOT NULL;

COMMENT ON TABLE public.google_indexing_queue IS
  'Queue of Google Indexing API urlNotifications for job pages';

-- Upsert helper used by app code and triggers
CREATE OR REPLACE FUNCTION public.enqueue_google_indexing(
  p_job_id UUID,
  p_url_path TEXT,
  p_notification_type TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  queue_id UUID;
BEGIN
  IF p_notification_type NOT IN ('URL_UPDATED', 'URL_DELETED') THEN
    RAISE EXCEPTION 'Invalid notification_type: %', p_notification_type;
  END IF;

  IF p_url_path IS NULL OR length(trim(p_url_path)) = 0 THEN
    RAISE EXCEPTION 'url_path is required';
  END IF;

  -- Supersede any existing pending row for this job
  UPDATE public.google_indexing_queue
  SET
    status = 'skipped',
    last_error = 'superseded',
    updated_at = NOW()
  WHERE job_id = p_job_id
    AND status = 'pending';

  INSERT INTO public.google_indexing_queue (
    job_id,
    url_path,
    notification_type,
    status
  )
  VALUES (
    p_job_id,
    trim(p_url_path),
    p_notification_type,
    'pending'
  )
  RETURNING id INTO queue_id;

  RETURN queue_id;
END;
$$;

COMMENT ON FUNCTION public.enqueue_google_indexing IS
  'Enqueue (or replace pending) Google Indexing notification for a job URL path';

-- Trigger: enqueue on publish / unpublish / delete
CREATE OR REPLACE FUNCTION public.jobs_enqueue_google_indexing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  url_path TEXT;
  old_active BOOLEAN;
  new_active BOOLEAN;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'active' THEN
      url_path := '/jobs/' || COALESCE(NULLIF(trim(OLD.job_slug), ''), NULLIF(trim(OLD.slug), ''), OLD.id::text);
      PERFORM public.enqueue_google_indexing(OLD.id, url_path, 'URL_DELETED');
    END IF;
    RETURN OLD;
  END IF;

  url_path := '/jobs/' || COALESCE(NULLIF(trim(NEW.job_slug), ''), NULLIF(trim(NEW.slug), ''), NEW.id::text);
  new_active := NEW.status = 'active';

  IF TG_OP = 'INSERT' THEN
    IF new_active THEN
      PERFORM public.enqueue_google_indexing(NEW.id, url_path, 'URL_UPDATED');
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE
  old_active := OLD.status = 'active';

  IF new_active AND NOT old_active THEN
    PERFORM public.enqueue_google_indexing(NEW.id, url_path, 'URL_UPDATED');
  ELSIF old_active AND NOT new_active THEN
    PERFORM public.enqueue_google_indexing(NEW.id, url_path, 'URL_DELETED');
  ELSIF new_active AND old_active AND (
    COALESCE(NEW.job_slug, '') IS DISTINCT FROM COALESCE(OLD.job_slug, '')
    OR COALESCE(NEW.slug, '') IS DISTINCT FROM COALESCE(OLD.slug, '')
  ) THEN
    -- Canonical URL changed while still active — notify Google of the new URL.
    PERFORM public.enqueue_google_indexing(NEW.id, url_path, 'URL_UPDATED');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_jobs_enqueue_google_indexing ON public.jobs;
DROP TRIGGER IF EXISTS trg_jobs_enqueue_google_indexing_write ON public.jobs;
DROP TRIGGER IF EXISTS trg_jobs_enqueue_google_indexing_delete ON public.jobs;

-- AFTER write: slug trigger has already run; safe to build canonical path
CREATE TRIGGER trg_jobs_enqueue_google_indexing_write
  AFTER INSERT OR UPDATE OF status, job_slug, slug
  ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.jobs_enqueue_google_indexing();

-- BEFORE delete: job row still exists so FK on queue.job_id succeeds;
-- ON DELETE SET NULL then clears job_id while preserving url_path for URL_DELETED.
CREATE TRIGGER trg_jobs_enqueue_google_indexing_delete
  BEFORE DELETE
  ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.jobs_enqueue_google_indexing();

-- Service role / backend only; no public access needed
ALTER TABLE public.google_indexing_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access google_indexing_queue"
  ON public.google_indexing_queue;

-- Authenticated admins can read queue status (optional dashboard use)
DROP POLICY IF EXISTS "Admins can read google_indexing_queue"
  ON public.google_indexing_queue;

CREATE POLICY "Admins can read google_indexing_queue"
  ON public.google_indexing_queue
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

GRANT SELECT ON public.google_indexing_queue TO authenticated;
GRANT ALL ON public.google_indexing_queue TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_google_indexing(UUID, TEXT, TEXT) TO service_role;
-- App routes use the service role; do not expose enqueue RPC to end users.
REVOKE EXECUTE ON FUNCTION public.enqueue_google_indexing(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_google_indexing(UUID, TEXT, TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_google_indexing(UUID, TEXT, TEXT) FROM anon;
