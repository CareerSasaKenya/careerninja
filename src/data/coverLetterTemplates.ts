/**
 * Cover Letter Template Registry
 * Maps template names to their React components, preview data, and schemas.
 * Add new templates here as they are built.
 */

import ClassicProfessionalLetter from '@/components/cover-letter/templates/ClassicProfessionalLetter';
import { classicLetterPreviewData } from './classicLetterPreviewData';
import { classicLetterSchema } from '@/schemas/classicLetterSchema';

import ModernProfessionalLetter from '@/components/cover-letter/templates/ModernProfessionalLetter';
import { modernLetterPreviewData } from './modernLetterPreviewData';
import { modernLetterSchema } from '@/schemas/modernLetterSchema';
import ShortDirectLetter from '@/components/cover-letter/templates/ShortDirectLetter';
import { shortLetterPreviewData } from './shortLetterPreviewData';
import { shortLetterSchema } from '@/schemas/shortLetterSchema';

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
  'Modern Professional Cover Letter': {
    id: 'modern-professional',
    name: 'Modern Professional Cover Letter',
    category: 'professional',
    description:
      'Cleaner layout with better spacing and a contemporary tone. Ideal for private sector, marketing, business, and mid-level professional roles.',
    bestFor: ['Private sector', 'Marketing', 'Business roles', 'Mid-level professionals', 'Corporate upgrades'],
    component: ModernProfessionalLetter,
    defaultData: modernLetterPreviewData as unknown as Record<string, string>,
    schema: modernLetterSchema,
    isPremium: false,
  },
  'Short & Direct Cover Letter': {
    id: 'short-direct',
    name: 'Short & Direct Cover Letter',
    category: 'professional',
    description:
      'Concise 3-paragraph format built for impact. Ideal for startups, tech companies, online applications, and busy recruiters who skim quickly.',
    bestFor: ['Startups', 'Tech companies', 'Online applications', 'Busy recruiters'],
    component: ShortDirectLetter,
    defaultData: shortLetterPreviewData as unknown as Record<string, string>,
    schema: shortLetterSchema,
    isPremium: false,
  },
  // Additional templates will be registered here as they are built:
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
