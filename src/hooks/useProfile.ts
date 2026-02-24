'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CandidateProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  current_title: string | null;
  years_experience: number | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  expected_salary_currency: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  profile_visibility: 'private' | 'public' | 'recruiters_only';
  job_alerts_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  id: string;
  candidate_id: string;
  company_name: string;
  job_title: string;
  employment_type: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  achievements: string[] | null;
}

export interface Education {
  id: string;
  candidate_id: string;
  institution_name: string;
  degree_type: string;
  field_of_study: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  grade: string | null;
  description: string | null;
  achievements: string[] | null;
}

export interface Skill {
  id: string;
  candidate_id: string;
  skill_name: string;
  skill_category: string | null;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  years_of_experience: number | null;
  is_verified: boolean;
  endorsed_count: number;
}

export function useProfile() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completeness, setCompleteness] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      calculateCompleteness();
    }
  }, [profile, workExperience, education, skills]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        await fetchWorkExperience(profileData.id);
        await fetchEducation(profileData.id);
        await fetchSkills(profileData.id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkExperience = async (candidateId: string) => {
    const { data } = await supabase
      .from('candidate_work_experience')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('start_date', { ascending: false });
    
    if (data) setWorkExperience(data);
  };

  const fetchEducation = async (candidateId: string) => {
    const { data } = await supabase
      .from('candidate_education')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('start_date', { ascending: false });
    
    if (data) setEducation(data);
  };

  const fetchSkills = async (candidateId: string) => {
    const { data } = await supabase
      .from('candidate_skills')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('skill_name');
    
    if (data) setSkills(data);
  };

  const calculateCompleteness = () => {
    let score = 0;
    const weights = {
      basicInfo: 30,
      professional: 20,
      workExperience: 20,
      education: 15,
      skills: 15,
    };

    // Basic info (30%)
    if (profile?.full_name) score += 5;
    if (profile?.phone) score += 5;
    if (profile?.location) score += 5;
    if (profile?.bio && profile.bio.length > 50) score += 10;
    if (profile?.linkedin_url || profile?.portfolio_url || profile?.github_url) score += 5;

    // Professional (20%)
    if (profile?.current_title) score += 10;
    if (profile?.years_experience !== null) score += 5;
    if (profile?.expected_salary_min) score += 5;

    // Work experience (20%)
    if (workExperience.length > 0) score += 10;
    if (workExperience.length >= 2) score += 5;
    if (workExperience.some(exp => exp.description && exp.description.length > 50)) score += 5;

    // Education (15%)
    if (education.length > 0) score += 10;
    if (education.length >= 2) score += 5;

    // Skills (15%)
    if (skills.length >= 3) score += 5;
    if (skills.length >= 5) score += 5;
    if (skills.length >= 10) score += 5;

    setCompleteness(Math.min(score, 100));
  };

  return {
    profile,
    workExperience,
    education,
    skills,
    isLoading,
    completeness,
    refetch: fetchProfile,
  };
}
