/**
 * CV Template Preview Component
 * Renders a scaled-down preview of CV templates
 */

import React from 'react';
import ClassicTemplate from './templates/ClassicTemplate';

interface CVTemplatePreviewProps {
  templateName: string;
  scale?: number;
}

// Sample data for preview
const sampleData = {
  name: "John Mwangi Kariuki",
  title: "Administrative Officer",
  contact: {
    phone: "+254712345678",
    email: "john.mwangi@email.com",
    linkedin: "linkedin.com/in/johnmwangi",
    location: "Nairobi, Kenya"
  },
  profile: "Results-driven administrative professional with 5+ years of experience in office management and records administration.",
  skills: [
    "Office Administration",
    "Records Management",
    "Customer Service",
    "Microsoft Office Suite",
    "Report Preparation",
    "Team Coordination"
  ],
  experience: [
    {
      jobTitle: "Administrative Officer",
      company: "ABC Logistics Ltd",
      location: "Nairobi",
      dates: "March 2021 – Present",
      details: [
        "Coordinate daily office operations and administrative activities",
        "Prepare reports, meeting minutes, and official correspondence",
        "Manage document filing systems and maintain accurate records"
      ]
    }
  ],
  education: [
    {
      degree: "Bachelor of Business Administration",
      institution: "University of Nairobi",
      dates: "2014 – 2018"
    }
  ],
  certifications: [
    "Certificate in Project Management – Kenya Institute of Management, 2020"
  ]
};

export default function CVTemplatePreview({ templateName, scale = 0.25 }: CVTemplatePreviewProps) {
  const renderTemplate = () => {
    switch (templateName) {
      case 'Classic Professional':
      case 'ClassicTemplate':
        return <ClassicTemplate data={sampleData} />;
      
      // Add more templates here as they're created
      case 'Modern Professional':
        return (
          <div className="w-[794px] h-[1123px] bg-white p-12 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-sm">Modern Professional Template</p>
              <p className="text-xs mt-2">Coming Soon</p>
            </div>
          </div>
        );
      
      case 'Classic Executive':
        return (
          <div className="w-[794px] h-[1123px] bg-white p-12 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-sm">Classic Executive Template</p>
              <p className="text-xs mt-2">Coming Soon</p>
            </div>
          </div>
        );
      
      case 'Creative Designer':
        return (
          <div className="w-[794px] h-[1123px] bg-white p-12 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-sm">Creative Designer Template</p>
              <p className="text-xs mt-2">Coming Soon</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="w-[794px] h-[1123px] bg-gray-100 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-sm">Template Preview</p>
              <p className="text-xs mt-2">Not Available</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="origin-top-left overflow-hidden rounded-md border border-gray-200 shadow-sm"
      style={{
        transform: `scale(${scale})`,
        width: `${794 * scale}px`,
        height: `${1123 * scale}px`
      }}
    >
      {renderTemplate()}
    </div>
  );
}
