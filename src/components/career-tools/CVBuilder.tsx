'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Download, Eye, Star, Trash2, Copy, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CVTemplatePreview from '@/components/cv/CVTemplatePreview';
import CVTemplateSelectionDialog from '@/components/cv/CVTemplateSelectionDialog';
import CVEditor from '@/components/cv/CVEditor';
import CVDownloadDialog from '@/components/cv/CVDownloadDialog';
import {
  getCVTemplates,
  getUserCVs,
  createCV,
  updateCV,
  deleteCV,
  setPrimaryCV,
  type CVTemplate,
  type CandidateCV
} from '@/lib/careerTools';

export default function CVBuilder() {
  const [cvs, setCvs] = useState<CandidateCV[]>([]);
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [selectedCV, setSelectedCV] = useState<CandidateCV | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCV, setDownloadCV] = useState<CandidateCV | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [cvsData, templatesData] = await Promise.all([
        getUserCVs(user.id),
        getCVTemplates()
      ]);

      setCvs(cvsData);
      setTemplates(templatesData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCV(formData: FormData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const title = formData.get('title') as string;
      const templateId = formData.get('template_id') as string;

      const newCV = await createCV({
        user_id: user.id,
        template_id: templateId || null,
        title,
        content: {
          personal: {},
          experience: [],
          education: [],
          skills: [],
          certifications: []
        },
        is_primary: cvs.length === 0
      });

      setCvs([newCV, ...cvs]);
      setIsCreating(false);
      toast({
        title: 'Success',
        description: 'CV created successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleSetPrimary(cvId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await setPrimaryCV(user.id, cvId);
      await loadData();
      toast({
        title: 'Success',
        description: 'Primary CV updated'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleDeleteCV(cvId: string) {
    if (!confirm('Are you sure you want to delete this CV?')) return;

    try {
      await deleteCV(cvId);
      setCvs(cvs.filter(cv => cv.id !== cvId));
      toast({
        title: 'Success',
        description: 'CV deleted successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleDuplicateCV(cv: CandidateCV) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newCV = await createCV({
        user_id: user.id,
        template_id: cv.template_id,
        title: `${cv.title} (Copy)`,
        content: cv.content,
        is_primary: false
      });

      setCvs([newCV, ...cvs]);
      toast({
        title: 'Success',
        description: 'CV duplicated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  function handleEditCV(cv: CandidateCV) {
    setSelectedCV(cv);
    setIsEditing(true);
  }

  function handleEditorSave() {
    setIsEditing(false);
    setSelectedCV(null);
    loadData();
  }

  function handleEditorCancel() {
    setIsEditing(false);
    setSelectedCV(null);
  }

  function handleDownload(cv: CandidateCV) {
    setDownloadCV(cv);
    setIsDownloading(true);
  }

  function handleTemplateClick(template: CVTemplate) {
    setSelectedTemplate(template);
    setShowTemplateDialog(true);
  }

  async function handleCreateNewCV(cvName: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedTemplate) return;

      const newCV = await createCV({
        user_id: user.id,
        template_id: selectedTemplate.id,
        title: cvName,
        content: {
          personal: {},
          experience: [],
          education: [],
          skills: [],
          certifications: []
        },
        is_primary: cvs.length === 0
      });

      setCvs([newCV, ...cvs]);
      setSelectedCV(newCV);
      setIsEditing(true);
      
      toast({
        title: 'Success',
        description: 'CV created successfully. You can now edit it.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleUploadExistingCV(cvName: string, parsedData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedTemplate) return;

      // Map parsed data to CV content structure
      const cvContent = {
        personal: {
          name: parsedData.basicInfo?.full_name || '',
          title: parsedData.professional?.current_title || '',
          phone: parsedData.basicInfo?.phone || '',
          email: '', // Not typically in CV
          linkedin: parsedData.basicInfo?.linkedin_url || '',
          location: parsedData.basicInfo?.location || '',
          profile: parsedData.basicInfo?.bio || ''
        },
        experience: parsedData.workExperience?.map((exp: any) => ({
          jobTitle: exp.job_title,
          company: exp.company_name,
          location: exp.location || '',
          dates: `${exp.start_date} – ${exp.end_date || 'Present'}`,
          details: exp.achievements || [exp.description || '']
        })) || [],
        education: parsedData.education?.map((edu: any) => ({
          degree: `${edu.degree_type} in ${edu.field_of_study}`,
          institution: edu.institution_name,
          dates: `${edu.start_date} – ${edu.end_date || 'Present'}`
        })) || [],
        skills: parsedData.skills?.map((skill: any) => skill.skill_name) || [],
        certifications: [],
        achievements: [],
        languages: [],
        tools: []
      };

      const newCV = await createCV({
        user_id: user.id,
        template_id: selectedTemplate.id,
        title: cvName,
        content: cvContent,
        is_primary: cvs.length === 0
      });

      setCvs([newCV, ...cvs]);
      setSelectedCV(newCV);
      setIsEditing(true);
      
      toast({
        title: 'Success',
        description: 'CV imported and mapped to template. You can now edit it.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  function getTemplateName(templateId: string | null): string {
    if (!templateId) return 'Classic Professional';
    const template = templates.find(t => t.id === templateId);
    return template?.name || 'Classic Professional';
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>CV Builder</CardTitle>
              <CardDescription>
                Create and manage multiple CV versions for different roles
              </CardDescription>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New CV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New CV</DialogTitle>
                  <DialogDescription>
                    Choose a template and give your CV a descriptive name
                  </DialogDescription>
                </DialogHeader>
                <form action={handleCreateCV} className="space-y-4">
                  <div>
                    <Label htmlFor="title">CV Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Software Engineer CV"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="template_id">Template</Label>
                    <Select name="template_id">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                            {template.is_premium && (
                              <Badge variant="secondary" className="ml-2">Premium</Badge>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create CV</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {cvs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No CVs yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first CV to get started
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create CV
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cvs.map(cv => (
                <Card key={cv.id} className="relative">
                  {cv.is_primary && (
                    <Badge className="absolute top-2 right-2" variant="default">
                      <Star className="h-3 w-3 mr-1" />
                      Primary
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{cv.title}</CardTitle>
                    <CardDescription>
                      Version {cv.version} • Updated {new Date(cv.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditCV(cv)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownload(cv)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      {!cv.is_primary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetPrimary(cv.id)}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Set Primary
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateCV(cv)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCV(cv.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CV Templates Gallery */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#0A66C2]">Expertly-Designed CV Templates</CardTitle>
          <CardDescription className="text-base mt-2 max-w-3xl mx-auto">
            Choose from our expertly designed templates tailored for the Kenyan job market. 
            Each template is ATS-friendly and crafted to help you stand out to employers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Professional CV Templates Section */}
          <div>
            <div className="mb-4 text-center">
              <h3 className="text-xl font-semibold text-[#0A66C2]">Professional CV Templates</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-3xl mx-auto">
                Designed for experienced professionals with established careers, emphasizing work history, achievements, and leadership.
              </p>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {templates
                .filter(t => ['Classic Professional', 'Modern Professional', 'Executive Leadership'].includes(t.name))
                .map(template => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:border-primary hover:shadow-lg transition-all transform hover:scale-105 group relative"
                    onClick={() => handleTemplateClick(template)}
                  >
                    <CardHeader className="p-4 relative">
                      <div className="relative">
                        <CVTemplatePreview templateName={template.name} showDescription={false} />
                        {/* Hover Button */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded pointer-events-none">
                          <div className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg">
                            Use This Template
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <CardTitle className="text-base text-[#0A66C2]">{template.name}</CardTitle>
                        <CVTemplatePreview templateName={template.name} showDescription={true} descriptionOnly={true} />
                        {template.is_premium && (
                          <Badge variant="secondary" className="w-fit">Premium</Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          </div>

          {/* Entry-Level / Graduate CV Templates Section */}
          <div>
            <div className="mb-4 text-center">
              <h3 className="text-xl font-semibold text-[#0A66C2]">Entry-Level / Graduate CV Templates</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-3xl mx-auto">
                Specifically designed for students, fresh graduates, and entry-level candidates with limited work experience. 
                These templates emphasize education, skills, potential, and transferable competencies.
              </p>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {templates
                .filter(t => ['Graduate Starter CV', 'Skills-Based (Functional)', 'Internship / Industrial Attachment'].includes(t.name))
                .map(template => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:border-primary hover:shadow-lg transition-all transform hover:scale-105 group relative"
                    onClick={() => handleTemplateClick(template)}
                  >
                    <CardHeader className="p-4 relative">
                      <div className="relative">
                        <CVTemplatePreview templateName={template.name} showDescription={false} />
                        {/* Hover Button */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded pointer-events-none">
                          <div className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg">
                            Use This Template
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <CardTitle className="text-base text-[#0A66C2]">{template.name}</CardTitle>
                        <CVTemplatePreview templateName={template.name} showDescription={true} descriptionOnly={true} />
                        {template.is_premium && (
                          <Badge variant="secondary" className="w-fit">Premium</Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          </div>

          {/* Creative & Digital Industry CV Templates Section */}
          <div>
            <div className="mb-4 text-center">
              <h3 className="text-xl font-semibold text-[#0A66C2]">Creative & Digital Industry CV Templates</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-3xl mx-auto">
                Stand out in the creative and digital space with visually striking templates that showcase your portfolio, 
                artistic vision, and creative projects. Perfect for designers, content creators, and digital professionals 
                who want their CV to reflect their creative flair and make a memorable first impression.
              </p>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {templates
                .filter(t => ['Creative Portfolio'].includes(t.name))
                .map(template => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:border-primary hover:shadow-lg transition-all transform hover:scale-105 group relative"
                    onClick={() => handleTemplateClick(template)}
                  >
                    <CardHeader className="p-4 relative">
                      <div className="relative">
                        <CVTemplatePreview templateName={template.name} showDescription={false} />
                        {/* Hover Button */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded pointer-events-none">
                          <div className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg">
                            Use This Template
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <CardTitle className="text-base text-[#0A66C2]">{template.name}</CardTitle>
                        <CVTemplatePreview templateName={template.name} showDescription={true} descriptionOnly={true} />
                        {template.is_premium && (
                          <Badge variant="secondary" className="w-fit">Premium</Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CV Editor Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit CV: {selectedCV?.title}</DialogTitle>
            <DialogDescription>
              Add, remove, or edit your CV sections and content
            </DialogDescription>
          </DialogHeader>
          {selectedCV && (
            <CVEditor
              cv={selectedCV}
              onSave={handleEditorSave}
              onCancel={handleEditorCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* CV Download Dialog */}
      {downloadCV && (
        <CVDownloadDialog
          open={isDownloading}
          onOpenChange={setIsDownloading}
          cv={downloadCV}
          templateName={getTemplateName(downloadCV.template_id)}
        />
      )}

      {/* CV Template Selection Dialog */}
      {selectedTemplate && (
        <CVTemplateSelectionDialog
          open={showTemplateDialog}
          onOpenChange={setShowTemplateDialog}
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.name}
          onCreateNew={handleCreateNewCV}
          onUploadExisting={handleUploadExistingCV}
        />
      )}
    </div>
  );
}
