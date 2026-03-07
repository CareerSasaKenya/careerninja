'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, GripVertical, Eye, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateCV, type CandidateCV } from '@/lib/careerTools';

interface CVEditorProps {
  cv: CandidateCV;
  onClose: () => void;
  onSave: () => void;
}

interface CVSection {
  id: string;
  type: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'languages' | 'projects' | 'custom';
  title: string;
  enabled: boolean;
  order: number;
}

const DEFAULT_SECTIONS: CVSection[] = [
  { id: 'personal', type: 'personal', title: 'Personal Information', enabled: true, order: 0 },
  { id: 'summary', type: 'summary', title: 'Professional Summary', enabled: true, order: 1 },
  { id: 'experience', type: 'experience', title: 'Work Experience', enabled: true, order: 2 },
  { id: 'education', type: 'education', title: 'Education', enabled: true, order: 3 },
  { id: 'skills', type: 'skills', title: 'Skills', enabled: true, order: 4 },
  { id: 'certifications', type: 'certifications', title: 'Certifications', enabled: false, order: 5 },
  { id: 'languages', type: 'languages', title: 'Languages', enabled: false, order: 6 },
  { id: 'projects', type: 'projects', title: 'Projects', enabled: false, order: 7 },
];

export default function CVEditor({ cv, onClose, onSave }: CVEditorProps) {
  const [cvData, setCvData] = useState(cv.content || {
    personal: {},
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    projects: []
  });
  
  const [sections, setSections] = useState<CVSection[]>(
    cv.content?.sections || DEFAULT_SECTIONS
  );
  
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const addCustomSection = () => {
    const newSection: CVSection = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      title: 'New Section',
      enabled: true,
      order: sections.length
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, title } : s
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCV(cv.id, {
        content: { ...cvData, sections },
        version: cv.version + 1
      });
      toast({
        title: 'Success',
        description: 'CV saved successfully'
      });
      onSave();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    setCvData({
      ...cvData,
      experience: [
        ...cvData.experience,
        {
          id: Date.now().toString(),
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        }
      ]
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setCvData({
      ...cvData,
      experience: cvData.experience.map((exp: any) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  const removeExperience = (id: string) => {
    setCvData({
      ...cvData,
      experience: cvData.experience.filter((exp: any) => exp.id !== id)
    });
  };

  const addEducation = () => {
    setCvData({
      ...cvData,
      education: [
        ...cvData.education,
        {
          id: Date.now().toString(),
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setCvData({
      ...cvData,
      education: cvData.education.map((edu: any) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  const removeEducation = (id: string) => {
    setCvData({
      ...cvData,
      education: cvData.education.filter((edu: any) => edu.id !== id)
    });
  };

  const addSkill = () => {
    const skill = prompt('Enter skill name:');
    if (skill) {
      setCvData({
        ...cvData,
        skills: [...cvData.skills, { name: skill, level: 'intermediate' }]
      });
    }
  };

  const removeSkill = (index: number) => {
    setCvData({
      ...cvData,
      skills: cvData.skills.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit CV: {cv.title}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Section Manager */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">CV Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.sort((a, b) => a.order - b.order).map(section => (
                  <div key={section.id} className="flex items-center gap-2 p-2 border rounded">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={() => toggleSection(section.id)}
                      className="rounded"
                    />
                    {section.type === 'custom' ? (
                      <Input
                        value={section.title}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <span className="text-sm flex-1">{section.title}</span>
                    )}
                    {section.type === 'custom' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addCustomSection} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Section
                </Button>
              </CardContent>
            </Card>

            {/* Personal Information */}
            {sections.find(s => s.id === 'personal')?.enabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={cvData.personal?.fullName || ''}
                        onChange={(e) => setCvData({
                          ...cvData,
                          personal: { ...cvData.personal, fullName: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Job Title</Label>
                      <Input
                        value={cvData.personal?.jobTitle || ''}
                        onChange={(e) => setCvData({
                          ...cvData,
                          personal: { ...cvData.personal, jobTitle: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={cvData.personal?.email || ''}
                        onChange={(e) => setCvData({
                          ...cvData,
                          personal: { ...cvData.personal, email: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={cvData.personal?.phone || ''}
                        onChange={(e) => setCvData({
                          ...cvData,
                          personal: { ...cvData.personal, phone: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={cvData.personal?.location || ''}
                        onChange={(e) => setCvData({
                          ...cvData,
                          personal: { ...cvData.personal, location: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>LinkedIn</Label>
                      <Input
                        value={cvData.personal?.linkedin || ''}
                        onChange={(e) => setCvData({
                          ...cvData,
                          personal: { ...cvData.personal, linkedin: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Professional Summary */}
            {sections.find(s => s.id === 'summary')?.enabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={cvData.summary || ''}
                    onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                    rows={4}
                    placeholder="Write a brief professional summary..."
                  />
                </CardContent>
              </Card>
            )}

            {/* Work Experience */}
            {sections.find(s => s.id === 'experience')?.enabled && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Work Experience</CardTitle>
                    <Button variant="outline" size="sm" onClick={addExperience}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cvData.experience?.map((exp: any) => (
                    <Card key={exp.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label>Position</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(exp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={exp.title}
                          onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                          placeholder="e.g., Senior Software Engineer"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={exp.location}
                              onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                              disabled={exp.current}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                          />
                          <Label>Currently working here</Label>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            rows={3}
                            placeholder="Describe your responsibilities and achievements..."
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {sections.find(s => s.id === 'education')?.enabled && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Education</CardTitle>
                    <Button variant="outline" size="sm" onClick={addEducation}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cvData.education?.map((edu: any) => (
                    <Card key={edu.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label>Degree</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(edu.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="e.g., Bachelor of Science in Computer Science"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={edu.location}
                              onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="month"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="month"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {sections.find(s => s.id === 'skills')?.enabled && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Skills</CardTitle>
                    <Button variant="outline" size="sm" onClick={addSkill}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {cvData.skills?.map((skill: any, index: number) => (
                      <Badge key={index} variant="secondary" className="gap-2">
                        {skill.name}
                        <button onClick={() => removeSkill(index)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="lg:sticky lg:top-4 h-fit">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <div className="space-y-4 text-sm">
                      {/* Personal Info */}
                      {cvData.personal?.fullName && (
                        <div className="text-center border-b pb-4">
                          <h1 className="text-2xl font-bold">{cvData.personal.fullName}</h1>
                          {cvData.personal.jobTitle && (
                            <p className="text-lg text-muted-foreground">{cvData.personal.jobTitle}</p>
                          )}
                          <div className="text-sm text-muted-foreground mt-2">
                            {cvData.personal.email} | {cvData.personal.phone}
                            {cvData.personal.location && ` | ${cvData.personal.location}`}
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      {cvData.summary && sections.find(s => s.id === 'summary')?.enabled && (
                        <div>
                          <h2 className="font-bold text-lg mb-2">Professional Summary</h2>
                          <p className="text-muted-foreground">{cvData.summary}</p>
                        </div>
                      )}

                      {/* Experience */}
                      {cvData.experience?.length > 0 && sections.find(s => s.id === 'experience')?.enabled && (
                        <div>
                          <h2 className="font-bold text-lg mb-2">Work Experience</h2>
                          <div className="space-y-3">
                            {cvData.experience.map((exp: any) => (
                              <div key={exp.id}>
                                <div className="flex justify-between">
                                  <h3 className="font-semibold">{exp.title}</h3>
                                  <span className="text-sm text-muted-foreground">
                                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {exp.company} | {exp.location}
                                </p>
                                <p className="text-sm mt-1">{exp.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {cvData.education?.length > 0 && sections.find(s => s.id === 'education')?.enabled && (
                        <div>
                          <h2 className="font-bold text-lg mb-2">Education</h2>
                          <div className="space-y-2">
                            {cvData.education.map((edu: any) => (
                              <div key={edu.id}>
                                <h3 className="font-semibold">{edu.degree}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {edu.institution} | {edu.location}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {edu.startDate} - {edu.endDate}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {cvData.skills?.length > 0 && sections.find(s => s.id === 'skills')?.enabled && (
                        <div>
                          <h2 className="font-bold text-lg mb-2">Skills</h2>
                          <div className="flex flex-wrap gap-2">
                            {cvData.skills.map((skill: any, index: number) => (
                              <Badge key={index} variant="secondary">{skill.name}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
