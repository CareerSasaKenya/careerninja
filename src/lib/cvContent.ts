import type { CVContent, CVEducation, CVExperience, CVPersonal } from '@/types/careerDocuments';

function str(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => str(item));
}

function formatDates(startDate: string, endDate: string, current: boolean): string {
  if (current && startDate) return `${startDate} – Present`;
  if (startDate && endDate) return `${startDate} – ${endDate}`;
  return startDate || endDate;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeExperience(raw: unknown): CVExperience[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const e = asRecord(item);
    const startDate = str(e.startDate);
    const endDate = str(e.endDate);
    const datesRaw = str(e.dates);
    const current = Boolean(e.current) || /present/i.test(datesRaw);
    const dates = datesRaw || formatDates(startDate, endDate, current);
    let details = stringArray(e.details);
    if (details.length === 0) details = stringArray(e.responsibilities);
    if (details.length === 0 && str(e.description)) details = [str(e.description)];
    return {
      jobTitle: str(e.jobTitle || e.role),
      role: str(e.role || e.jobTitle),
      company: str(e.company || e.organization || e.institution),
      organization: str(e.organization),
      location: str(e.location),
      dates,
      startDate,
      endDate,
      current,
      description: str(e.description) || undefined,
      details,
      responsibilities: details,
    };
  });
}

function normalizeEducation(raw: unknown): CVEducation[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const e = asRecord(item);
    const startDate = str(e.startDate);
    const endDate = str(e.endDate);
    const dates = str(e.dates) || formatDates(startDate, endDate, false);
    return {
      degree: str(e.degree || e.program),
      institution: str(e.institution),
      dates,
      startDate,
      endDate,
      grade: str(e.grade) || undefined,
      thesis: str(e.thesis) || undefined,
    };
  });
}

function normalizePersonal(raw: unknown): CVPersonal {
  const p = asRecord(raw);
  const profile = str(p.profile || p.summary || p.objective);
  return {
    name: str(p.name),
    title: str(p.title),
    email: str(p.email),
    phone: str(p.phone),
    location: str(p.location),
    linkedin: str(p.linkedin),
    website: str(p.website),
    github: str(p.github),
    photoUrl: str(p.photoUrl),
    profile,
    summary: str(p.summary) || profile,
    objective: str(p.objective) || profile,
  };
}

/**
 * Canonicalise CV JSON so editors, previews, and downloads share one shape.
 * Unknown keys are kept for specialised templates (publications, boards, etc.).
 */
export function normalizeCVContent(raw: unknown): CVContent {
  const source = asRecord(raw);
  const personal = normalizePersonal(source.personal);
  const experience = normalizeExperience(source.experience);
  const {
    personal: _p,
    skills: _s,
    experience: _e,
    education: _ed,
    certifications: _c,
    achievements: _a,
    languages: _l,
    tools: _t,
    ...rest
  } = source;

  return {
    ...rest,
    personal,
    skills: stringArray(source.skills),
    experience,
    education: normalizeEducation(source.education),
    certifications: stringArray(source.certifications),
    achievements: stringArray(source.achievements || source.awards),
    languages: stringArray(source.languages),
    tools: stringArray(source.tools),
    projects: Array.isArray(source.projects) ? source.projects : [],
    internships: Array.isArray(source.internships)
      ? normalizeExperience(source.internships)
      : experience,
    activities: stringArray(source.activities),
    publications: stringArray(source.publications),
    conferences: stringArray(source.conferences),
    grants: stringArray(source.grants || source.certifications),
    awards: stringArray(source.awards || source.achievements),
    boardMemberships: stringArray(source.boardMemberships),
    strategicInitiatives: stringArray(source.strategicInitiatives),
    researchInterests: stringArray(source.researchInterests).length
      ? stringArray(source.researchInterests)
      : stringArray(source.skills),
  };
}

function experienceAsRole(exp: CVExperience[]) {
  return exp.map((e) => ({
    jobTitle: e.jobTitle || e.role || '',
    role: e.role || e.jobTitle || '',
    company: e.company || e.organization || '',
    organization: e.organization || e.company || '',
    location: e.location || '',
    dates: e.dates || '',
    details: e.details || [],
    responsibilities: e.responsibilities || e.details || [],
    description: e.description || (e.details || []).join(' '),
  }));
}

/**
 * Props object every CV template component already accepts.
 * Dual field names (jobTitle/role, details/responsibilities) keep Classic and ATS layouts working.
 */
export function toTemplateProps(raw: unknown, _templateName?: string) {
  const content = normalizeCVContent(raw);
  const p = content.personal;
  const experience = experienceAsRole(content.experience);
  const internships = experienceAsRole(
    Array.isArray(content.internships) && content.internships.length
      ? content.internships
      : content.experience,
  );

  return {
    name: p.name || '',
    title: p.title || '',
    tagline: p.title || '',
    photoUrl: p.photoUrl || '',
    contact: {
      phone: p.phone || '',
      email: p.email || '',
      linkedin: p.linkedin || '',
      location: p.location || '',
      website: p.website || '',
      github: p.github || p.website || '',
      institution: p.location || '',
    },
    profile: p.profile || p.summary || '',
    objective: p.objective || p.profile || p.summary || '',
    summary: p.summary || p.profile || '',
    skills: content.skills,
    experience,
    education: content.education.map((e) => ({
      degree: e.degree || '',
      institution: e.institution || '',
      dates: e.dates || '',
      thesis: e.thesis,
      grade: e.grade,
    })),
    certifications: content.certifications,
    achievements: content.achievements,
    languages: content.languages,
    tools: content.tools,
    projects: content.projects || [],
    internships,
    activities: content.activities || [],
    researchInterests: content.researchInterests?.length
      ? content.researchInterests
      : content.skills,
    positions: experience.map((e) => ({
      role: e.role,
      institution: e.company,
      location: e.location,
      dates: e.dates,
    })),
    publications: content.publications || [],
    conferences: content.conferences || [],
    grants: content.grants?.length ? content.grants : content.certifications,
    awards: content.awards?.length ? content.awards : content.achievements,
    techStack: content.skills,
    coreSkills: content.skills,
    skillCategories: content.skillCategories || [],
    social: content.social || [],
    speaking: content.speaking || [],
    mediaFeatures: content.mediaFeatures || [],
    boardMemberships: content.boardMemberships || [],
    strategicInitiatives: content.strategicInitiatives || [],
  };
}
