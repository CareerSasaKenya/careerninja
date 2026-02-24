'use client';

import { useProfile } from '@/hooks/useProfile';
import { Loader2 } from 'lucide-react';
import ProfileCompletenessCard from '@/components/profile/ProfileCompletenessCard';
import BasicInfoForm from '@/components/profile/BasicInfoForm';
import WorkExperienceSection from '@/components/profile/WorkExperienceSection';
import EducationSection from '@/components/profile/EducationSection';
import SkillsSection from '@/components/profile/SkillsSection';

export default function ProfilePage() {
  const { profile, workExperience, education, skills, isLoading, completeness, refetch } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your professional profile and increase your visibility to employers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Completeness */}
        <div className="lg:col-span-1">
          <ProfileCompletenessCard
            completeness={completeness}
            profile={profile}
            workExperience={workExperience}
            education={education}
            skills={skills}
          />
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          <BasicInfoForm profile={profile} onUpdate={refetch} />
          
          {profile && (
            <>
              <WorkExperienceSection
                candidateId={profile.id}
                experiences={workExperience}
                onUpdate={refetch}
              />
              
              <EducationSection
                candidateId={profile.id}
                education={education}
                onUpdate={refetch}
              />
              
              <SkillsSection
                candidateId={profile.id}
                skills={skills}
                onUpdate={refetch}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
