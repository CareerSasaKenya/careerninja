-- Fix duplicate_job function to match actual jobs table structure

CREATE OR REPLACE FUNCTION duplicate_job(source_job_id UUID, new_title TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  new_job_id UUID;
  source_job jobs%ROWTYPE;
BEGIN
  -- Get source job
  SELECT * INTO source_job FROM jobs WHERE id = source_job_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;
  
  -- Check permission
  IF source_job.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Create duplicate with only existing columns
  INSERT INTO jobs (
    user_id, title, company, location, description, salary, apply_link, apply_email
  ) VALUES (
    source_job.user_id,
    COALESCE(new_title, source_job.title || ' (Copy)'),
    source_job.company,
    source_job.location,
    source_job.description,
    source_job.salary,
    source_job.apply_link,
    source_job.apply_email
  ) RETURNING id INTO new_job_id;
  
  -- Log the duplication
  INSERT INTO job_history (job_id, action, changed_by, changes)
  VALUES (
    new_job_id,
    'duplicated',
    auth.uid(),
    jsonb_build_object('source_job_id', source_job_id)
  );
  
  RETURN new_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
