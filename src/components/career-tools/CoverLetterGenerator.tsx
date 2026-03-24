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
import { Plus, Mail, Download, Wand2, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  getCoverLetterTemplates,
  getUserCoverLetters,
  createCoverLetter,
  updateCoverLetter,
  generateCoverLetterFromTemplate,
  type CoverLetterTemplate,
  type CandidateCoverLetter
} from '@/lib/careerTools';

export default function CoverLetterGenerator() {
  const [letters, setLetters] = useState<any[]>([]);
  const [templates, setTemplates] = useState<CoverLetterTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [placeholders, setPlaceholders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [lettersData, templatesData] = await Promise.all([
        getUserCoverLetters(user.id),
        getCoverLetterTemplates()
      ]);

      setLetters(lettersData);
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

  async function handleGenerateFromTemplate() {
    if (!selectedTemplate) return;

    try {
      const content = await generateCoverLetterFromTemplate(
        selectedTemplate.id,
        placeholders
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newLetter = await createCoverLetter({
        user_id: user.id,
        template_id: selectedTemplate.id,
        title: placeholders.job_title || 'Untitled Cover Letter',
        content,
        job_id: null
      });

      setLetters([newLetter, ...letters]);
      setIsCreating(false);
      setPlaceholders({});
      setSelectedTemplate(null);

      toast({
        title: 'Success',
        description: 'Cover letter generated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleDeleteLetter(id: string) {
    if (!confirm('Are you sure you want to delete this cover letter?')) return;

    try {
      await supabase.from('candidate_cover_letters' as any).delete().eq('id', id);
      setLetters(letters.filter(l => l.id !== id));
      toast({
        title: 'Success',
        description: 'Cover letter deleted'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  function copyToClipboard(content: string) {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied',
      description: 'Cover letter copied to clipboard'
    });
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
              <CardTitle>Cover Letter Generator</CardTitle>
              <CardDescription>
                Create personalized cover letters using templates
              </CardDescription>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Cover Letter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Generate Cover Letter</DialogTitle>
                  <DialogDescription>
                    Select a template and fill in the details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Template</Label>
                    <Select
                      value={selectedTemplate?.id}
                      onValueChange={(value) => {
                        const template = templates.find(t => t.id === value);
                        setSelectedTemplate(template || null);
                        if (template?.placeholders) {
                          const initialPlaceholders: Record<string, string> = {};
                          template.placeholders.placeholders.forEach((p: string) => {
                            initialPlaceholders[p] = '';
                          });
                          setPlaceholders(initialPlaceholders);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} - {template.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate && (
                    <>
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <h4 className="font-semibold mb-2">Template Preview</h4>
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedTemplate.template_text.substring(0, 300)}...
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">Fill in the details</h4>
                        {selectedTemplate.placeholders?.placeholders.map((placeholder: string) => (
                          <div key={placeholder}>
                            <Label htmlFor={placeholder}>
                              {placeholder.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Label>
                            {placeholder.includes('paragraph') ? (
                              <Textarea
                                id={placeholder}
                                value={placeholders[placeholder] || ''}
                                onChange={(e) => setPlaceholders({
                                  ...placeholders,
                                  [placeholder]: e.target.value
                                })}
                                rows={3}
                              />
                            ) : (
                              <Input
                                id={placeholder}
                                value={placeholders[placeholder] || ''}
                                onChange={(e) => setPlaceholders({
                                  ...placeholders,
                                  [placeholder]: e.target.value
                                })}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsCreating(false);
                            setSelectedTemplate(null);
                            setPlaceholders({});
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleGenerateFromTemplate}>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {letters.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No cover letters yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate your first cover letter from a template
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Cover Letter
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {letters.map(letter => (
                <Card key={letter.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{letter.title}</CardTitle>
                        <CardDescription>                          Created {new Date(letter.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(letter.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteLetter(letter.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {letter.content.substring(0, 400)}
                        {letter.content.length > 400 && '...'}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>
            Professional cover letter templates for different situations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:border-primary">
                <CardHeader>
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {template.category}
                    {template.is_premium && (
                      <Badge variant="secondary" className="ml-2">Premium</Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {template.description}
                  </p>
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      Used {template.usage_count} times
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
