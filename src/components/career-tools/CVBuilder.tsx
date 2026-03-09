'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Download, Eye, Star, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CVTemplatePreview from '@/components/cv/CVTemplatePreview';
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
  const [isCreating, setIsCreating] = useState(false);
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
                      <Button size="sm" variant="outline" onClick={() => setSelectedCV(cv)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Export
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
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>
            Choose from professional templates to create your CV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {templates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader className="p-3">
                  <div className="mb-2 flex items-center justify-center bg-gray-50 rounded-md overflow-hidden">
                    <CVTemplatePreview 
                      templateName={template.name}
                      scale={0.2}
                    />
                  </div>
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {template.category}
                    {template.is_premium && (
                      <Badge variant="secondary" className="ml-2">Premium</Badge>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
