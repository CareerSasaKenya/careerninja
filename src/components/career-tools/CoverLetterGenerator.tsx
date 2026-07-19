'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Copy, Trash2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CoverLetterTemplatePreview from '@/components/cover-letter/CoverLetterTemplatePreview';
import ClassicProfessionalLetter, { ClassicLetterData } from '@/components/cover-letter/templates/ClassicProfessionalLetter';
import { classicLetterPreviewData } from '@/data/classicLetterPreviewData';
import { classicLetterSchema } from '@/schemas/classicLetterSchema';
import ModernProfessionalLetter, { ModernLetterData } from '@/components/cover-letter/templates/ModernProfessionalLetter';
import { modernLetterPreviewData } from '@/data/modernLetterPreviewData';
import { modernLetterSchema } from '@/schemas/modernLetterSchema';
import ShortDirectLetter, { ShortDirectLetterData } from '@/components/cover-letter/templates/ShortDirectLetter';
import { shortLetterPreviewData } from '@/data/shortLetterPreviewData';
import { shortLetterSchema } from '@/schemas/shortLetterSchema';
import GraduateLetter, { GraduateLetterData } from '@/components/cover-letter/templates/GraduateLetter';
import { graduateLetterPreviewData } from '@/data/graduateLetterPreviewData';
import { graduateLetterSchema } from '@/schemas/graduateLetterSchema';
import InternshipLetter, { InternshipLetterData } from '@/components/cover-letter/templates/InternshipLetter';
import { internshipLetterPreviewData } from '@/data/internshipLetterPreviewData';
import { internshipLetterSchema } from '@/schemas/internshipLetterSchema';
import {
  getCoverLetterTemplates,
  getUserCoverLetters,
  createCoverLetter,
  type CoverLetterTemplate,
} from '@/lib/careerTools';

type ActiveTemplate = 'classic' | 'modern' | 'short' | 'graduate' | 'internship';

const PROFESSIONAL_TEMPLATES = [
  {
    name: 'Classic Professional Cover Letter',
    key: 'classic' as ActiveTemplate,
    available: true,
    bestFor: ['Government jobs', 'NGOs', 'Banking', 'Corporate roles', 'Administrative positions'],
    why: 'Safest option — works everywhere',
  },
  {
    name: 'Modern Professional Cover Letter',
    key: 'modern' as ActiveTemplate,
    available: true,
    bestFor: ['Private sector jobs', 'Marketing roles', 'Business roles', 'Mid-level professionals'],
    why: 'Feels current without being risky',
  },
  {
    name: 'Short & Direct Cover Letter',
    key: 'short' as ActiveTemplate,
    available: true,
    bestFor: ['Startups', 'Tech companies', 'Busy recruiters', 'Online applications'],
    why: 'Matches modern hiring behavior',
  },
];

const ENTRY_LEVEL_TEMPLATES = [
  {
    name: 'Graduate / Entry-Level Cover Letter',
    key: 'graduate' as ActiveTemplate,
    available: true,
    bestFor: ['Fresh graduates', 'First-time job seekers', 'Graduate trainee programmes'],
    why: "Solves \"I don't have experience\" problem",
  },
  {
    name: 'Internship / Attachment Cover Letter',
    key: 'internship' as ActiveTemplate,
    available: true,
    bestFor: ['University students', 'TVET students', 'Industrial attachment'],
    why: 'Very relevant in Kenya — huge volume use case',
  },
];

export default function CoverLetterGenerator() {
  const [letters, setLetters] = useState<any[]>([]);
  const [dbTemplates, setDbTemplates] = useState<CoverLetterTemplate[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [letterTitle, setLetterTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<ActiveTemplate>('classic');

  const [classicFormData, setClassicFormData] = useState<ClassicLetterData>({ ...classicLetterPreviewData });
  const [modernFormData, setModernFormData] = useState<ModernLetterData>({ ...modernLetterPreviewData });
  const [shortFormData, setShortFormData] = useState<ShortDirectLetterData>({ ...shortLetterPreviewData });
  const [graduateFormData, setGraduateFormData] = useState<GraduateLetterData>({ ...graduateLetterPreviewData });
  const [internshipFormData, setInternshipFormData] = useState<InternshipLetterData>({ ...internshipLetterPreviewData });

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    // Gallery templates are hardcoded and public — never gate them on auth.
    // DB templates + saved letters load in the background; only save requires sign-in.
    try {
      const templatesData = await getCoverLetterTemplates();
      setDbTemplates(templatesData ?? []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const lettersData = await getUserCoverLetters(user.id);
        setLetters(lettersData ?? []);
      } else {
        setLetters([]);
      }
    } catch (error: any) {
      toast({ title: 'Error loading data', description: error.message, variant: 'destructive' });
    }
  }

  function openEditor(key: ActiveTemplate) {
    setActiveTemplate(key);
    setLetterTitle('');
    setShowEditor(true);
  }

  function updateField(key: ActiveTemplate, field: string, value: string) {
    if (key === 'classic') setClassicFormData(prev => ({ ...prev, [field]: value }));
    else if (key === 'modern') setModernFormData(prev => ({ ...prev, [field]: value }));
    else if (key === 'short') setShortFormData(prev => ({ ...prev, [field]: value }));
    else if (key === 'graduate') setGraduateFormData(prev => ({ ...prev, [field]: value }));
    else if (key === 'internship') setInternshipFormData(prev => ({ ...prev, [field]: value }));
  }

  function getActiveSchema() {
    if (activeTemplate === 'modern') return modernLetterSchema;
    if (activeTemplate === 'short') return shortLetterSchema;
    if (activeTemplate === 'graduate') return graduateLetterSchema;
    if (activeTemplate === 'internship') return internshipLetterSchema;
    return classicLetterSchema;
  }

  function getActiveFormData(): Record<string, string> {
    if (activeTemplate === 'modern') return modernFormData as unknown as Record<string, string>;
    if (activeTemplate === 'short') return shortFormData as unknown as Record<string, string>;
    if (activeTemplate === 'graduate') return graduateFormData as unknown as Record<string, string>;
    if (activeTemplate === 'internship') return internshipFormData as unknown as Record<string, string>;
    return classicFormData as unknown as Record<string, string>;
  }

  function getActiveTemplateName(): string {
    if (activeTemplate === 'modern') return 'Modern Professional Cover Letter';
    if (activeTemplate === 'short') return 'Short & Direct Cover Letter';
    if (activeTemplate === 'graduate') return 'Graduate / Entry-Level Cover Letter';
    if (activeTemplate === 'internship') return 'Internship / Attachment Cover Letter';
    return 'Classic Professional Cover Letter';
  }

  async function handleSave() {
    if (!letterTitle.trim()) {
      toast({ title: 'Name required', description: 'Give your cover letter a name.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Create a free account or sign in to save cover letters.',
        });
        router.push('/auth');
        return;
      }
      const d = getActiveFormData();
      const tplName = getActiveTemplateName();
      const matchedTpl = dbTemplates.find(t => t.name === tplName);
      const closing = activeTemplate === 'internship' ? 'Yours faithfully,' : activeTemplate === 'graduate' ? 'Yours sincerely,' : activeTemplate === 'short' ? 'Best regards,' : 'Sincerely,';
      const content = [
        d.name, d.phone, d.email, d.location,
        ...(d.institution ? [d.institution] : []),
        ...(d.course ? [d.course] : []),
        '',
        d.date, '',
        d.hiringManager, d.company, d.companyAddress, '',
        `Dear ${d.hiringManager || 'Hiring Manager'},`, '',
        d.paragraph1, '', d.paragraph2, '', d.paragraph3, '',
        closing, d.name,
      ].join('\n');
      const newLetter = await createCoverLetter({
        user_id: user.id,
        template_id: matchedTpl?.id ?? null,
        title: letterTitle,
        content,
        job_id: null,
      });
      setLetters([newLetter, ...letters]);
      setShowEditor(false);
      toast({ title: 'Cover letter saved' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this cover letter?')) return;
    try {
      await supabase.from('candidate_cover_letters' as any).delete().eq('id', id);
      setLetters(letters.filter(l => l.id !== id));
      toast({ title: 'Deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }

  function copyToClipboard(content: string) {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard' });
  }

  function renderTemplateGrid(templates: typeof PROFESSIONAL_TEMPLATES) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(tpl => (
          tpl.available ? (
            <button
              key={tpl.name}
              type="button"
              onClick={() => openEditor(tpl.key)}
              className="group w-full text-left rounded-xl border border-border/80 bg-background p-3 sm:p-4 transition-all hover:border-[#0A66C2]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66C2]/40"
            >
              <div className="relative overflow-hidden rounded-lg">
                <CoverLetterTemplatePreview templateName={tpl.name} showDescription={false} />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0A66C2]/0 opacity-0 transition-all group-hover:bg-[#0A66C2]/25 group-hover:opacity-100">
                  <span className="rounded-md bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                    Use template
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <h4 className="text-sm font-semibold text-[#0A66C2] sm:text-base">{tpl.name}</h4>
                <CoverLetterTemplatePreview templateName={tpl.name} showDescription={true} descriptionOnly={true} />
                <div className="flex flex-wrap gap-1">
                  {tpl.bestFor.slice(0, 3).map(b => (
                    <Badge key={b} variant="outline" className="text-[10px] font-normal">{b}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{tpl.why}</p>
                <span className="inline-flex text-sm font-medium text-[#0A66C2] sm:hidden">
                  Tap to use →
                </span>
              </div>
            </button>
          ) : (
            <div key={tpl.name} className="rounded-xl border border-dashed border-border p-4 opacity-70">
              <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-lg bg-muted/40">
                <Clock className="h-8 w-8 text-muted-foreground/50" />
                <span className="text-xs font-medium text-muted-foreground">Coming soon</span>
              </div>
              <h4 className="mt-3 text-sm font-semibold text-muted-foreground">{tpl.name}</h4>
            </div>
          )
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-[#0A66C2] sm:text-2xl">
          Cover Letter Templates
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Structured letters for Kenyan applications. Pick a template, edit, then save.
        </p>
      </div>

      {letters.length > 0 && (
        <section className="space-y-3">
          <div>
            <h3 className="text-base font-semibold">My Cover Letters</h3>
            <p className="text-xs text-muted-foreground">
              {letters.length} saved {letters.length === 1 ? 'letter' : 'letters'}
            </p>
          </div>
          <div className="space-y-3">
            {letters.map(letter => (
              <Card key={letter.id} className="shadow-none">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{letter.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(letter.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(letter.content)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(letter.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground line-clamp-3">
                    {letter.content.substring(0, 300)}{letter.content.length > 300 && '...'}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-10">
        <section className="space-y-4">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-base font-semibold text-[#0A66C2] sm:text-lg">Professional</h3>
            <p className="mt-0.5 text-sm text-muted-foreground max-w-2xl">
              Corporate, government, NGO, banking, and private-sector applications.
            </p>
          </div>
          {renderTemplateGrid(PROFESSIONAL_TEMPLATES)}
        </section>

        <section className="space-y-4">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-base font-semibold text-[#0A66C2] sm:text-lg">Entry-Level</h3>
            <p className="mt-0.5 text-sm text-muted-foreground max-w-2xl">
              For graduates and students — education, projects, and potential.
            </p>
          </div>
          {renderTemplateGrid(ENTRY_LEVEL_TEMPLATES)}
        </section>
      </div>

      {letters.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Your saved letters will show up here once you pick a template above.
        </p>
      )}

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-3 border-b">
            <DialogTitle>{getActiveTemplateName()}</DialogTitle>
            <DialogDescription>Edit your details on the left — the preview updates live on the right.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-1 overflow-hidden">
            <div className="w-[340px] flex-shrink-0 border-r overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <Label htmlFor="letter-title" className="text-sm font-semibold">Cover Letter Name</Label>
                <Input
                  id="letter-title"
                  className="mt-1"
                  placeholder="e.g. Application for Finance Manager — KCB"
                  value={letterTitle}
                  onChange={e => setLetterTitle(e.target.value)}
                />
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Details</p>
                {Object.keys(getActiveSchema()).map(key => {
                  const field = getActiveSchema()[key];
                  const val = getActiveFormData()[key] ?? '';
                  return (
                    <div key={key} className="mb-3">
                      <Label htmlFor={`${activeTemplate}-${key}`} className="text-sm">{field.label}</Label>
                      {field.type === 'textarea' ? (
                        <>
                          <Textarea
                            id={`${activeTemplate}-${key}`}
                            className="mt-1 text-sm"
                            rows={4}
                            placeholder={field.placeholder}
                            value={val}
                            onChange={e => updateField(activeTemplate, key, e.target.value)}
                          />
                          {field.hint && <p className="text-xs text-muted-foreground mt-1">{field.hint}</p>}
                        </>
                      ) : (
                        <Input
                          id={`${activeTemplate}-${key}`}
                          className="mt-1 text-sm"
                          placeholder={field.placeholder}
                          value={val}
                          onChange={e => updateField(activeTemplate, key, e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-2 pb-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditor(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Letter'}
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-6">
              <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center' }}>
                {activeTemplate === 'modern' && <ModernProfessionalLetter data={modernFormData} />}
                {activeTemplate === 'short' && <ShortDirectLetter data={shortFormData} />}
                {activeTemplate === 'graduate' && <GraduateLetter data={graduateFormData} />}
                {activeTemplate === 'internship' && <InternshipLetter data={internshipFormData} />}
                {activeTemplate === 'classic' && <ClassicProfessionalLetter data={classicFormData} />}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
