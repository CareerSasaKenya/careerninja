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

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      
      // Import html2pdf dynamically
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);
      
      // Render the CV template
      const cvHTML = await renderCVTemplate(cv, templateName);
      container.innerHTML = cvHTML;
      
      // Configure PDF options
      const opt = {
        margin: 0,
        filename: `${cv.title.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // Generate and download PDF
      await html2pdf().set(opt).from(container).save();
      
      // Cleanup
      document.body.removeChild(container);
      
      toast({
        title: 'Success',
        description: 'CV downloaded as PDF'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download PDF: ' + error.message,
        variant: 'destructive'
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadWord = async () => {
    try {
      setDownloading(true);
      
      // Import docx library dynamically
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Header
            new Paragraph({
              text: cv.content.personal?.name || '',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: cv.content.personal?.title || '',
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${cv.content.personal?.location || ''} | ${cv.content.personal?.phone || ''} | ${cv.content.personal?.email || ''}`,
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            
            // Professional Summary
            ...(cv.content.personal?.profile ? [
              new Paragraph({
                text: 'Professional Summary',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                text: cv.content.personal.profile,
                spacing: { after: 200 },
              }),
            ] : []),
            
            // Skills
            ...(cv.content.skills && cv.content.skills.length > 0 ? [
              new Paragraph({
                text: 'Key Skills',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              }),
              ...cv.content.skills.map(skill => 
                new Paragraph({
                  text: `• ${skill}`,
                  spacing: { after: 50 },
                })
              ),
            ] : []),
            
            // Experience
            ...(cv.content.experience && cv.content.experience.length > 0 ? [
              new Paragraph({
                text: 'Professional Experience',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              }),
              ...cv.content.experience.flatMap(exp => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.jobTitle,
                      bold: true,
                    }),
                  ],
                  spacing: { before: 100 },
                }),
                new Paragraph({
                  text: `${exp.company} - ${exp.location}`,
                }),
                new Paragraph({
                  text: exp.dates,
                  italics: true,
                  spacing: { after: 50 },
                }),
                ...exp.details.map(detail => 
                  new Paragraph({
                    text: `• ${detail}`,
                    spacing: { after: 50 },
                  })
                ),
              ]),
            ] : []),
            
            // Education
            ...(cv.content.education && cv.content.education.length > 0 ? [
              new Paragraph({
                text: 'Education',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              }),
              ...cv.content.education.flatMap(edu => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.degree,
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  text: edu.institution,
                }),
                new Paragraph({
                  text: edu.dates,
                  italics: true,
                  spacing: { after: 100 },
                }),
              ]),
            ] : []),
            
            // Certifications
            ...(cv.content.certifications && cv.content.certifications.length > 0 ? [
              new Paragraph({
                text: 'Certifications',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              }),
              ...cv.content.certifications.map(cert => 
                new Paragraph({
                  text: `• ${cert}`,
                  spacing: { after: 50 },
                })
              ),
            ] : []),
            
            // Achievements
            ...(cv.content.achievements && cv.content.achievements.length > 0 ? [
              new Paragraph({
                text: 'Professional Achievements',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              }),
              ...cv.content.achievements.map(achievement => 
                new Paragraph({
                  text: `• ${achievement}`,
                  spacing: { after: 50 },
                })
              ),
            ] : []),
          ],
        }],
      });
      
      // Generate and download
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cv.title.replace(/\s+/g, '_')}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'CV downloaded as Word document'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download Word document: ' + error.message,
        variant: 'destructive'
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadText = () => {
    try {
      setDownloading(true);
      
      let text = '';
      
      // Header
      text += `${cv.content.personal?.name || ''}\n`;
      text += `${cv.content.personal?.title || ''}\n`;
      text += `${cv.content.personal?.location || ''} | ${cv.content.personal?.phone || ''} | ${cv.content.personal?.email || ''}\n`;
      if (cv.content.personal?.linkedin) {
        text += `${cv.content.personal.linkedin}\n`;
      }
      text += '\n';
      
      // Professional Summary
      if (cv.content.personal?.profile) {
        text += 'PROFESSIONAL SUMMARY\n';
        text += '='.repeat(50) + '\n';
        text += `${cv.content.personal.profile}\n\n`;
      }
      
      // Skills
      if (cv.content.skills && cv.content.skills.length > 0) {
        text += 'KEY SKILLS\n';
        text += '='.repeat(50) + '\n';
        cv.content.skills.forEach(skill => {
          text += `• ${skill}\n`;
        });
        text += '\n';
      }
      
      // Experience
      if (cv.content.experience && cv.content.experience.length > 0) {
        text += 'PROFESSIONAL EXPERIENCE\n';
        text += '='.repeat(50) + '\n';
        cv.content.experience.forEach(exp => {
          text += `\n${exp.jobTitle}\n`;
          text += `${exp.company} - ${exp.location}\n`;
          text += `${exp.dates}\n`;
          exp.details.forEach(detail => {
            text += `• ${detail}\n`;
          });
        });
        text += '\n';
      }
      
      // Education
      if (cv.content.education && cv.content.education.length > 0) {
        text += 'EDUCATION\n';
        text += '='.repeat(50) + '\n';
        cv.content.education.forEach(edu => {
          text += `\n${edu.degree}\n`;
          text += `${edu.institution}\n`;
          text += `${edu.dates}\n`;
        });
        text += '\n';
      }
      
      // Certifications
      if (cv.content.certifications && cv.content.certifications.length > 0) {
        text += 'CERTIFICATIONS\n';
        text += '='.repeat(50) + '\n';
        cv.content.certifications.forEach(cert => {
          text += `• ${cert}\n`;
        });
        text += '\n';
      }
      
      // Achievements
      if (cv.content.achievements && cv.content.achievements.length > 0) {
        text += 'PROFESSIONAL ACHIEVEMENTS\n';
        text += '='.repeat(50) + '\n';
        cv.content.achievements.forEach(achievement => {
          text += `• ${achievement}\n`;
        });
        text += '\n';
      }
      
      // Create and download
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cv.title.replace(/\s+/g, '_')}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'CV downloaded as text file'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download text file: ' + error.message,
        variant: 'destructive'
      });
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
              <div className="font-semibold">Word Document (.docx)</div>
              <div className="text-xs text-muted-foreground">
                Editable format for further customization
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

// Helper function to render CV template as HTML
async function renderCVTemplate(cv: CandidateCV, templateName: string): Promise<string> {
  const data = {
    name: cv.content.personal?.name || '',
    title: cv.content.personal?.title || '',
    contact: {
      phone: cv.content.personal?.phone || '',
      email: cv.content.personal?.email || '',
      linkedin: cv.content.personal?.linkedin || '',
      location: cv.content.personal?.location || '',
    },
    profile: cv.content.personal?.profile || '',
    skills: cv.content.skills || [],
    experience: cv.content.experience || [],
    education: cv.content.education || [],
    certifications: cv.content.certifications || [],
    achievements: cv.content.achievements || [],
    languages: cv.content.languages || [],
    tools: cv.content.tools || [],
  };
  
  // Import the appropriate template dynamically
  let TemplateComponent;
  switch (templateName) {
    case 'Classic Professional':
      TemplateComponent = (await import('./templates/ClassicTemplate')).default;
      break;
    case 'Modern Professional':
      TemplateComponent = (await import('./templates/ModernTemplate')).default;
      break;
    case 'Executive Leadership':
      TemplateComponent = (await import('./templates/ExecutiveTemplate')).default;
      break;
    default:
      TemplateComponent = (await import('./templates/ClassicTemplate')).default;
  }
  
  // Render React component to HTML string
  const ReactDOMServer = (await import('react-dom/server')).default;
  const React = (await import('react')).default;
  
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(TemplateComponent, { data })
  );
}
