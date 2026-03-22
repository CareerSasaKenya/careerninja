'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileType } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type CandidateCV } from '@/lib/careerTools';

interface CVDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cv: CandidateCV;
  templateName: string;
}

export default function CVDownloadDialog({ open, onOpenChange, cv, templateName }: CVDownloadDialogProps) {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  /** Build the data object that all template components expect */
  const buildTemplateData = () => ({
    name: cv.content.personal?.name || '',
    title: cv.content.personal?.title || '',
    contact: {
      phone: cv.content.personal?.phone || '',
      email: cv.content.personal?.email || '',
      linkedin: cv.content.personal?.linkedin || '',
      location: cv.content.personal?.location || '',
    },
    photoUrl: cv.content.personal?.photoUrl || '',
    profile: cv.content.personal?.profile || '',
    objective: cv.content.personal?.objective || cv.content.personal?.profile || '',
    summary: cv.content.personal?.profile || '',
    skills: cv.content.skills || [],
    experience: cv.content.experience || [],
    education: cv.content.education || [],
    certifications: cv.content.certifications || [],
    achievements: cv.content.achievements || [],
    languages: cv.content.languages || [],
    tools: cv.content.tools || [],
    projects: cv.content.projects || [],
    internships: cv.content.internships || cv.content.experience || [],
    activities: cv.content.activities || [],
    researchInterests: cv.content.researchInterests || [],
    positions: cv.content.positions || cv.content.experience || [],
    publications: cv.content.publications || [],
    conferences: cv.content.conferences || [],
    grants: cv.content.grants || [],
    awards: cv.content.awards || cv.content.achievements || [],
    techStack: cv.content.techStack || cv.content.skills || [],
    coreSkills: cv.content.coreSkills || cv.content.skills || [],
    skillCategories: cv.content.skillCategories || [],
    tagline: cv.content.personal?.title || '',
    social: cv.content.social || [],
    speaking: cv.content.speaking || [],
    mediaFeatures: cv.content.mediaFeatures || [],
  });

  /** Resolve the correct template component */
  const resolveTemplate = async (name: string) => {
    switch (name) {
      case 'Classic Professional':
        return (await import('./templates/ClassicTemplate')).default;
      case 'Modern Professional':
        return (await import('./templates/ModernTemplate')).default;
      case 'Executive Leadership':
        return (await import('./templates/ExecutiveTemplate')).default;
      case 'Graduate Starter CV':
        return (await import('./templates/GraduateTemplate')).default;
      case 'Skills-Based (Functional)':
        return (await import('./templates/FunctionalTemplate')).default;
      case 'Internship / Industrial Attachment':
        return (await import('./templates/InternshipTemplate')).default;
      case 'Creative Portfolio':
        return (await import('./templates/CreativeTemplate')).default;
      case 'Digital Professional':
        return (await import('./templates/DigitalProfessionalTemplate')).default;
      case 'Personal Brand CV':
        return (await import('./templates/PersonalBrandTemplate')).default;
      case 'Academic / Research CV':
        return (await import('./templates/AcademicTemplate')).default;
      case 'Technical / Engineering CV':
        return (await import('./templates/TechnicalEngineeringTemplate')).default;
      case 'International / ATS Optimized CV':
        return (await import('./templates/ATSOptimizedTemplate')).default;
      default:
        return (await import('./templates/ClassicTemplate')).default;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);

      const [html2pdf, { createRoot }, React, TemplateComponent] = await Promise.all([
        import('html2pdf.js').then(m => m.default),
        import('react-dom/client'),
        import('react'),
        resolveTemplate(templateName),
      ]) as any;

      const data = buildTemplateData();

      // Mount into a real DOM node so Tailwind CSS applies
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.top = '0';
      wrapper.style.left = '-9999px';
      wrapper.style.width = '794px';
      wrapper.style.zIndex = '-1';
      document.body.appendChild(wrapper);

      const root = createRoot(wrapper);

      await new Promise<void>(resolve => {
        root.render(React.createElement(TemplateComponent, { data }));
        // Give React a tick to flush, then wait for fonts/images
        setTimeout(() => resolve(), 300);
      });

      const opt = {
        margin: 0,
        filename: `${cv.title.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };

      // Capture the first child (the rendered template div)
      const templateEl = wrapper.firstElementChild as HTMLElement;
      await html2pdf().set(opt).from(templateEl).save();

      root.unmount();
      document.body.removeChild(wrapper);

      toast({ title: 'Success', description: 'CV downloaded as PDF' });
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to download PDF: ' + error.message, variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadWord = async () => {
    try {
      setDownloading(true);

      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import('docx');

      const p = cv.content.personal || {};
      const skills: string[] = cv.content.skills || [];
      const experience: any[] = cv.content.experience || [];
      const education: any[] = cv.content.education || [];
      const certifications: string[] = cv.content.certifications || [];
      const achievements: string[] = cv.content.achievements || [];
      const languages: string[] = cv.content.languages || [];
      const tools: string[] = cv.content.tools || [];

      const hr = () => new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '333333' } },
        spacing: { after: 100 },
        children: [],
      });

      const sectionHeading = (text: string) => new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '888888' } },
      });

      const bullet = (text: string) => new Paragraph({
        text: `• ${text}`,
        spacing: { after: 40 },
        indent: { left: 360 },
      });

      const children: any[] = [
        // Name
        new Paragraph({
          children: [new TextRun({ text: p.name || '', bold: true, size: 48 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        }),
        // Title
        new Paragraph({
          children: [new TextRun({ text: p.title || '', size: 28, color: '444444' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        }),
        // Contact line
        new Paragraph({
          children: [
            new TextRun({
              text: [p.location, p.phone, p.email, p.linkedin].filter(Boolean).join('  |  '),
              size: 20,
              color: '555555',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
      ];

      // Professional Summary
      if (p.profile) {
        children.push(sectionHeading('PROFESSIONAL SUMMARY'));
        children.push(new Paragraph({ text: p.profile, spacing: { after: 120 } }));
      }

      // Skills
      if (skills.length > 0) {
        children.push(sectionHeading('KEY SKILLS'));
        skills.forEach(s => children.push(bullet(s)));
        children.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      }

      // Tools & Platforms
      if (tools.length > 0) {
        children.push(sectionHeading('TOOLS & PLATFORMS'));
        tools.forEach(t => children.push(bullet(t)));
        children.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      }

      // Languages
      if (languages.length > 0) {
        children.push(sectionHeading('LANGUAGES'));
        languages.forEach(l => children.push(bullet(l)));
        children.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      }

      // Experience
      if (experience.length > 0) {
        children.push(sectionHeading('PROFESSIONAL EXPERIENCE'));
        experience.forEach(exp => {
          children.push(new Paragraph({
            children: [new TextRun({ text: exp.jobTitle || '', bold: true, size: 24 })],
            spacing: { before: 160, after: 40 },
          }));
          children.push(new Paragraph({
            children: [
              new TextRun({ text: exp.company || '', bold: true }),
              new TextRun({ text: exp.location ? `  —  ${exp.location}` : '', color: '555555' }),
            ],
            spacing: { after: 40 },
          }));
          if (exp.dates) {
            children.push(new Paragraph({
              children: [new TextRun({ text: exp.dates, italics: true, color: '666666', size: 20 })],
              spacing: { after: 60 },
            }));
          }
          (exp.details || []).forEach((d: string) => children.push(bullet(d)));
        });
        children.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      }

      // Education
      if (education.length > 0) {
        children.push(sectionHeading('EDUCATION'));
        education.forEach(edu => {
          children.push(new Paragraph({
            children: [new TextRun({ text: edu.degree || '', bold: true, size: 24 })],
            spacing: { before: 120, after: 40 },
          }));
          children.push(new Paragraph({ text: edu.institution || '', spacing: { after: 40 } }));
          if (edu.dates) {
            children.push(new Paragraph({
              children: [new TextRun({ text: edu.dates, italics: true, color: '666666', size: 20 })],
              spacing: { after: 80 },
            }));
          }
        });
      }

      // Certifications
      if (certifications.length > 0) {
        children.push(sectionHeading('CERTIFICATIONS'));
        certifications.forEach(c => children.push(bullet(c)));
        children.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      }

      // Achievements
      if (achievements.length > 0) {
        children.push(sectionHeading('PROFESSIONAL ACHIEVEMENTS'));
        achievements.forEach(a => children.push(bullet(a)));
        children.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      }

      // Referees
      children.push(sectionHeading('REFEREES'));
      children.push(new Paragraph({ children: [new TextRun({ text: 'Available upon request.', italics: true })] }));

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: { font: 'Calibri', size: 22 },
            },
          },
        },
        sections: [{ properties: {}, children }],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cv.title.replace(/\s+/g, '_')}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({ title: 'Success', description: 'CV downloaded as Word document' });
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to download Word document: ' + error.message, variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadText = () => {
    try {
      setDownloading(true);
      const p = cv.content.personal || {};
      let text = '';

      text += `${p.name || ''}\n${p.title || ''}\n`;
      text += [p.location, p.phone, p.email, p.linkedin].filter(Boolean).join(' | ') + '\n\n';

      if (p.profile) {
        text += 'PROFESSIONAL SUMMARY\n' + '='.repeat(50) + '\n' + p.profile + '\n\n';
      }

      const section = (title: string, items: string[]) => {
        if (!items.length) return;
        text += `${title}\n` + '='.repeat(50) + '\n';
        items.forEach(i => { text += `• ${i}\n`; });
        text += '\n';
      };

      section('KEY SKILLS', cv.content.skills || []);
      section('TOOLS & PLATFORMS', cv.content.tools || []);
      section('LANGUAGES', cv.content.languages || []);

      if ((cv.content.experience || []).length > 0) {
        text += 'PROFESSIONAL EXPERIENCE\n' + '='.repeat(50) + '\n';
        (cv.content.experience || []).forEach((exp: any) => {
          text += `\n${exp.jobTitle}\n${exp.company}${exp.location ? ' — ' + exp.location : ''}\n${exp.dates || ''}\n`;
          (exp.details || []).forEach((d: string) => { text += `• ${d}\n`; });
        });
        text += '\n';
      }

      if ((cv.content.education || []).length > 0) {
        text += 'EDUCATION\n' + '='.repeat(50) + '\n';
        (cv.content.education || []).forEach((edu: any) => {
          text += `\n${edu.degree}\n${edu.institution}\n${edu.dates || ''}\n`;
        });
        text += '\n';
      }

      section('CERTIFICATIONS', cv.content.certifications || []);
      section('PROFESSIONAL ACHIEVEMENTS', cv.content.achievements || []);

      text += 'REFEREES\n' + '='.repeat(50) + '\nAvailable upon request.\n';

      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cv.title.replace(/\s+/g, '_')}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({ title: 'Success', description: 'CV downloaded as text file' });
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to download text file: ' + error.message, variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download CV</DialogTitle>
          <DialogDescription>
            Choose your preferred format to download {cv.title}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            <FileText className="h-5 w-5 mr-3 text-red-600" />
            <div className="text-left">
              <div className="font-semibold">PDF Document</div>
              <div className="text-xs text-muted-foreground">
                Best for printing and email attachments
              </div>
            </div>
          </Button>

          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={handleDownloadWord}
            disabled={downloading}
          >
            <FileType className="h-5 w-5 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold">Word Document (.docx) — Editable</div>
              <div className="text-xs text-muted-foreground">
                Plain structured format for editing. Does not replicate the visual template design.
              </div>
            </div>
          </Button>

          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={handleDownloadText}
            disabled={downloading}
          >
            <Download className="h-5 w-5 mr-3 text-gray-600" />
            <div className="text-left">
              <div className="font-semibold">Plain Text (.txt)</div>
              <div className="text-xs text-muted-foreground">
                Simple format for ATS systems
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
