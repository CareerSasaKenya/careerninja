'use client';

import { useState, lazy, Suspense, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, X, Eye, EyeOff, ChevronDown, ChevronRight, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateCV, type CandidateCV } from '@/lib/careerTools';

const ClassicTemplate = lazy(() => import('./templates/ClassicTemplate'));
const ModernTemplate = lazy(() => import('./templates/ModernTemplate'));
const ExecutiveTemplate = lazy(() => import('./templates/ExecutiveTemplate'));
const GraduateTemplate = lazy(() => import('./templates/GraduateTemplate'));
const FunctionalTemplate = lazy(() => import('./templates/FunctionalTemplate'));
const InternshipTemplate = lazy(() => import('./templates/InternshipTemplate'));
const CreativeTemplate = lazy(() => import('./templates/CreativeTemplate'));
const DigitalProfessionalTemplate = lazy(() => import('./templates/DigitalProfessionalTemplate'));
const PersonalBrandTemplate = lazy(() => import('./templates/PersonalBrandTemplate'));
const AcademicTemplate = lazy(() => import('./templates/AcademicTemplate'));
const TechnicalEngineeringTemplate = lazy(() => import('./templates/TechnicalEngineeringTemplate'));
const ATSOptimizedTemplate = lazy(() => import('./templates/ATSOptimizedTemplate'));

interface CVEditorProps {
  cv: CandidateCV;
  templateName?: string;
  onSave: () => void;
  onCancel: () => void;
}

interface Experience { jobTitle: string; company: string; location: string; dates: string; details: string[]; }
interface Education { degree: string; institution: string; dates: string; }

function LivePreview({ templateName, data }: { templateName: string; data: any }) {
  let Template: React.ComponentType<{ data: any }>;
  switch (templateName) {
    case 'Classic Professional': Template = ClassicTemplate; break;
    case 'Modern Professional': Template = ModernTemplate; break;
    case 'Executive Leadership': Template = ExecutiveTemplate; break;
    case 'Graduate Starter CV': Template = GraduateTemplate; break;
    case 'Skills-Based (Functional)': Template = FunctionalTemplate; break;
    case 'Internship / Industrial Attachment': Template = InternshipTemplate; break;
    case 'Creative Portfolio': Template = CreativeTemplate; break;
    case 'Digital Professional': Template = DigitalProfessionalTemplate; break;
    case 'Personal Brand CV': Template = PersonalBrandTemplate; break;
    case 'Academic / Research CV': Template = AcademicTemplate; break;
    case 'Technical / Engineering CV': Template = TechnicalEngineeringTemplate; break;
    case 'International / ATS Optimized CV': Template = ATSOptimizedTemplate; break;
    default: Template = ClassicTemplate;
  }
  return <Template data={data} />;
}

/** Collapsible section wrapper */
function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <CardHeader className="py-3 px-4 cursor-pointer select-none" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && <CardContent className="pt-0 pb-4 px-4">{children}</CardContent>}
    </Card>
  );
}

export default function CVEditor({ cv, templateName, onSave, onCancel }: CVEditorProps) {
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const { toast } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Personal info
  const [personal, setPersonal] = useState({
    name: cv.content.personal?.name || '',
    title: cv.content.personal?.title || '',
    phone: cv.content.personal?.phone || '',
    email: cv.content.personal?.email || '',
    linkedin: cv.content.personal?.linkedin || '',
    location: cv.content.personal?.location || '',
    profile: cv.content.personal?.profile || '',
    photoUrl: cv.content.personal?.photoUrl || '',
  });

  // Core sections
  const [skills, setSkills] = useState<string[]>(cv.content.skills || []);
  const [experience, setExperience] = useState<Experience[]>(cv.content.experience || []);
  const [education, setEducation] = useState<Education[]>(cv.content.education || []);
  const [certifications, setCertifications] = useState<string[]>(cv.content.certifications || []);
  const [achievements, setAchievements] = useState<string[]>(cv.content.achievements || []);
  const [languages, setLanguages] = useState<string[]>(cv.content.languages || []);
  const [tools, setTools] = useState<string[]>(cv.content.tools || []);

  // Optional sections — only shown when user adds them
  const [showLanguages, setShowLanguages] = useState((cv.content.languages || []).length > 0);
  const [showTools, setShowTools] = useState((cv.content.tools || []).length > 0);
  const [showCertifications, setShowCertifications] = useState((cv.content.certifications || []).length > 0);
  const [showAchievements, setShowAchievements] = useState((cv.content.achievements || []).length > 0);

  const set = (setter: React.Dispatch<React.SetStateAction<any[]>>) => (i: number, field: string, value: string) => {
    setter((prev: any[]) => { const a = [...prev]; a[i] = { ...a[i], [field]: value }; return a; });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPersonal(p => ({ ...p, photoUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Build live preview data — only real user input, no mock fallbacks
  const liveData = {
    name: personal.name,
    title: personal.title,
    photoUrl: personal.photoUrl,
    contact: {
      phone: personal.phone,
      email: personal.email,
      linkedin: personal.linkedin,
      location: personal.location,
    },
    profile: personal.profile,
    objective: personal.profile,
    summary: personal.profile,
    skills,
    experience,
    education,
    certifications,
    achievements,
    languages,
    tools,
    researchInterests: skills,
    positions: experience,
    publications: cv.content.publications || [],
    conferences: cv.content.conferences || [],
    grants: certifications,
    awards: achievements,
    projects: cv.content.projects || [],
    internships: experience,
    activities: cv.content.activities || [],
    techStack: skills,
    coreSkills: skills,
    skillCategories: cv.content.skillCategories || [],
    tagline: personal.title,
    social: cv.content.social || [],
    speaking: cv.content.speaking || [],
    mediaFeatures: cv.content.mediaFeatures || [],
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedContent = {
        personal,
        skills: skills.filter(s => s.trim()),
        experience: experience.filter(e => e.jobTitle || e.company),
        education: education.filter(e => e.degree || e.institution),
        certifications: certifications.filter(c => c.trim()),
        achievements: achievements.filter(a => a.trim()),
        languages: languages.filter(l => l.trim()),
        tools: tools.filter(t => t.trim()),
        ...Object.fromEntries(
          Object.entries(cv.content).filter(([k]) =>
            !['personal','skills','experience','education','certifications','achievements','languages','tools'].includes(k)
          )
        ),
      };
      await updateCV(cv.id, { content: updatedContent });
      toast({ title: 'Saved', description: 'CV updated successfully' });
      onSave();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const resolvedTemplateName = templateName || 'Classic Professional';

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <span className="text-sm text-muted-foreground">
          Template: <span className="font-medium text-foreground">{resolvedTemplateName}</span>
        </span>
        <Button size="sm" variant="outline" onClick={() => setShowPreview(p => !p)}>
          {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>

      <div className={`flex flex-1 overflow-hidden ${showPreview ? 'flex-row' : ''}`}>
        {/* ── LEFT: Form ── */}
        <div className={`overflow-y-auto p-4 space-y-4 ${showPreview ? 'w-1/2 border-r' : 'w-full'}`}>

          {/* Personal Information */}
          <Section title="Personal Information">
            {/* Passport Photo */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors bg-gray-50"
                onClick={() => photoInputRef.current?.click()}
              >
                {personal.photoUrl ? (
                  <img src={personal.photoUrl} alt="Passport photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Camera className="h-6 w-6 mb-1" />
                    <span className="text-[10px] text-center leading-tight">Add Photo</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Passport / Profile Photo (optional)</p>
                <Button size="sm" variant="outline" onClick={() => photoInputRef.current?.click()}>
                  {personal.photoUrl ? 'Change Photo' : 'Upload Photo'}
                </Button>
                {personal.photoUrl && (
                  <Button size="sm" variant="ghost" className="ml-2 text-destructive" onClick={() => setPersonal(p => ({ ...p, photoUrl: '' }))}>
                    Remove
                  </Button>
                )}
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Full Name</Label>
                <Input value={personal.name} onChange={e => setPersonal(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Jane Wanjiku Mwangi" />
              </div>
              <div>
                <Label>Professional Title</Label>
                <Input value={personal.title} onChange={e => setPersonal(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={personal.phone} onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))} placeholder="+254 712 345 678" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={personal.email} onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))} placeholder="jane@example.com" />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={personal.location} onChange={e => setPersonal(p => ({ ...p, location: e.target.value }))} placeholder="Nairobi, Kenya" />
              </div>
              <div>
                <Label>LinkedIn</Label>
                <Input value={personal.linkedin} onChange={e => setPersonal(p => ({ ...p, linkedin: e.target.value }))} placeholder="linkedin.com/in/janewanjiku" />
              </div>
            </div>
            <div className="mt-3">
              <Label>Professional Summary</Label>
              <Textarea value={personal.profile} onChange={e => setPersonal(p => ({ ...p, profile: e.target.value }))} placeholder="Brief summary of your professional background and goals..." rows={4} />
            </div>
          </Section>

          {/* Skills */}
          <Section title="Skills">
            <div className="space-y-2">
              {skills.map((skill, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={skill} onChange={e => { const s = [...skills]; s[i] = e.target.value; setSkills(s); }} placeholder="e.g. Project Management" />
                  <Button size="sm" variant="ghost" className="text-destructive px-2" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setSkills([...skills, ''])}><Plus className="h-4 w-4 mr-1" />Add Skill</Button>
            </div>
          </Section>

          {/* Work Experience */}
          <Section title="Work Experience">
            <div className="space-y-4">
              {experience.map((exp, ei) => (
                <div key={ei} className="border rounded-lg p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">Experience {ei + 1}</span>
                    <Button size="sm" variant="ghost" className="text-destructive px-2 h-7" onClick={() => setExperience(experience.filter((_, i) => i !== ei))}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2"><Label className="text-xs">Job Title</Label><Input value={exp.jobTitle} onChange={e => set(setExperience)(ei, 'jobTitle', e.target.value)} placeholder="e.g. Marketing Manager" /></div>
                    <div><Label className="text-xs">Company</Label><Input value={exp.company} onChange={e => set(setExperience)(ei, 'company', e.target.value)} placeholder="Company Ltd" /></div>
                    <div><Label className="text-xs">Location</Label><Input value={exp.location} onChange={e => set(setExperience)(ei, 'location', e.target.value)} placeholder="Nairobi" /></div>
                    <div className="col-span-2"><Label className="text-xs">Dates</Label><Input value={exp.dates} onChange={e => set(setExperience)(ei, 'dates', e.target.value)} placeholder="Jan 2021 – Present" /></div>
                  </div>
                  <div>
                    <Label className="text-xs">Responsibilities / Achievements</Label>
                    <div className="space-y-1.5 mt-1">
                      {exp.details.map((d, di) => (
                        <div key={di} className="flex gap-2">
                          <Textarea value={d} onChange={e => { const ex = [...experience]; ex[ei].details[di] = e.target.value; setExperience(ex); }} placeholder="Describe a key responsibility or achievement..." rows={2} />
                          <Button size="sm" variant="ghost" className="text-destructive px-2" onClick={() => { const ex = [...experience]; ex[ei].details = ex[ei].details.filter((_, i) => i !== di); setExperience(ex); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      <Button size="sm" variant="ghost" onClick={() => { const ex = [...experience]; ex[ei].details.push(''); setExperience(ex); }}><Plus className="h-3.5 w-3.5 mr-1" />Add point</Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setExperience([...experience, { jobTitle: '', company: '', location: '', dates: '', details: [''] }])}><Plus className="h-4 w-4 mr-1" />Add Experience</Button>
            </div>
          </Section>

          {/* Education */}
          <Section title="Education">
            <div className="space-y-3">
              {education.map((edu, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">Education {i + 1}</span>
                    <Button size="sm" variant="ghost" className="text-destructive px-2 h-7" onClick={() => setEducation(education.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2"><Label className="text-xs">Degree / Qualification</Label><Input value={edu.degree} onChange={e => set(setEducation)(i, 'degree', e.target.value)} placeholder="Bachelor of Commerce" /></div>
                    <div><Label className="text-xs">Institution</Label><Input value={edu.institution} onChange={e => set(setEducation)(i, 'institution', e.target.value)} placeholder="University of Nairobi" /></div>
                    <div><Label className="text-xs">Dates</Label><Input value={edu.dates} onChange={e => set(setEducation)(i, 'dates', e.target.value)} placeholder="2015 – 2019" /></div>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setEducation([...education, { degree: '', institution: '', dates: '' }])}><Plus className="h-4 w-4 mr-1" />Add Education</Button>
            </div>
          </Section>

          {/* Optional sections */}
          {showCertifications && (
            <Section title="Certifications">
              <div className="space-y-2">
                {certifications.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={c} onChange={e => { const a = [...certifications]; a[i] = e.target.value; setCertifications(a); }} placeholder="e.g. PMP – PMI, 2023" />
                    <Button size="sm" variant="ghost" className="text-destructive px-2" onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setCertifications([...certifications, ''])}><Plus className="h-4 w-4 mr-1" />Add Certification</Button>
              </div>
            </Section>
          )}

          {showAchievements && (
            <Section title="Professional Achievements">
              <div className="space-y-2">
                {achievements.map((a, i) => (
                  <div key={i} className="flex gap-2">
                    <Textarea value={a} onChange={e => { const arr = [...achievements]; arr[i] = e.target.value; setAchievements(arr); }} placeholder="e.g. Increased sales by 40% in Q1 2023" rows={2} />
                    <Button size="sm" variant="ghost" className="text-destructive px-2" onClick={() => setAchievements(achievements.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setAchievements([...achievements, ''])}><Plus className="h-4 w-4 mr-1" />Add Achievement</Button>
              </div>
            </Section>
          )}

          {showLanguages && (
            <Section title="Languages">
              <div className="space-y-2">
                {languages.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={l} onChange={e => { const a = [...languages]; a[i] = e.target.value; setLanguages(a); }} placeholder="e.g. English – Fluent" />
                    <Button size="sm" variant="ghost" className="text-destructive px-2" onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setLanguages([...languages, ''])}><Plus className="h-4 w-4 mr-1" />Add Language</Button>
              </div>
            </Section>
          )}

          {showTools && (
            <Section title="Tools & Platforms">
              <div className="space-y-2">
                {tools.map((t, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={t} onChange={e => { const a = [...tools]; a[i] = e.target.value; setTools(a); }} placeholder="e.g. Microsoft Office, Figma" />
                    <Button size="sm" variant="ghost" className="text-destructive px-2" onClick={() => setTools(tools.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setTools([...tools, ''])}><Plus className="h-4 w-4 mr-1" />Add Tool</Button>
              </div>
            </Section>
          )}

          {/* Add optional section buttons */}
          {(!showCertifications || !showAchievements || !showLanguages || !showTools) && (
            <div className="border border-dashed rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Add optional sections:</p>
              <div className="flex flex-wrap gap-2">
                {!showCertifications && <Button size="sm" variant="outline" onClick={() => { setShowCertifications(true); setCertifications(['']); }}><Plus className="h-3.5 w-3.5 mr-1" />Certifications</Button>}
                {!showAchievements && <Button size="sm" variant="outline" onClick={() => { setShowAchievements(true); setAchievements(['']); }}><Plus className="h-3.5 w-3.5 mr-1" />Achievements</Button>}
                {!showLanguages && <Button size="sm" variant="outline" onClick={() => { setShowLanguages(true); setLanguages(['']); }}><Plus className="h-3.5 w-3.5 mr-1" />Languages</Button>}
                {!showTools && <Button size="sm" variant="outline" onClick={() => { setShowTools(true); setTools(['']); }}><Plus className="h-3.5 w-3.5 mr-1" />Tools & Platforms</Button>}
              </div>
            </div>
          )}

          {/* Save / Cancel */}
          <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-4 pb-2 border-t">
            <Button variant="outline" onClick={onCancel} disabled={saving}><X className="h-4 w-4 mr-2" />Cancel</Button>
            <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </div>

        {/* ── RIGHT: Live Preview ── */}
        {showPreview && (
          <div className="w-1/2 overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b bg-muted/20 text-xs text-muted-foreground text-center">
              Live Preview — updates as you type
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              <div style={{ width: '437px', height: '618px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: '794px', height: '1123px' }}>
                  <Suspense fallback={<div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading preview...</div>}>
                    <LivePreview templateName={resolvedTemplateName} data={liveData} />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
