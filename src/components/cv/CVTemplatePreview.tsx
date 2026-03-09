/**
 * CV Template Preview Component
 * Renders a thumbnail preview of CV templates with full content
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
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded p-2 md:p-2 text-[5px] md:text-[3.5px] leading-[1.3] overflow-hidden">
            {/* Header */}
            <div className="border-b-[0.5px] border-gray-800 pb-0.5 mb-1">
              <div className="font-bold text-[9px] md:text-[7px] mb-0.5">JOHN MWANGI KARIUKI</div>
              <div className="text-[7px] md:text-[5px] text-gray-700 mb-0.5">Administrative Officer</div>
              <div className="text-[4.5px] md:text-[3px] text-gray-600 space-y-0.5">
                <div>📍 Nairobi, Kenya</div>
                <div>📞 +254 712 345 678</div>
                <div>✉ johnmwangi@email.com</div>
                <div>🔗 linkedin.com/in/johnmwangi</div>
              </div>
            </div>
            
            {/* Professional Summary */}
            <div className="mb-1">
              <div className="font-bold text-[5.5px] md:text-[4px] uppercase border-b-[0.5px] border-gray-300 mb-0.5">Professional Summary</div>
              <div className="text-[4.5px] md:text-[3px] text-gray-700">Results-driven administrative and operations professional with over 5 years of experience supporting organizational efficiency, office coordination, and project administration.</div>
            </div>
            
            {/* Skills */}
            <div className="mb-1">
              <div className="font-bold text-[5.5px] md:text-[4px] uppercase border-b-[0.5px] border-gray-300 mb-0.5">Key Skills</div>
              <div className="grid grid-cols-2 gap-x-1 text-[4.5px] md:text-[3px]">
                <div>• Office Administration</div>
                <div>• Records Management</div>
                <div>• Customer Service</div>
                <div>• Scheduling & Calendar</div>
                <div>• Report Preparation</div>
                <div>• Microsoft Office</div>
                <div>• Problem Solving</div>
                <div>• Team Collaboration</div>
              </div>
            </div>
            
            {/* Experience */}
            <div className="mb-1">
              <div className="font-bold text-[5.5px] md:text-[4px] uppercase border-b-[0.5px] border-gray-300 mb-0.5">Professional Experience</div>
              <div className="text-[4.5px] md:text-[3px] mb-1">
                <div className="font-semibold">Administrative Officer</div>
                <div className="text-gray-700">ABC Logistics Ltd – Nairobi</div>
                <div className="text-gray-500 italic mb-0.5">March 2021 – Present</div>
                <div className="space-y-0.5">
                  <div>• Coordinate daily office operations and administrative activities</div>
                  <div>• Prepare reports, meeting minutes, and official correspondence</div>
                  <div>• Manage document filing systems and maintain accurate records</div>
                </div>
              </div>
              <div className="text-[4.5px] md:text-[3px]">
                <div className="font-semibold">Office Assistant</div>
                <div className="text-gray-700">Greenfield Solutions Ltd – Nairobi</div>
                <div className="text-gray-500 italic mb-0.5">January 2019 – February 2021</div>
                <div className="space-y-0.5">
                  <div>• Supported administrative tasks including data entry and scheduling</div>
                  <div>• Managed incoming calls, emails, and office correspondence</div>
                </div>
              </div>
            </div>
            
            {/* Education */}
            <div className="mb-1">
              <div className="font-bold text-[5.5px] md:text-[4px] uppercase border-b-[0.5px] border-gray-300 mb-0.5">Education</div>
              <div className="text-[4.5px] md:text-[3px]">
                <div className="font-semibold">Bachelor of Business Administration</div>
                <div>University of Nairobi</div>
                <div className="text-gray-500 italic">2014 – 2018</div>
              </div>
            </div>
            
            {/* Certifications */}
            <div className="mb-1">
              <div className="font-bold text-[5.5px] md:text-[4px] uppercase border-b-[0.5px] border-gray-300 mb-0.5">Professional Certifications</div>
              <div className="text-[4.5px] md:text-[3px]">
                <div>• Certificate in Project Management – Kenya Institute of Management 2020</div>
              </div>
            </div>
            
            {/* Referees */}
            <div>
              <div className="font-bold text-[5.5px] md:text-[4px] uppercase border-b-[0.5px] border-gray-300 mb-0.5">Referees</div>
              <div className="text-[4.5px] md:text-[3px] italic">Available upon request.</div>
            </div>
          </div>
        );
      
      case 'Modern Professional':
        return (
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-blue-50 to-white border border-gray-200 rounded p-2 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-[8px] md:text-[6px] font-semibold">Modern Professional</div>
              <div className="text-[6px] md:text-[4px] mt-1">Coming Soon</div>
            </div>
          </div>
        );
      
      case 'Classic Executive':
        return (
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded p-2 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-[8px] md:text-[6px] font-semibold">Classic Executive</div>
              <div className="text-[6px] md:text-[4px] mt-1">Coming Soon</div>
            </div>
          </div>
        );
      
      case 'Creative Designer':
        return (
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-purple-50 to-white border border-gray-200 rounded p-2 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-[8px] md:text-[6px] font-semibold">Creative Designer</div>
              <div className="text-[6px] md:text-[4px] mt-1">Coming Soon</div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="w-full aspect-[3/4] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-[8px] md:text-[6px]">Template Preview</div>
              <div className="text-[6px] md:text-[4px] mt-1">Not Available</div>
            </div>
          </div>
        );
    }
  };

  return renderPreview();
}
