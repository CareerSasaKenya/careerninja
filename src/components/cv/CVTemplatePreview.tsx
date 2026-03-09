/**
 * CV Template Preview Component
 * Renders a thumbnail preview of CV templates
 */

import React from 'react';

interface CVTemplatePreviewProps {
  templateName: string;
}

export default function CVTemplatePreview({ templateName }: CVTemplatePreviewProps) {
  const renderPreview = () => {
    switch (templateName) {
      case 'Classic Professional':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded p-2 text-[4px] leading-tight">
            {/* Header */}
            <div className="border-b border-gray-800 pb-1 mb-1">
              <div className="font-bold text-[6px] mb-0.5">JOHN MWANGI KARIUKI</div>
              <div className="text-[5px] text-gray-700">Administrative Officer</div>
              <div className="text-[3px] text-gray-600 mt-0.5">Nairobi • +254712345678 • email@example.com</div>
            </div>
            
            {/* Professional Summary */}
            <div className="mb-1">
              <div className="font-bold text-[4px] uppercase border-b border-gray-300 mb-0.5">Professional Summary</div>
              <div className="text-[3px] text-gray-700">Results-driven professional with 5+ years experience in office management...</div>
            </div>
            
            {/* Skills */}
            <div className="mb-1">
              <div className="font-bold text-[4px] uppercase border-b border-gray-300 mb-0.5">Key Skills</div>
              <div className="grid grid-cols-2 gap-x-1 text-[3px]">
                <div>• Office Administration</div>
                <div>• Records Management</div>
                <div>• Customer Service</div>
                <div>• Microsoft Office</div>
              </div>
            </div>
            
            {/* Experience */}
            <div className="mb-1">
              <div className="font-bold text-[4px] uppercase border-b border-gray-300 mb-0.5">Experience</div>
              <div className="text-[3px]">
                <div className="font-semibold">Administrative Officer</div>
                <div className="text-gray-600">ABC Logistics Ltd, Nairobi</div>
                <div className="text-gray-500 italic">March 2021 – Present</div>
                <div className="mt-0.5 space-y-0.5">
                  <div>• Coordinate daily operations</div>
                  <div>• Prepare reports and minutes</div>
                </div>
              </div>
            </div>
            
            {/* Education */}
            <div className="mb-1">
              <div className="font-bold text-[4px] uppercase border-b border-gray-300 mb-0.5">Education</div>
              <div className="text-[3px]">
                <div className="font-semibold">Bachelor of Business Admin</div>
                <div>University of Nairobi</div>
                <div className="text-gray-500 italic">2014 – 2018</div>
              </div>
            </div>
          </div>
        );
      
      case 'Modern Professional':
        return (
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-blue-50 to-white border border-gray-200 rounded p-2 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-[6px] font-semibold">Modern Professional</div>
              <div className="text-[4px] mt-1">Coming Soon</div>
            </div>
          </div>
        );
      
      case 'Classic Executive':
        return (
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded p-2 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-[6px] font-semibold">Classic Executive</div>
              <div className="text-[4px] mt-1">Coming Soon</div>
            </div>
          </div>
        );
      
      case 'Creative Designer':
        return (
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-purple-50 to-white border border-gray-200 rounded p-2 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-[6px] font-semibold">Creative Designer</div>
              <div className="text-[4px] mt-1">Coming Soon</div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="w-full aspect-[3/4] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-[6px]">Template Preview</div>
              <div className="text-[4px] mt-1">Not Available</div>
            </div>
          </div>
        );
    }
  };

  return renderPreview();
}
