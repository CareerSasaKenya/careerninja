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
            {templates.map(template => {
              const colors = template.template_data?.colors || { primary: '#2563eb', secondary: '#64748b' };
              const categoryStyles = {
                modern: 'from-blue-50 to-blue-100 border-blue-200',
                classic: 'from-slate-50 to-slate-100 border-slate-200',
                creative: 'from-purple-50 to-purple-100 border-purple-200',
                professional: 'from-gray-50 to-gray-100 border-gray-200'
              };
              
              return (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200"
                  onClick={() => {
                    setIsCreating(true);
                    // Could pre-select this template
                  }}
                >
                  <CardHeader className="p-0">
                    <div className={`aspect-[3/4] bg-gradient-to-br ${categoryStyles[template.category as keyof typeof categoryStyles] || categoryStyles.professional} rounded-t-lg border-b-2 p-4 flex flex-col justify-between`}>
                      {/* Template Preview */}
                      <div className="space-y-2">
                        {/* Header section */}
                        <div className="h-8 rounded" style={{ backgroundColor: colors.primary, opacity: 0.2 }}></div>
                        {/* Content lines */}
                        <div className="space-y-1">
                          <div className="h-2 rounded w-3/4" style={{ backgroundColor: colors.secondary, opacity: 0.3 }}></div>
                          <div className="h-2 rounded w-full" style={{ backgroundColor: colors.secondary, opacity: 0.2 }}></div>
                          <div className="h-2 rounded w-5/6" style={{ backgroundColor: colors.secondary, opacity: 0.2 }}></div>
                        </div>
                        {/* Section divider */}
                        <div className="h-1 rounded w-1/3 mt-3" style={{ backgroundColor: colors.primary, opacity: 0.4 }}></div>
                        {/* More content */}
                        <div className="space-y-1 mt-2">
                          <div className="h-2 rounded w-full" style={{ backgroundColor: colors.secondary, opacity: 0.2 }}></div>
                          <div className="h-2 rounded w-4/5" style={{ backgroundColor: colors.secondary, opacity: 0.2 }}></div>
                        </div>
                      </div>
                      
                      {/* Template icon */}
                      <div className="flex justify-center mt-4">
                        <div className="p-2 rounded-full bg-white/80 shadow-sm">
                          <FileText className="h-6 w-6" style={{ color: colors.primary }} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <CardTitle className="text-sm font-semibold">{template.name}</CardTitle>
                        {template.is_premium && (
                          <Badge variant="secondary" className="text-xs">Premium</Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs capitalize">
                        {template.category} style
                      </CardDescription>
                      {template.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
