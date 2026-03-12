/**
 * CV Template Preview Component
 * Renders a thumbnail preview of CV templates with full content
 * SAME SIZE ON ALL DEVICES
 */

import React from 'react';

interface CVTemplatePreviewProps {
  templateName: string;
  showDescription?: boolean;
  descriptionOnly?: boolean;
}

const templateDescriptions: Record<string, string> = {
  'Classic Professional': 'A clean, ATS-friendly single-column layout perfect for entry to mid-level professionals. Emphasizes clarity and readability.',
  'Modern Professional': 'A stylized two-column design with blue accents and modern aesthetics. Ideal for corporate roles and marketing positions.',
  'Executive Leadership': 'A premium serif layout emphasizing leadership achievements and strategic impact. Perfect for directors, CEOs, and senior management.'
};

export default function CVTemplatePreview({ templateName, showDescription = false, descriptionOnly = false }: CVTemplatePreviewProps) {
  // If only showing description, return just that
  if (descriptionOnly && templateDescriptions[templateName]) {
    return (
      <p className="text-xs text-muted-foreground leading-relaxed">
        {templateDescriptions[templateName]}
      </p>
    );
  }

  const renderPreview = () => {
    switch (templateName) {
      case 'Classic Professional':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded p-4 text-[8px] leading-[1.4] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="border-b border-gray-800 pb-1.5 mb-2">
              <div className="font-bold text-[14px] mb-1">JOHN MWANGI KARIUKI</div>
              <div className="text-[10px] text-gray-700 mb-1">Administrative Officer</div>
              <div className="text-[7px] text-gray-600 space-y-0.5">
                <div>📍 Nairobi, Kenya</div>
                <div>📞 +254 712 345 678</div>
                <div>✉ johnmwangi@email.com</div>
                <div>🔗 linkedin.com/in/johnmwangi</div>
              </div>
            </div>
            
            {/* Professional Summary */}
            <div className="mb-2">
              <div className="font-bold text-[8.5px] uppercase border-b border-gray-300 mb-1">Professional Summary</div>
              <div className="text-[7px] text-gray-700">Results-driven administrative and operations professional with over 5 years of experience supporting organizational efficiency, office coordination, and project administration.</div>
            </div>
            
            {/* Skills */}
            <div className="mb-2">
              <div className="font-bold text-[8.5px] uppercase border-b border-gray-300 mb-1">Key Skills</div>
              <div className="grid grid-cols-2 gap-x-2 text-[7px]">
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
            <div className="mb-1.5">
              <div className="font-bold text-[6.5px] uppercase border-b border-gray-300 mb-1">Professional Experience</div>
              <div className="text-[5.5px] mb-1.5">
                <div className="font-semibold">Administrative Officer</div>
                <div className="text-gray-700">ABC Logistics Ltd – Nairobi</div>
                <div className="text-gray-500 italic mb-0.5">March 2021 – Present</div>
                <div className="space-y-0.5">
                  <div>• Coordinate daily office operations and administrative activities</div>
                  <div>• Prepare reports, meeting minutes, and official correspondence</div>
                  <div>• Manage document filing systems and maintain accurate records</div>
                  <div>• Supervise office support staff and coordinate schedules</div>
                </div>
              </div>
              <div className="text-[5.5px] mb-1.5">
                <div className="font-semibold">Office Assistant</div>
                <div className="text-gray-700">Greenfield Solutions Ltd – Nairobi</div>
                <div className="text-gray-500 italic mb-0.5">January 2019 – February 2021</div>
                <div className="space-y-0.5">
                  <div>• Supported administrative tasks including data entry and scheduling</div>
                  <div>• Managed incoming calls, emails, and office correspondence</div>
                  <div>• Assisted with event planning and coordination</div>
                </div>
              </div>
              <div className="text-[5.5px]">
                <div className="font-semibold">Administrative Intern</div>
                <div className="text-gray-700">Kenya Commercial Bank – Nairobi</div>
                <div className="text-gray-500 italic mb-0.5">June 2018 – December 2018</div>
                <div className="space-y-0.5">
                  <div>• Assisted with filing, data entry, and document management</div>
                  <div>• Supported customer service and front desk operations</div>
                </div>
              </div>
            </div>
            
            {/* Education */}
            <div className="mb-1.5">
              <div className="font-bold text-[6.5px] uppercase border-b border-gray-300 mb-1">Education</div>
              <div className="text-[5.5px] mb-1">
                <div className="font-semibold">Bachelor of Business Administration</div>
                <div>University of Nairobi</div>
                <div className="text-gray-500 italic">2014 – 2018</div>
              </div>
              <div className="text-[5.5px] mb-1">
                <div className="font-semibold">Diploma in Business Management</div>
                <div>Kenya Institute of Management</div>
                <div className="text-gray-500 italic">2012 – 2014</div>
              </div>
              <div className="text-[5.5px]">
                <div className="font-semibold">Kenya Certificate of Secondary Education</div>
                <div>Starehe Boys Centre</div>
                <div className="text-gray-500 italic">2008 – 2011</div>
              </div>
            </div>
            
            {/* Certifications */}
            <div className="mb-1.5">
              <div className="font-bold text-[6.5px] uppercase border-b border-gray-300 mb-1">Professional Certifications</div>
              <div className="text-[5.5px] space-y-0.5">
                <div>• Certificate in Project Management – Kenya Institute of Management 2020</div>
                <div>• Advanced Microsoft Excel Training – Strathmore University 2019</div>
              </div>
            </div>
            
            {/* Achievements */}
            <div className="mb-1.5">
              <div className="font-bold text-[6.5px] uppercase border-b border-gray-300 mb-1">Professional Achievements</div>
              <div className="text-[5.5px] space-y-0.5">
                <div>• Streamlined office filing system, reducing document retrieval time by 40%</div>
                <div>• Successfully coordinated 15+ company events with 100% attendance</div>
                <div>• Implemented digital record-keeping improving efficiency by 30%</div>
                <div>• Reduced office supply costs by 25% through strategic vendor negotiations</div>
                <div>• Trained and mentored 5 new administrative staff members</div>
              </div>
            </div>
            
            {/* Referees */}
            <div>
              <div className="font-bold text-[6.5px] uppercase border-b border-gray-300 mb-1">Referees</div>
              <div className="text-[5.5px] italic">Available upon request.</div>
            </div>
          </div>
        );
      
      case 'Modern Professional':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded overflow-hidden flex text-[4.5px] leading-[1.3]">
            {/* Left Sidebar */}
            <div className="w-[35%] bg-blue-50 p-2">
              <div className="mb-1.5">
                <div className="font-bold text-[6px] text-blue-900 uppercase mb-1">Key Skills</div>
                <div className="space-y-0.5 text-[4.2px]">
                  <div>▪ Digital Marketing Strategy</div>
                  <div>▪ Social Media Management</div>
                  <div>▪ Content Marketing</div>
                  <div>▪ SEO Optimization</div>
                  <div>▪ Campaign Analytics</div>
                  <div>▪ Brand Communication</div>
                  <div>▪ Email Marketing</div>
                  <div>▪ Copywriting</div>
                </div>
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[6px] text-blue-900 uppercase mb-1">Tools & Platforms</div>
                <div className="space-y-0.5 text-[4.2px]">
                  <div>▪ Google Analytics</div>
                  <div>▪ Meta Ads Manager</div>
                  <div>▪ Canva</div>
                  <div>▪ Mailchimp</div>
                  <div>▪ Hootsuite</div>
                  <div>▪ Microsoft Office</div>
                  <div>▪ WordPress</div>
                </div>
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[6px] text-blue-900 uppercase mb-1">Languages</div>
                <div className="space-y-0.5 text-[4.2px]">
                  <div>English – Fluent</div>
                  <div>Swahili – Fluent</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[6px] text-blue-900 uppercase mb-1">Referees</div>
                <div className="text-[4.2px] italic">Available upon request.</div>
              </div>
            </div>
            
            {/* Right Main Content */}
            <div className="flex-1 p-2">
              {/* Header */}
              <div className="border-b border-blue-600 pb-1 mb-1.5">
                <div className="font-bold text-[9px] mb-1">GRACE WANJIKU NJOROGE</div>
                <div className="text-[6.5px] text-blue-700 font-medium mb-1">Digital Marketing Specialist</div>
                <div className="text-[4px] text-gray-600 space-y-0.5">
                  <div>📍 Nairobi, Kenya 📞 +254 723 456 789</div>
                  <div>✉ grace.njoroge@email.com</div>
                  <div>🔗 linkedin.com/in/grace-njoroge</div>
                </div>
              </div>
              
              {/* Professional Profile */}
              <div className="mb-1.5">
                <div className="font-bold text-[6px] text-blue-900 uppercase mb-1">Professional Profile</div>
                <div className="text-[4.2px] text-gray-700">Results-driven digital marketing specialist with over 6 years of experience developing and executing marketing campaigns that increase brand visibility and drive customer engagement. Skilled in digital strategy, social media management, and marketing analytics.</div>
              </div>
              
              {/* Experience */}
              <div className="mb-1.5">
                <div className="font-bold text-[6px] text-blue-900 uppercase mb-1">Professional Experience</div>
                <div className="mb-1">
                  <div className="font-bold text-[4.2px]">Digital Marketing Officer</div>
                  <div className="text-[4.2px] text-blue-700 font-medium">BrightWave Communications Ltd – Nairobi</div>
                  <div className="text-[3.8px] text-gray-500 italic mb-0.5">April 2021 – Present</div>
                  <div className="space-y-0.5 text-[4.2px]">
                    <div>▪ Develop and execute digital marketing campaigns</div>
                    <div>▪ Increased social media engagement by 45%</div>
                    <div>▪ Analyze campaign performance and prepare reports</div>
                    <div>▪ Coordinate content production and brand messaging</div>
                  </div>
                </div>
                <div className="mb-1">
                  <div className="font-bold text-[4.2px]">Marketing Assistant</div>
                  <div className="text-[4.2px] text-blue-700 font-medium">Skyline Retail Group – Nairobi</div>
                  <div className="text-[3.8px] text-gray-500 italic mb-0.5">Jan 2019 – Mar 2021</div>
                  <div className="space-y-0.5 text-[4.2px]">
                    <div>▪ Assisted with promotional campaigns and events</div>
                    <div>▪ Managed customer engagement on social media</div>
                    <div>▪ Supported market research and competitor analysis</div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-[4.2px]">Marketing Intern</div>
                  <div className="text-[4.2px] text-blue-700 font-medium">Creative Hub Agency – Nairobi</div>
                  <div className="text-[3.8px] text-gray-500 italic mb-0.5">Jun 2018 – Dec 2018</div>
                  <div className="space-y-0.5 text-[4.2px]">
                    <div>▪ Assisted in social media content creation</div>
                    <div>▪ Conducted market research and data analysis</div>
                  </div>
                </div>
              </div>
              
              {/* Education */}
              <div className="mb-1.5">
                <div className="font-bold text-[6px] text-blue-900 uppercase mb-1">Education</div>
                <div className="mb-1">
                  <div className="font-bold text-[4.2px]">Bachelor of Commerce (Marketing Option)</div>
                  <div className="text-[4.2px]">Kenyatta University</div>
                  <div className="text-[3.8px] text-gray-500 italic">2014 – 2018</div>
                </div>
                <div className="mb-1">
                  <div className="font-bold text-[4.2px]">Diploma in Marketing</div>
                  <div className="text-[4.2px]">Kenya Institute of Marketing</div>
                  <div className="text-[3.8px] text-gray-500 italic">2012 – 2014</div>
                </div>
                <div>
                  <div className="font-bold text-[4.2px]">Kenya Certificate of Secondary Education</div>
                  <div className="text-[4.2px]">Alliance Girls High School</div>
                  <div className="text-[3.8px] text-gray-500 italic">2010 – 2013</div>
                </div>
              </div>
              
              {/* Certifications */}
              <div className="mb-1.5">
                <div className="font-bold text-[6px] text-blue-900 uppercase mb-1">Certifications</div>
                <div className="space-y-0.5 text-[4.2px]">
                  <div>▪ Digital Marketing – Google (2022)</div>
                  <div>▪ Content Marketing – HubSpot (2021)</div>
                  <div>▪ Social Media Marketing – Meta (2020)</div>
                </div>
              </div>
              
              {/* Achievements */}
              <div>
                <div className="font-bold text-[6px] text-blue-900 uppercase mb-1">Professional Achievements</div>
                <div className="space-y-0.5 text-[4.2px]">
                  <div>▪ Increased social media engagement by 45% in 12 months</div>
                  <div>▪ Successfully launched 20+ digital campaigns with 95% success rate</div>
                  <div>▪ Grew email subscriber base from 5,000 to 15,000 in 18 months</div>
                  <div>▪ Achieved 30% increase in website traffic through SEO optimization</div>
                  <div>▪ Won Best Digital Campaign Award at Kenya Marketing Awards 2023</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'Executive Leadership':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded overflow-hidden text-[5px] leading-[1.3]">
            {/* Header */}
            <div className="border-b border-gray-900 pb-1 mb-1.5 px-2 pt-2">
              <div className="font-bold text-[10px] mb-1">DAVID OCHIENG OTIENO</div>
              <div className="text-[7.5px] text-gray-700 mb-1">Chief Operations Officer (COO)</div>
              <div className="text-[4.2px] text-gray-600">
                Nairobi, Kenya • +254 711 234 567 • david.otieno@email.com • linkedin.com/in/david-otieno
              </div>
            </div>
            
            <div className="px-2">
              {/* Leadership Profile */}
              <div className="mb-1.5">
                <div className="font-bold text-[6.5px] uppercase mb-1">Leadership Profile</div>
                <div className="text-[4.5px] text-gray-700">Strategic operations executive with over 15 years of leadership experience driving operational efficiency, business growth, and organizational transformation across East Africa.</div>
              </div>
              
              {/* Key Achievements */}
              <div className="mb-1.5">
                <div className="font-bold text-[6.5px] uppercase mb-1">Key Leadership Achievements</div>
                <div className="space-y-0.5 text-[4.5px]">
                  <div>▪ Led operational restructuring reducing costs by 28% within two years</div>
                  <div>▪ Oversaw expansion into three East African markets</div>
                  <div>▪ Implemented digital transformation improving efficiency by 35%</div>
                  <div>▪ Managed cross-functional teams of over 250 employees</div>
                  <div>▪ Achieved 40% revenue growth through strategic initiatives</div>
                </div>
              </div>
              
              {/* Experience */}
              <div className="mb-1.5">
                <div className="font-bold text-[6.5px] uppercase mb-1">Strategic Leadership Experience</div>
                <div className="mb-1">
                  <div className="font-semibold text-[4.5px]">Chief Operations Officer</div>
                  <div className="text-[4.5px] text-gray-700">EastAfrica Logistics Group — Nairobi</div>
                  <div className="text-[4px] text-gray-500 italic mb-0.5">2019 – Present</div>
                  <div className="space-y-0.5 text-[4.5px]">
                    <div>• Lead operational strategy for regional company with 300+ staff</div>
                    <div>• Drive business growth and operational excellence initiatives</div>
                    <div>• Implement performance improvement across supply chain</div>
                  </div>
                </div>
                <div className="mb-1">
                  <div className="font-semibold text-[4.5px]">Operations Director</div>
                  <div className="text-[4.5px] text-gray-700">TransGlobal Supply Chain Ltd — Nairobi</div>
                  <div className="text-[4px] text-gray-500 italic mb-0.5">2015 – 2019</div>
                  <div className="space-y-0.5 text-[4.5px]">
                    <div>• Managed nationwide logistics and distribution network</div>
                    <div>• Introduced automation improving efficiency by 22%</div>
                    <div>• Led strategic planning and operational budgeting</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-[4.5px]">Regional Operations Manager</div>
                  <div className="text-[4.5px] text-gray-700">Kenya Freight Services — Nairobi</div>
                  <div className="text-[4px] text-gray-500 italic mb-0.5">2011 – 2015</div>
                  <div className="space-y-0.5 text-[4.5px]">
                    <div>• Oversaw operations for 5 regional branches</div>
                    <div>• Reduced operational costs by 18% through process optimization</div>
                  </div>
                </div>
              </div>
              
              {/* Board Memberships */}
              <div className="mb-1.5">
                <div className="font-bold text-[6.5px] uppercase mb-1">Board Memberships</div>
                <div className="space-y-0.5 text-[4.5px]">
                  <div>• Board Member — Kenya Transport & Logistics Association</div>
                  <div>• Advisory Board — East Africa Supply Chain Council</div>
                  <div>• Board Member — Kenya Institute of Supply Management</div>
                </div>
              </div>
              
              {/* Strategic Initiatives */}
              <div className="mb-1.5">
                <div className="font-bold text-[6.5px] uppercase mb-1">Strategic Initiatives</div>
                <div className="space-y-0.5 text-[4.5px]">
                  <div>• Digital transformation program across all operations</div>
                  <div>• Regional expansion strategy into Tanzania and Uganda</div>
                  <div>• Sustainability initiative reducing carbon footprint by 30%</div>
                </div>
              </div>
              
              {/* Education */}
              <div className="mb-1.5">
                <div className="font-bold text-[6.5px] uppercase mb-1">Education</div>
                <div className="mb-1">
                  <div className="font-semibold text-[4.5px]">Master of Business Administration (MBA)</div>
                  <div className="text-[4.5px]">Strathmore Business School</div>
                  <div className="text-[4px] text-gray-500 italic">2012 – 2014</div>
                </div>
                <div className="mb-1">
                  <div className="font-semibold text-[4.5px]">Bachelor of Commerce (Operations Management)</div>
                  <div className="text-[4.5px]">University of Nairobi</div>
                  <div className="text-[4px] text-gray-500 italic">2004 – 2008</div>
                </div>
                <div>
                  <div className="font-semibold text-[4.5px]">Diploma in Business Management</div>
                  <div className="text-[4.5px]">Kenya Institute of Management</div>
                  <div className="text-[4px] text-gray-500 italic">2002 – 2004</div>
                </div>
              </div>
              
              {/* Certifications */}
              <div>
                <div className="font-bold text-[6.5px] uppercase mb-1">Certifications</div>
                <div className="space-y-0.5 text-[4.5px]">
                  <div>• Certified Supply Chain Professional (CSCP)</div>
                  <div>• Strategic Leadership — Harvard Business School</div>
                  <div>• Project Management Professional (PMP)</div>
                </div>
              </div>
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

  return (
    <div className="space-y-2">
      {renderPreview()}
      {showDescription && templateDescriptions[templateName] && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {templateDescriptions[templateName]}
        </p>
      )}
    </div>
  );
}
