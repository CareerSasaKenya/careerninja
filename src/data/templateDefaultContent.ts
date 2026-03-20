import { classicPreviewData } from './classicPreviewData';
import { modernPreviewData } from './modernPreviewData';
import { executivePreviewData } from './executivePreviewData';
import { graduatePreviewData } from './graduatePreviewData';
import { functionalPreviewData } from './functionalPreviewData';
import { internshipPreviewData } from './internshipPreviewData';
import { creativePreviewData } from './creativePreviewData';
import { digitalProfessionalPreviewData } from './digitalProfessionalPreviewData';
import { personalBrandPreviewData } from './personalBrandPreviewData';
import { academicPreviewData } from './academicPreviewData';
import { technicalEngineeringPreviewData } from './technicalEngineeringPreviewData';
import { atsPreviewData } from './atsPreviewData';

export interface CVContent { personal: Record<string,string>; skills: string[]; experience: any[]; education: any[]; certifications: string[]; achievements: string[]; languages: string[]; tools: string[]; [key: string]: any; }

const e: CVContent = { personal:{}, skills:[], experience:[], education:[], certifications:[], achievements:[], languages:[], tools:[] };

const d: Record<string,CVContent> = {

export function getTemplateDefaultContent(templateName: string): CVContent { return d[templateName] || e; }
