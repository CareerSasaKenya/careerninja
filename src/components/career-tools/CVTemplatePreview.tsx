'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface CVTemplatePreviewProps {
  template: {
    id: string;
    name: string;
    category: string;
    description?: string;
    is_premium: boolean;
    template_data?: any;
  };
  onClick?: () => void;
}

export default function CVTemplatePreview({ template, onClick }: CVTemplatePreviewProps) {
  const colors = template.template_data?.colors || { primary: '#2563eb', secondary: '#64748b', accent: '#f59e0b' };
  
  // Template-specific layouts
  const renderModernTemplate = () => (
    <div className="h-full bg-white p-3 text-[6px] leading-tight">
      {/* Header with photo */}
      <div className="flex gap-2 mb-2 pb-2 border-b-2" style={{ borderColor: colors.primary }}>
        <div className="w-10 h-10 rounded-full" style={{ backgroundColor: colors.primary, opacity: 0.2 }}></div>
        <div className="flex-1">
          <div className="font-bold text-[8px] mb-0.5" style={{ color: colors.primary }}>JOHN DOE</div>
          <div className="text-[5px] opacity-60">Senior Software Engineer</div>
          <div className="text-[5px] opacity-50 mt-0.5">john.doe@email.com | +254 700 000 000</div>
        </div>
      </div>
      
      {/* Two column layout */}
      <div className="flex gap-2">
        {/* Left sidebar */}
        <div className="w-1/3 space-y-2">
          <div>
            <div className="font-bold mb-1" style={{ color: colors.primary }}>SKILLS</div>
            <div className="space-y-0.5">
              <div className="h-1 rounded-full" style={{ backgroundColor: colors.primary, opacity: 0.3 }}></div>
              <div className="h-1 rounded-full w-4/5" style={{ backgroundColor: colors.primary, opacity: 0.3 }}></div>
              <div className="h-1 rounded-full w-3/4" style={{ backgroundColor: colors.primary, opacity: 0.3 }}></div>
            </div>
          </div>
          <div>
            <div className="font-bold mb-1" style={{ color: colors.primary }}>LANGUAGES</div>
            <div className="space-y-0.5 opacity-60">
              <div className="h-1 w-3/4"></div>
              <div className="h-1 w-2/3"></div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 space-y-2">
          <div>
            <div className="font-bold mb-1" style={{ color: colors.primary }}>EXPERIENCE</div>
            <div className="space-y-1">
              <div className="h-1 w-full opacity-60"></div>
              <div className="h-1 w-5/6 opacity-40"></div>
              <div className="h-1 w-4/5 opacity-40"></div>
            </div>
          </div>
          <div>
            <div className="font-bold mb-1" style={{ color: colors.primary }}>EDUCATION</div>
            <div className="space-y-1">
              <div className="h-1 w-4/5 opacity-60"></div>
              <div className="h-1 w-3/4 opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClassicTemplate = () => (
    <div className="h-full bg-white p-3 text-[6px] leading-tight">
      {/* Centered header */}
      <div className="text-center mb-2 pb-2 border-b border-gray-300">
        <div className="font-bold text-[9px] mb-0.5">JOHN DOE</div>
        <div className="text-[5px] opacity-60 mb-1">Senior Software Engineer</div>
        <div className="text-[5px] opacity-50">john.doe@email.com | +254 700 000 000 | Nairobi, Kenya</div>
      </div>
      
      {/* Single column layout */}
      <div className="space-y-2">
        <div>
          <div className="font-bold mb-1 pb-0.5 border-b border-gray-200">PROFESSIONAL SUMMARY</div>
          <div className="space-y-0.5 opacity-60">
            <div className="h-1 w-full"></div>
            <div className="h-1 w-full"></div>
            <div className="h-1 w-4/5"></div>
          </div>
        </div>
        
        <div>
          <div className="font-bold mb-1 pb-0.5 border-b border-gray-200">WORK EXPERIENCE</div>
          <div className="space-y-1">
            <div>
              <div className="h-1 w-3/4 opacity-70 mb-0.5"></div>
              <div className="h-1 w-full opacity-50"></div>
              <div className="h-1 w-5/6 opacity-50"></div>
            </div>
            <div>
              <div className="h-1 w-3/4 opacity-70 mb-0.5"></div>
              <div className="h-1 w-full opacity-50"></div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="font-bold mb-1 pb-0.5 border-b border-gray-200">EDUCATION</div>
          <div className="h-1 w-4/5 opacity-60"></div>
        </div>
        
        <div>
          <div className="font-bold mb-1 pb-0.5 border-b border-gray-200">SKILLS</div>
          <div className="flex flex-wrap gap-0.5">
            <div className="h-1.5 w-8 rounded opacity-40"></div>
            <div className="h-1.5 w-10 rounded opacity-40"></div>
            <div className="h-1.5 w-7 rounded opacity-40"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreativeTemplate = () => (
    <div className="h-full bg-white">
      {/* Colored sidebar */}
      <div className="flex h-full">
        <div className="w-2/5 p-2 text-white" style={{ backgroundColor: colors.primary }}>
          <div className="w-8 h-8 rounded-full bg-white/20 mx-auto mb-2"></div>
          <div className="text-center mb-2">
            <div className="font-bold text-[7px] mb-0.5">JOHN DOE</div>
            <div className="text-[5px] opacity-80">Software Engineer</div>
          </div>
          
          <div className="space-y-2 text-[5px]">
            <div>
              <div className="font-bold mb-1 opacity-90">CONTACT</div>
              <div className="space-y-0.5 opacity-70">
                <div className="h-1 w-full"></div>
                <div className="h-1 w-4/5"></div>
              </div>
            </div>
            
            <div>
              <div className="font-bold mb-1 opacity-90">SKILLS</div>
              <div className="space-y-0.5">
                <div className="h-1 rounded-full bg-white/30 w-full"></div>
                <div className="h-1 rounded-full bg-white/30 w-4/5"></div>
                <div className="h-1 rounded-full bg-white/30 w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-2 text-[6px]">
          <div className="space-y-2">
            <div>
              <div className="font-bold mb-1" style={{ color: colors.primary }}>ABOUT ME</div>
              <div className="space-y-0.5 opacity-60">
                <div className="h-1 w-full"></div>
                <div className="h-1 w-full"></div>
                <div className="h-1 w-3/4"></div>
              </div>
            </div>
            
            <div>
              <div className="font-bold mb-1" style={{ color: colors.primary }}>EXPERIENCE</div>
              <div className="space-y-1">
                <div>
                  <div className="h-1 w-3/4 opacity-70 mb-0.5"></div>
                  <div className="h-1 w-full opacity-50"></div>
                  <div className="h-1 w-5/6 opacity-50"></div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="font-bold mb-1" style={{ color: colors.primary }}>EDUCATION</div>
              <div className="h-1 w-4/5 opacity-60"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfessionalTemplate = () => (
    <div className="h-full bg-white p-3 text-[6px] leading-tight">
      {/* Header with accent line */}
      <div className="mb-2">
        <div className="h-0.5 mb-1" style={{ backgroundColor: colors.primary }}></div>
        <div className="font-bold text-[9px] mb-0.5">JOHN DOE</div>
        <div className="text-[6px] opacity-70 mb-1">Senior Software Engineer</div>
        <div className="text-[5px] opacity-50">john.doe@email.com | +254 700 000 000 | LinkedIn: johndoe</div>
        <div className="h-0.5 mt-1" style={{ backgroundColor: colors.primary }}></div>
      </div>
      
      <div className="space-y-2">
        <div>
          <div className="font-bold mb-1 text-[7px]" style={{ color: colors.primary }}>PROFESSIONAL SUMMARY</div>
          <div className="space-y-0.5 opacity-60">
            <div className="h-1 w-full"></div>
            <div className="h-1 w-full"></div>
            <div className="h-1 w-5/6"></div>
          </div>
        </div>
        
        <div>
          <div className="font-bold mb-1 text-[7px]" style={{ color: colors.primary }}>CORE COMPETENCIES</div>
          <div className="grid grid-cols-2 gap-0.5">
            <div className="h-1 opacity-60"></div>
            <div className="h-1 opacity-60"></div>
            <div className="h-1 opacity-60"></div>
            <div className="h-1 opacity-60"></div>
          </div>
        </div>
        
        <div>
          <div className="font-bold mb-1 text-[7px]" style={{ color: colors.primary }}>PROFESSIONAL EXPERIENCE</div>
          <div className="space-y-1">
            <div>
              <div className="flex justify-between mb-0.5">
                <div className="h-1 w-2/5 opacity-70"></div>
                <div className="h-1 w-1/5 opacity-50"></div>
              </div>
              <div className="h-1 w-full opacity-50"></div>
              <div className="h-1 w-5/6 opacity-50"></div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="font-bold mb-1 text-[7px]" style={{ color: colors.primary }}>EDUCATION</div>
            <div className="h-1 w-4/5 opacity-60"></div>
          </div>
          <div className="flex-1">
            <div className="font-bold mb-1 text-[7px]" style={{ color: colors.primary }}>CERTIFICATIONS</div>
            <div className="h-1 w-3/4 opacity-60"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplate = () => {
    switch (template.category) {
      case 'modern':
        return renderModernTemplate();
      case 'classic':
        return renderClassicTemplate();
      case 'creative':
        return renderCreativeTemplate();
      case 'professional':
        return renderProfessionalTemplate();
      default:
        return renderClassicTemplate();
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 overflow-hidden"
      onClick={onClick}
    >
      <div className="aspect-[3/4] border-b-2 border-gray-200 bg-gray-50">
        {renderTemplate()}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-sm font-semibold">{template.name}</h3>
          {template.is_premium && (
            <Badge variant="secondary" className="text-xs">Premium</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground capitalize mb-2">
          {template.category} style
        </p>
        {template.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}
      </div>
    </Card>
  );
}
