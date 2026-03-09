'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateCV, type CandidateCV } from '@/lib/careerTools';

interface CVEditorProps {
  cv: CandidateCV;
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

export default function CVEditor({ cv, onSave, onCancel }: CVEditorProps) {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Initialize state from CV content
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

  // Personal Info Handlers
  const handlePersonalChange = (field: string, value: string) => {
    setPersonal(prev => ({ ...prev, [field]: value }));
  };

  // Skills Handlers
  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Experience Handlers
  const addExperience = () => {
    setExperience([...experience, {
      jobTitle: '',
      company: '',
      location: '',
      dates: '',
      details: ['']
    }]);
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperience = [...experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setExperience(newExperience);
  };

  const addExperienceDetail = (expIndex: number) => {
    const newExperience = [...experience];
    newExperience[expIndex].details.push('');
    setExperience(newExperience);
  };

  const updateExperienceDetail = (expIndex: number, detailIndex: number, value: string) => {
    const newExperience = [...experience];
    newExperience[expIndex].details[detailIndex] = value;
    setExperience(newExperience);
  };

  const removeExperienceDetail = (expIndex: number, detailIndex: number) => {
    const newExperience = [...experience];
    newExperience[expIndex].details = newExperience[expIndex].details.filter((_, i) => i !== detailIndex);
    setExperience(newExperience);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Education Handlers
  const addEducation = () => {
    setEducation([...education, {
      degree: '',
      institution: '',
      dates: ''
    }]);
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setEducation(newEducation);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Certifications Handlers
  const addCertification = () => {
    setCertifications([...certifications, '']);
  };

  const updateCertification = (index: number, value: string) => {
    const newCertifications = [...certifications];
    newCertifications[index] = value;
    setCertifications(newCertifications);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  // Achievements Handlers
  const addAchievement = () => {
    setAchievements([...achievements, '']);
  };

  const updateAchievement = (index: number, value: string) => {
    const newAchievements = [...achievements];
    newAchievements[index] = value;
    setAchievements(newAchievements);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  // Languages Handlers
  const addLanguage = () => {
    setLanguages([...languages, '']);
  };

  const updateLanguage = (index: number, value: string) => {
    const newLanguages = [...languages];
    newLanguages[index] = value;
    setLanguages(newLanguages);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  // Tools Handlers
  const addTool = () => {
    setTools([...tools, '']);
  };

  const updateTool = (index: number, value: string) => {
    const newTools = [...tools];
    newTools[index] = value;
    setTools(newTools);
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  // Save Handler
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
        tools: tools.filter(t => t.trim())
      };

      await updateCV(cv.id, { content: updatedContent });

      toast({
        title: 'Success',
        description: 'CV updated successfully'
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

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-4">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={personal.name}
                onChange={(e) => handlePersonalChange('name', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={personal.title}
                onChange={(e) => handlePersonalChange('title', e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={personal.phone}
                onChange={(e) => handlePersonalChange('phone', e.target.value)}
                placeholder="+254 712 345 678"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={personal.email}
                onChange={(e) => handlePersonalChange('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={personal.linkedin}
                onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={personal.location}
                onChange={(e) => handlePersonalChange('location', e.target.value)}
                placeholder="Nairobi, Kenya"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="profile">Professional Summary</Label>
            <Textarea
              id="profile"
              value={personal.profile}
              onChange={(e) => handlePersonalChange('profile', e.target.value)}
              placeholder="Brief professional summary..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Skills</CardTitle>
            <Button size="sm" onClick={addSkill}>
              <Plus className="h-4 w-4 mr-1" />
              Add Skill
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {skills.map((skill, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={skill}
                onChange={(e) => updateSkill(index, e.target.value)}
                placeholder="e.g., JavaScript, Project Management"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeSkill(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Work Experience</CardTitle>
            <Button size="sm" onClick={addExperience}>
              <Plus className="h-4 w-4 mr-1" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {experience.map((exp, expIndex) => (
            <div key={expIndex} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">Experience {expIndex + 1}</h4>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeExperience(expIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Job Title</Label>
                  <Input
                    value={exp.jobTitle}
                    onChange={(e) => updateExperience(expIndex, 'jobTitle', e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                    placeholder="Tech Company Ltd"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(expIndex, 'location', e.target.value)}
                    placeholder="Nairobi"
                  />
                </div>
                <div>
                  <Label>Dates</Label>
                  <Input
                    value={exp.dates}
                    onChange={(e) => updateExperience(expIndex, 'dates', e.target.value)}
                    placeholder="Jan 2020 - Present"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Responsibilities & Achievements</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addExperienceDetail(expIndex)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Point
                  </Button>
                </div>
                <div className="space-y-2">
                  {exp.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex gap-2">
                      <Textarea
                        value={detail}
                        onChange={(e) => updateExperienceDetail(expIndex, detailIndex, e.target.value)}
                        placeholder="Describe your responsibility or achievement..."
                        rows={2}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeExperienceDetail(expIndex, detailIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <Button size="sm" onClick={addEducation}>
              <Plus className="h-4 w-4 mr-1" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {education.map((edu, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">Education {index + 1}</h4>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeEducation(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Degree/Qualification</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    placeholder="Bachelor of Science in Computer Science"
                  />
                </div>
                <div>
                  <Label>Institution</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    placeholder="University of Nairobi"
                  />
                </div>
                <div>
                  <Label>Dates</Label>
                  <Input
                    value={edu.dates}
                    onChange={(e) => updateEducation(index, 'dates', e.target.value)}
                    placeholder="2015 - 2019"
                  />
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
            <Button size="sm" onClick={addCertification}>
              <Plus className="h-4 w-4 mr-1" />
              Add Certification
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {certifications.map((cert, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={cert}
                onChange={(e) => updateCertification(index, e.target.value)}
                placeholder="e.g., AWS Certified Solutions Architect - 2023"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeCertification(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Professional Achievements</CardTitle>
            <Button size="sm" onClick={addAchievement}>
              <Plus className="h-4 w-4 mr-1" />
              Add Achievement
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={achievement}
                onChange={(e) => updateAchievement(index, e.target.value)}
                placeholder="Describe a significant achievement..."
                rows={2}
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeAchievement(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Languages</CardTitle>
            <Button size="sm" onClick={addLanguage}>
              <Plus className="h-4 w-4 mr-1" />
              Add Language
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {languages.map((language, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={language}
                onChange={(e) => updateLanguage(index, e.target.value)}
                placeholder="e.g., English - Fluent"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeLanguage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tools & Platforms */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tools & Platforms</CardTitle>
            <Button size="sm" onClick={addTool}>
              <Plus className="h-4 w-4 mr-1" />
              Add Tool
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {tools.map((tool, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={tool}
                onChange={(e) => updateTool(index, e.target.value)}
                placeholder="e.g., Microsoft Office, Git"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeTool(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-4 pb-2 border-t">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
