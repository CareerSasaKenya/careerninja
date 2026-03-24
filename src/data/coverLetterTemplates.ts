/**
 * Cover Letter Template Registry
 * Maps template names to their React components, preview data, and schemas.
 * Add new templates here as they are built.
 */

import ClassicProfessionalLetter from '@/components/cover-letter/templates/ClassicProfessionalLetter';
import { classicLetterPreviewData } from './classicLetterPreviewData';
import { classicLetterSchema } from '@/schemas/classicLetterSchema';

export interface CoverLetterTemplateConfig {
  id: string;
  name: string;
  category: 'professional' | 'entry-level' | 'specialized';
  description: string;
  bestFor: string[];
  component: React.ComponentType<{ data: any }>;
  defaultData: Record<string, string>;
  schema: Record<string, { label: string; type: 'text' | 'textarea'; placeholder?: string; hint?: string }>;
  isPremium: boolean;
}

export const coverLetterTemplateRegistry: Record<string, CoverLetterTemplateConfig> = {
  'Classic Professional Cover Letter': {
    id: 'classic-professional',
    name: 'Classic Professional Cover Letter',
    category: 'professional',
    description:
      'A formal, structured cover letter with traditional formatting. The safest option — works for government, NGOs, banking, corporate, and administrative roles.',
    bestFor: ['Government jobs', 'NGOs', 'Banking', 'Corporate roles', 'Administrative positions'],
    component: ClassicProfessionalLetter,
    defaultData: classicLetterPreviewData as unknown as Record<string, string>,
    schema: classicLetterSchema,
    isPremium: false,
  },
  // Additional templates will be registered here as they are built:
  // 'Modern Professional Cover Letter': { ... },
  // 'Short & Direct Cover Letter': { ... },
  // 'Graduate / Entry-Level Cover Letter': { ... },
  // 'Internship / Attachment Cover Letter': { ... },
  // 'Career Change Cover Letter': { ... },
  // 'Personal Brand Cover Letter': { ... },
  // 'International / ATS-Friendly Cover Letter': { ... },
};

export function getCoverLetterTemplateConfig(
  templateName: string
): CoverLetterTemplateConfig | undefined {
  return coverLetterTemplateRegistry[templateName];
}
