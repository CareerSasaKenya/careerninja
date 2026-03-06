import { supabase } from "@/integrations/supabase/client";

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  notes?: string;
  created_at: string;
  jobs?: any;
}

export const saveJob = async (jobId: string, notes?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be logged in to save jobs");
  }

  const { data, error } = await supabase
    .from("saved_jobs")
    .insert({
      user_id: user.id,
      job_id: jobId,
      notes: notes || null
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const unsaveJob = async (jobId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be logged in");
  }

  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId);

  if (error) throw error;
};

export const isJobSaved = async (jobId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (error) {
    console.error("Error checking if job is saved:", error);
    return false;
  }

  return !!data;
};

export const getSavedJobs = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be logged in");
  }

  const { data, error } = await supabase
    .from("saved_jobs")
    .select(`
      *,
      jobs (
        *,
        companies (
          id,
          name,
          logo
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as SavedJob[];
};

export const updateSavedJobNotes = async (jobId: string, notes: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be logged in");
  }

  const { error } = await supabase
    .from("saved_jobs")
    .update({ notes } as any)
    .eq("user_id", user.id)
    .eq("job_id", jobId);

  if (error) throw error;
};
