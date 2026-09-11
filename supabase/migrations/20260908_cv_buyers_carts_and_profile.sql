-- CV buyers / carts: funnel events, profile document link, email tracking.

ALTER TABLE public.candidate_documents
  ADD COLUMN IF NOT EXISTS candidate_cv_id UUID REFERENCES public.candidate_cvs(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS candidate_documents_cv_id_unique
  ON public.candidate_documents (candidate_cv_id)
  WHERE candidate_cv_id IS NOT NULL;

ALTER TABLE public.candidate_cvs
  ADD COLUMN IF NOT EXISTS last_emailed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.career_funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('chosen', 'uploaded', 'edited', 'purchased', 'emailed')),
  sku TEXT,
  template_id UUID REFERENCES public.cv_templates(id) ON DELETE SET NULL,
  template_name TEXT,
  cv_id UUID REFERENCES public.candidate_cvs(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS career_funnel_events_user_idx
  ON public.career_funnel_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS career_funnel_events_action_idx
  ON public.career_funnel_events (action, created_at DESC);
CREATE INDEX IF NOT EXISTS career_funnel_events_sku_idx
  ON public.career_funnel_events (sku);
CREATE INDEX IF NOT EXISTS career_funnel_events_cv_idx
  ON public.career_funnel_events (cv_id);

ALTER TABLE public.career_funnel_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own funnel events" ON public.career_funnel_events;
CREATE POLICY "Users can insert own funnel events"
  ON public.career_funnel_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own funnel events" ON public.career_funnel_events;
CREATE POLICY "Users can view own funnel events"
  ON public.career_funnel_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view funnel events" ON public.career_funnel_events;
CREATE POLICY "Admins can view funnel events"
  ON public.career_funnel_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.email_logs DROP CONSTRAINT IF EXISTS email_logs_email_type_check;
ALTER TABLE public.email_logs ADD CONSTRAINT email_logs_email_type_check
  CHECK (email_type IN (
    'transactional', 'marketing', 'job_alert', 'weekly_digest',
    'welcome', 'password_reset', 'application_status', 'new_message',
    'newsletter', 'confirmation', 'campaign',
    'broadcast', 'reengagement', 'reminder', 'employer_welcome',
    'profile_nudge', 'job_expiry', 'cv_delivery'
  ));

COMMENT ON TABLE public.career_funnel_events IS
  'CV template carts and buyer activity: chosen, uploaded, edited, purchased, emailed.';
COMMENT ON COLUMN public.candidate_documents.candidate_cv_id IS
  'Links a profile document to the Career Tools CV it was generated from.';
