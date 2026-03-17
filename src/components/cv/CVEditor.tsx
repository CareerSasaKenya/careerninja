'use client';

import { useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateCV, type CandidateCV } from '@/lib/careerTools';

// Lazy-load template components for the live preview
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

interface Experience {
  jobTitle: string;
  company: string;
  location: string;
  dates: string;
  details: string[];
}

interface Education {
  degree: string;
  institution: string;
  dates: string;
}

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

export default function CVEditor({ cv, templateName, onSave, onCancel }: CVEditorProps) {
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const { toast } = useToast();

  const [personal, setPersonal] = useState({
    name: cv.content.personal?.name || '',
    title: cv.content.personal?.title || '',
    phone: cv.content.personal?.phone || '',
    email: cv.content.personal?.email || '',
    linkedin: cv.content.personal?.linkedin || '',
    location: cv.content.personal?.location || '',
    profile: cv.content.personal?.profile || ''
  });

  const [skills, setSkills] = useState<string[]>(cv.content.skills || []);
  const [experience, setExperience] = useState<Experience[]>(cv.content.experience || []);
  const [education, setEducation] = useState<Education[]>(cv.content.education || []);
  const [certifications, setCertifications] = useState<string[]>(cv.content.certifications || []);
  const [achievements, setAchievements] = useState<string[]>(cv.content.achievements || []);
  const [languages, setLanguages] = useState<string[]>(cv.content.languages || []);
  const [tools, setTools] = useState<string[]>(cv.content.tools || []);

  const handlePersonalChange = (field: string, value: string) => {
    setPersonal(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => setSkills([...skills, '']);
  const updateSkill = (i: number, v: string) => { const s = [...skills]; s[i] = v; setSkills(s); };
  const removeSkill = (i: number) => setSkills(skills.filter((_, idx) => idx !== i));

  const addExperience = () => setExperience([...experience, { jobTitle: '', company: '', location: '', dates: '', details: [''] }]);
  const updateExperience = (i: number, field: string, value: string) => {
    const e = [...experience]; e[i] = { ...e[i], [field]: value }; setExperience(e);
  };
  const addExperienceDetail = (ei: number) => {
    const e = [...experience]; e[ei].details.push(''); setExperience(e);
  };
  const updateExperienceDetail = (ei: number, di: number, v: string) => {
    const e = [...experience]; e[ei].details[di] = v; setExperience(e);
  };
  const removeExperienceDetail = (ei: number, di: number) => {
    const e = [...experience]; e[ei].details = e[ei].details.filter((_, i) => i !== di); setExperience(e);
  };
  const removeExperience = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));

  const addEducation = () => setEducation([...education, { degree: '', institution: '', dates: '' }]);
  const updateEducation = (i: number, field: string, value: string) => {
    const e = [...education]; e[i] = { ...e[i], [field]: value }; setEducation(e);
  };
  const removeEducation = (i: number) => setEducation(education.filter((_, idx) => idx !== i));

  const addCertification = () => setCertifications([...certifications, '']);
  const updateCertification = (i: number, v: string) => { const c = [...certifications]; c[i] = v; setCertifications(c); };
  const removeCertification = (i: number) => setCertifications(certifications.filter((_, idx) => idx !== i));

  const addAchievement = () => setAchievements([...achievements, '']);
  const updateAchievement = (i: number, v: string) => { const a = [...achievements]; a[i] = v; setAchievements(a); };
  const removeAchievement = (i: number) => setAchievements(achievements.filter((_, idx) => idx !== i));

  const addLanguage = () => setLanguages([...languages, '']);
  const updateLanguage = (i: number, v: string) => { const l = [...languages]; l[i] = v; setLanguages(l); };
  const removeLanguage = (i: number) => setLanguages(languages.filter((_, idx) => idx !== i));

  const addTool = () => setTools([...tools, '']);
  const updateTool = (i: number, v: string) => { const t = [...tools]; t[i] = v; setTools(t); };
  const removeTool = (i: number) => setTools(tools.filter((_, idx) => idx !== i));

  // Build the data object that matches what the template components expect
  const liveData = {
    name: personal.name,
    title: personal.title,
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
    // pass-through extras for specialized templates
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
        // preserve any extra fields from original content
        ...Object.fromEntries(
          Object.entries(cv.content).filter(([k]) =>
            !['personal','skills','experience','education','certifications','achievements','languages','tools'].includes(k)
          )
        ),
      };
      await updateCV(cv.id, { content: updatedContent });
      toast({ title: 'Success', description: 'CV updated successfully' });
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
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowPreview(p => !p)}
        >
          {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>

      {/* Split pane: form + live preview */}
      <div className={`flex flex-1 overflow-hidden gap-0 ${showPreview ? 'flex-row' : ''}`}>
        {/* Form */}
        <div className={`overflow-y-auto p-4 space-y-6 ${showPreview ? 'w-1/2 border-r' : 'w-full'}`}>
          {/* Personal Information */}
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={personal.name} onChange={e => handlePersonalChange('name', e.target.value)} placeholder="John Doe" />
                </div>
                <div>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input id="title" value={personal.title} onChange={e => handlePersonalChange('title', e.target.value)} placeholder="Software Engineer" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={personal.phone} onChange={e => handlePersonalChange('phone', e.target.value)} placeholder="+254 712 345 678" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={personal.email} onChange={e => handlePersonalChange('email', e.target.value)} placeholder="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" value={personal.linkedin} onChange={e => handlePersonalChange('linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={personal.location} onChange={e => handlePersonalChange('location', e.target.value)} placeholder="Nairobi, Kenya" />
                </div>
              </div>
              <div>
                <Label htmlFor="profile">Professional Summary</Label>
                <Textarea id="profile" value={personal.profile} onChange={e => handlePersonalChange('profile', e.target.value)} placeholder="Brief professional summary..." rows={4} />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Skills</CardTitle>
                <Button size="sm" onClick={addSkill}><Plus className="h-4 w-4 mr-1" />Add Skill</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {skills.map((skill, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={skill} onChange={e => updateSkill(i, e.target.value)} placeholder="e.g., JavaScript, Project Management" />
                  <Button size="sm" variant="destructive" onClick={() => removeSkill(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Work Experience</CardTitle>
                <Button size="sm" onClick={addExperience}><Plus className="h-4 w-4 mr-1" />Add Experience</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {experience.map((exp, ei) => (
                <div key={ei} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">Experience {ei + 1}</h4>
                    <Button size="sm" variant="destructive" onClick={() => removeExperience(ei)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Job Title</Label>
                      <Input value={exp.jobTitle} onChange={e => updateExperience(ei, 'jobTitle', e.target.value)} placeholder="Software Engineer" />
                    </div>
                    <div>
                      <Label>Company</Label>
                      <Input value={exp.company} onChange={e => updateExperience(ei, 'company', e.target.value)} placeholder="Tech Company Ltd" />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input value={exp.location} onChange={e => updateExperience(ei, 'location', e.target.value)} placeholder="Nairobi" />
                    </div>
                    <div>
                      <Label>Dates</Label>
                      <Input value={exp.dates} onChange={e => updateExperience(ei, 'dates', e.target.value)} placeholder="Jan 2020 - Present" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Responsibilities & Achievements</Label>
                      <Button size="sm" variant="outline" onClick={() => addExperienceDetail(ei)}><Plus className="h-4 w-4 mr-1" />Add Point</Button>
                    </div>
                    <div className="space-y-2">
                      {exp.details.map((detail, di) => (
                        <div key={di} className="flex gap-2">
                          <Textarea value={detail} onChange={e => updateExperienceDetail(ei, di, e.target.value)} placeholder="Describe your responsibility or achievement..." rows={2} />
                          <Button size="sm" variant="destructive" onClick={() => removeExperienceDetail(ei, di)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Education</CardTitle>
                <Button size="sm" onClick={addEducation}><Plus className="h-4 w-4 mr-1" />Add Education</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">Education {i + 1}</h4>
                    <Button size="sm" variant="destructive" onClick={() => removeEducation(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Degree/Qualification</Label>
                      <Input value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} placeholder="Bachelor of Science in Computer Science" />
                    </div>
                    <div>
                      <Label>Institution</Label>
                      <Input value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} placeholder="University of Nairobi" />
                    </div>
                    <div>
                      <Label>Dates</Label>
                      <Input value={edu.dates} onChange={e => updateEducation(i, 'dates', e.target.value)} placeholder="2015 - 2019" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Certifications</CardTitle>
                <Button size="sm" onClick={addCertification}><Plus className="h-4 w-4 mr-1" />Add Certification</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {certifications.map((cert, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={cert} onChange={e => updateCertification(i, e.target.value)} placeholder="e.g., AWS Certified Solutions Architect - 2023" />
                  <Button size="sm" variant="destructive" onClick={() => removeCertification(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Professional Achievements</CardTitle>
                <Button size="sm" onClick={addAchievement}><Plus className="h-4 w-4 mr-1" />Add Achievement</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {achievements.map((achievement, i) => (
                <div key={i} className="flex gap-2">
                  <Textarea value={achievement} onChange={e => updateAchievement(i, e.target.value)} placeholder="Describe a significant achievement..." rows={2} />
                  <Button size="sm" variant="destructive" onClick={() => removeAchievement(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Languages</CardTitle>
                <Button size="sm" onClick={addLanguage}><Plus className="h-4 w-4 mr-1" />Add Language</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {languages.map((language, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={language} onChange={e => updateLanguage(i, e.target.value)} placeholder="e.g., English - Fluent" />
                  <Button size="sm" variant="destructive" onClick={() => removeLanguage(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tools & Platforms */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tools & Platforms</CardTitle>
                <Button size="sm" onClick={addTool}><Plus className="h-4 w-4 mr-1" />Add Tool</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tools.map((tool, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={tool} onChange={e => updateTool(i, e.target.value)} placeholder="e.g., Microsoft Office, Git" />
                  <Button size="sm" variant="destructive" onClick={() => removeTool(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-4 pb-2 border-t">
            <Button variant="outline" onClick={onCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="w-1/2 overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b bg-muted/20 text-xs text-muted-foreground text-center">
              Live Preview — this is exactly how your CV will look when downloaded
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
        )}      </div>
    </div>
  );
}
