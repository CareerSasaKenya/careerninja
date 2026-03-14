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
  'Executive Leadership': 'A premium serif layout emphasizing leadership achievements and strategic impact. Perfect for directors, CEOs, and senior management.',
  'Graduate Starter CV': 'Education-focused layout prioritizing academic projects, internships, and extracurricular activities. Perfect for fresh graduates and students.',
  'Skills-Based (Functional)': 'Emphasizes skills and competencies over chronological work history. Perfect for career changers, candidates with employment gaps, or those with strong transferable skills.',
  'Internship / Industrial Attachment': 'Student-focused template emphasizing education, technical skills, and potential. Perfect for students seeking industrial attachment or internship opportunities.',
  'Creative Portfolio': 'Eye-catching template with bold sidebar design showcasing portfolio projects prominently. Perfect for graphic designers, UI/UX designers, photographers, and creative professionals.'
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
      
      case 'Graduate Starter CV':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded p-2 text-[5.5px] leading-[1.35] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="border-b border-gray-300 pb-1 mb-1.5">
              <div className="font-bold text-[9px] text-gray-900">BRIAN KIPRONO CHEBET</div>
              <div className="text-[6px] text-gray-700 mt-0.5">Recent Graduate – Mechanical Engineering</div>
              <div className="text-[4.5px] text-gray-600 mt-0.5">
                Nakuru, Kenya | +254 712 987 654 | brian.chebet@email.com | linkedin.com/in/brian-chebet
              </div>
            </div>
            
            {/* Career Objective */}
            <div className="mb-1.5">
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Career Objective</div>
              <div className="text-[4.8px] text-gray-700">Motivated mechanical engineering graduate seeking an entry-level engineering role where I can apply technical knowledge, problem-solving skills, and hands-on experience to contribute to innovative engineering solutions.</div>
            </div>
            
            {/* Education */}
            <div className="mb-1.5">
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Education</div>
              <div className="text-[4.8px] mb-1">
                <div className="font-semibold text-gray-900">Bachelor of Science in Mechanical Engineering</div>
                <div className="text-gray-700">Jomo Kenyatta University of Agriculture and Technology</div>
                <div className="text-gray-500 text-[4.2px]">2019 – 2023 | Second Class Honours (Upper Division)</div>
              </div>
              <div className="text-[4.8px]">
                <div className="font-semibold text-gray-900">Kenya Certificate of Secondary Education</div>
                <div className="text-gray-700">Nakuru High School</div>
                <div className="text-gray-500 text-[4.2px]">2015 – 2018 | Grade A-</div>
              </div>
            </div>
            
            {/* Academic Projects */}
            <div className="mb-1.5">
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Academic Projects</div>
              <div className="mb-1">
                <div className="font-semibold text-[4.8px] text-gray-900">Automated Irrigation System</div>
                <div className="text-[4.2px] text-gray-500 mb-0.5">Final Year Project – 2023</div>
                <div className="text-[4.8px] text-gray-700">Designed and built an automated irrigation system using sensors to regulate water flow based on soil moisture levels. Achieved 40% water savings in test trials.</div>
              </div>
              <div>
                <div className="font-semibold text-[4.8px] text-gray-900">Solar Water Heater Design</div>
                <div className="text-[4.2px] text-gray-500 mb-0.5">Third Year Project – 2022</div>
                <div className="text-[4.8px] text-gray-700">Developed a prototype solar-powered water heater aimed at improving energy efficiency in rural households. Presented at university innovation fair.</div>
              </div>
            </div>
            
            {/* Internship */}
            <div className="mb-1.5">
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Internship / Industrial Attachment</div>
              <div>
                <div className="font-semibold text-[4.8px] text-gray-900">Engineering Intern — KenGen</div>
                <div className="text-[4.2px] text-gray-500 mb-0.5">Naivasha | May 2022 – Aug 2022</div>
                <div className="space-y-0.5 text-[4.8px]">
                  <div>• Assisted engineers with maintenance and inspection of turbine systems</div>
                  <div>• Participated in safety audits and plant operations monitoring</div>
                  <div>• Prepared technical reports on equipment performance</div>
                  <div>• Gained hands-on experience with geothermal power generation</div>
                </div>
              </div>
            </div>
            
            {/* Skills */}
            <div className="mb-1.5">
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Key Skills</div>
              <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[4.8px]">
                <div>• AutoCAD & SolidWorks</div>
                <div>• Microsoft Excel & Word</div>
                <div>• Engineering Drawing</div>
                <div>• Team Collaboration</div>
                <div>• Technical Problem Solving</div>
                <div>• Technical Report Writing</div>
                <div>• MATLAB Programming</div>
                <div>• Project Management</div>
              </div>
            </div>
            
            {/* Extracurricular */}
            <div className="mb-1.5">
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Extracurricular Activities</div>
              <div className="space-y-0.5 text-[4.8px]">
                <div>• Member – Engineering Students Association (2020-2023)</div>
                <div>• Volunteer – Community STEM Mentorship Program</div>
                <div>• Participant – National Engineering Innovation Competition 2022</div>
              </div>
            </div>
            
            {/* Referees */}
            <div>
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Referees</div>
              <div className="text-[4.8px] text-gray-700">Available upon request.</div>
            </div>
          </div>
        );
      
      case 'Skills-Based (Functional)':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded p-2 text-[5.5px] leading-[1.35] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="border-b-2 border-gray-300 pb-1 mb-1.5">
              <div className="font-bold text-[9px] text-gray-900">MARY ACHIENG ODHIAMBO</div>
              <div className="text-[6px] text-blue-700 font-medium mt-0.5">Customer Service Specialist</div>
              <div className="flex flex-wrap gap-x-1 text-[4.5px] text-gray-600 mt-0.5">
                <span>📍 Kisumu, Kenya</span>
                <span>📞 +254 710 234 567</span>
                <span>✉ mary.odhiambo@email.com</span>
                <span>🔗 linkedin.com/in/mary-odhiambo</span>
              </div>
            </div>
            
            {/* Professional Summary */}
            <div className="mb-1.5">
              <div className="font-bold text-[6px] text-gray-900 uppercase border-b border-gray-300 pb-0.5 mb-0.5">Professional Summary</div>
              <div className="text-[4.8px] text-gray-700">Customer-focused professional with strong communication and problem-solving skills developed through experience in retail, community service, and administrative roles. Proven ability to build positive relationships and deliver excellent service.</div>
            </div>
            
            {/* Core Competencies */}
            <div className="mb-1.5">
              <div className="font-bold text-[6px] text-gray-900 uppercase border-b border-gray-300 pb-0.5 mb-0.5">Core Competencies</div>
              <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                <div className="flex items-start text-[4.8px]">
                  <span className="text-blue-600 mr-0.5">▪</span>
                  <span>Customer Support</span>
                </div>
                <div className="flex items-start text-[4.8px]">
                  <span className="text-blue-600 mr-0.5">▪</span>
                  <span>Communication</span>
                </div>
                <div className="flex items-start text-[4.8px]">
                  <span className="text-blue-600 mr-0.5">▪</span>
                  <span>Conflict Resolution</span>
                </div>
                <div className="flex items-start text-[4.8px]">
                  <span className="text-blue-600 mr-0.5">▪</span>
                  <span>Team Collaboration</span>
                </div>
                <div className="flex items-start text-[4.8px]">
                  <span className="text-blue-600 mr-0.5">▪</span>
                  <span>Problem Solving</span>
                </div>
                <div className="flex items-start text-[4.8px]">
                  <span className="text-blue-600 mr-0.5">▪</span>
                  <span>Data Entry & MS Office</span>
                </div>
              </div>
            </div>
            
            {/* Professional Skills */}
            <div className="mb-1.5">
              <div className="font-bold text-[6px] text-gray-900 uppercase border-b border-gray-300 pb-0.5 mb-0.5">Professional Skills</div>
              <div className="space-y-1">
                <div>
                  <div className="text-[4.8px] font-bold text-blue-700">Customer Service Skills</div>
                  <div className="space-y-0.5 ml-1 text-[4.5px]">
                    <div className="flex items-start">
                      <span className="text-gray-400 mr-0.5">•</span>
                      <span>Handling customer inquiries and complaints professionally</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-400 mr-0.5">•</span>
                      <span>Providing accurate product information and recommendations</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-400 mr-0.5">•</span>
                      <span>Building rapport and maintaining customer relationships</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[4.8px] font-bold text-blue-700">Administrative Skills</div>
                  <div className="space-y-0.5 ml-1 text-[4.5px]">
                    <div className="flex items-start">
                      <span className="text-gray-400 mr-0.5">•</span>
                      <span>Document management and filing systems</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-400 mr-0.5">•</span>
                      <span>Data entry and reporting with high accuracy</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-400 mr-0.5">•</span>
                      <span>Scheduling and calendar management</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Work Experience */}
            <div className="mb-1.5">
              <div className="font-bold text-[6px] text-gray-900 uppercase border-b border-gray-300 pb-0.5 mb-0.5">Relevant Work Experience</div>
              <div className="space-y-0.5 text-[4.8px]">
                <div>
                  <span className="font-semibold">Retail Assistant</span>
                  <span className="text-gray-600"> — QuickMart Supermarket, Kisumu</span>
                  <span className="text-gray-500 italic"> (2021 – 2023)</span>
                </div>
                <div>
                  <span className="font-semibold">Volunteer Admin Assistant</span>
                  <span className="text-gray-600"> — Community Development Initiative</span>
                  <span className="text-gray-500 italic"> (2020 – 2021)</span>
                </div>
                <div>
                  <span className="font-semibold">Sales Intern</span>
                  <span className="text-gray-600"> — Tuskys Supermarket, Kisumu</span>
                  <span className="text-gray-500 italic"> (2019 – 2020)</span>
                </div>
              </div>
            </div>
            
            {/* Education */}
            <div className="mb-1.5">
              <div className="font-bold text-[6px] text-gray-900 uppercase border-b border-gray-300 pb-0.5 mb-0.5">Education</div>
              <div className="text-[4.8px] mb-1">
                <div className="font-semibold">Diploma in Business Administration</div>
                <div className="text-gray-700">Kisumu National Polytechnic</div>
                <div className="text-[4.2px] text-gray-500 italic">2018 – 2020 | Credit Pass</div>
              </div>
              <div className="text-[4.8px]">
                <div className="font-semibold">Kenya Certificate of Secondary Education</div>
                <div className="text-gray-700">Kisumu Girls High School</div>
                <div className="text-[4.2px] text-gray-500 italic">2014 – 2017 | Grade C+</div>
              </div>
            </div>
            
            {/* Certifications */}
            <div className="mb-1.5">
              <div className="font-bold text-[6px] text-gray-900 uppercase border-b border-gray-300 pb-0.5 mb-0.5">Certifications</div>
              <div className="space-y-0.5 text-[4.8px]">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-0.5">✓</span>
                  <span>Customer Service Excellence – Alison (2022)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-0.5">✓</span>
                  <span>Basic Computer Applications – Kenya ICT Board (2020)</span>
                </div>
              </div>
            </div>
            
            {/* Referees */}
            <div>
              <div className="font-bold text-[6px] text-gray-900 uppercase border-b border-gray-300 pb-0.5 mb-0.5">Referees</div>
              <div className="text-[4.8px] text-gray-700">Available upon request.</div>
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
      
      case 'Internship / Industrial Attachment':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded p-2 text-[5.5px] leading-[1.35] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="border-b border-gray-800 pb-1 mb-1.5">
              <div className="font-bold text-[9px] text-gray-900">KEVIN MUTUA MULI</div>
              <div className="text-[6px] text-gray-700 mt-0.5">Student – Diploma in Electrical Engineering</div>
              <div className="text-[4.5px] text-gray-600 mt-0.5">
                Machakos, Kenya | +254 712 345 901 | kevin.mutua@email.com | linkedin.com/in/kevin-mutua
              </div>
            </div>
            
            {/* Career Objective */}
            <div className="mb-1.5">
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Career Objective</div>
              <div className="text-[4.8px] text-gray-700">Motivated electrical engineering student seeking an industrial attachment opportunity to gain hands-on experience in electrical systems, maintenance, and engineering operations while applying classroom knowledge to real-world challenges.</div>
            </div>
            
            {/* Education */}
            <div className="mb-1.5">
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Education</div>
              <div className="text-[4.8px] mb-1">
                <div className="font-semibold text-gray-900">Diploma in Electrical and Electronic Engineering</div>
                <div className="text-gray-700">Machakos Technical Institute</div>
                <div className="text-gray-500 text-[4.2px]">2022 – Present | Current GPA: 3.5/4.0</div>
              </div>
              <div className="text-[4.8px]">
                <div className="font-semibold text-gray-900">Kenya Certificate of Secondary Education</div>
                <div className="text-gray-700">Machakos Boys High School</div>
                <div className="text-gray-500 text-[4.2px]">2018 – 2021 | Grade B+</div>
              </div>
            </div>
            
            {/* Technical Skills */}
            <div className="mb-1.5">
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Technical Skills</div>
              <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[4.8px]">
                <div>• Electrical Installation</div>
                <div>• Circuit Analysis</div>
                <div>• Basic PLC Programming</div>
                <div>• Electrical Safety Procedures</div>
                <div>• Technical Drawing</div>
                <div>• Microsoft Office Suite</div>
                <div>• Wiring & Troubleshooting</div>
                <div>• Equipment Maintenance</div>
              </div>
            </div>
            
            {/* Academic Projects */}
            <div className="mb-1.5">
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Academic Projects</div>
              <div className="mb-1">
                <div className="font-semibold text-[4.8px] text-gray-900">Automatic Street Lighting System</div>
                <div className="text-[4.2px] text-gray-500 mb-0.5">Final Year Project – 2023</div>
                <div className="text-[4.8px] text-gray-700">Designed a light-dependent resistor system that automatically switches street lights on and off based on ambient light. Reduced energy consumption by 35% in test environment.</div>
              </div>
              <div>
                <div className="font-semibold text-[4.8px] text-gray-900">Home Electrical Wiring Simulation</div>
                <div className="text-[4.2px] text-gray-500 mb-0.5">Second Year Project – 2023</div>
                <div className="text-[4.8px] text-gray-700">Created a complete residential wiring diagram and simulation demonstrating proper electrical installation standards and safety protocols.</div>
              </div>
            </div>
            
            {/* Industrial Attachment */}
            <div className="mb-1.5">
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Industrial Attachment</div>
              <div>
                <div className="font-semibold text-[4.8px] text-gray-900">Industrial Attachment Trainee — Kenya Power</div>
                <div className="text-[4.2px] text-gray-500 mb-0.5">Machakos | May 2024 – Aug 2024</div>
                <div className="space-y-0.5 text-[4.8px]">
                  <div>• Assisted technicians with electrical line inspection and maintenance</div>
                  <div>• Observed transformer servicing procedures and safety protocols</div>
                  <div>• Participated in installation of electrical wiring systems</div>
                  <div>• Learned meter reading and customer service procedures</div>
                </div>
              </div>
            </div>
            
            {/* Extracurricular Activities */}
            <div className="mb-1.5">
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Extracurricular Activities</div>
              <div className="space-y-0.5 text-[4.8px]">
                <div>• Member – Engineering Students Association (2022-Present)</div>
                <div>• Volunteer – Local Community Electrical Repairs Initiative</div>
                <div>• Participant – Technical Skills Competition 2023</div>
              </div>
            </div>
            
            {/* Referees */}
            <div>
              <div className="font-semibold text-[6px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Referees</div>
              <div className="text-[4.8px] text-gray-700">Available upon request.</div>
            </div>
          </div>
        );
      
      case 'Creative Portfolio':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded overflow-hidden flex text-[4.5px] leading-[1.3]">
            {/* Left Sidebar */}
            <div className="w-[33%] bg-indigo-600 text-white p-2">
              <div className="font-bold text-[7px] mb-1">BRIAN MWANGI KIMANI</div>
              <div className="text-[5px] opacity-90 mb-1.5">Graphic Designer | Brand Identity</div>
              
              <div className="text-[4px] mb-1.5 space-y-0.5">
                <div>📍 Nairobi, Kenya</div>
                <div>📞 +254 712 567 890</div>
                <div>✉ brian.kimani@email.com</div>
                <div>🌐 briankimani.design</div>
              </div>
              
              <div className="mb-1.5">
                <div className="font-semibold text-[5px] mb-1">Core Skills</div>
                <div className="space-y-0.5 text-[4px]">
                  <div>• Brand Identity Design</div>
                  <div>• Logo Design</div>
                  <div>• Typography</div>
                  <div>• Social Media Graphics</div>
                  <div>• Illustration</div>
                  <div>• Visual Storytelling</div>
                  <div>• Print Design</div>
                  <div>• Digital Marketing</div>
                </div>
              </div>
              
              <div className="mb-1.5">
                <div className="font-semibold text-[5px] mb-1">Design Tools</div>
                <div className="space-y-0.5 text-[4px]">
                  <div>• Adobe Photoshop</div>
                  <div>• Adobe Illustrator</div>
                  <div>• Figma</div>
                  <div>• Canva</div>
                  <div>• After Effects</div>
                  <div>• InDesign</div>
                  <div>• Sketch</div>
                </div>
              </div>
              
              <div>
                <div className="font-semibold text-[5px] mb-1">Languages</div>
                <div className="space-y-0.5 text-[4px]">
                  <div>• English - Fluent</div>
                  <div>• Swahili - Native</div>
                </div>
              </div>
            </div>
            
            {/* Right Main Content */}
            <div className="flex-1 p-2">
              {/* Creative Profile */}
              <div className="mb-1.5">
                <div className="font-semibold text-[5.5px] border-b-2 border-indigo-600 pb-0.5 mb-1">Creative Profile</div>
                <div className="text-[4px] text-gray-700">Creative graphic designer with over 5 years of experience creating brand identities, digital marketing visuals, and social media campaigns. Passionate about crafting designs that communicate brand stories effectively and resonate with target audiences.</div>
              </div>
              
              {/* Portfolio Projects */}
              <div className="mb-1.5">
                <div className="font-semibold text-[5.5px] border-b-2 border-indigo-600 pb-0.5 mb-1">Portfolio Projects</div>
                <div className="space-y-1">
                  <div>
                    <div className="font-semibold text-[4px]">Brand Identity – Nairobi Coffee Co.</div>
                    <div className="text-[3.5px] text-gray-500">Nairobi Coffee Co. | 2024</div>
                    <div className="text-[4px]">Designed full brand identity including logo, packaging, and social media visuals for local coffee startup. Created warm, approachable brand celebrating Kenyan coffee culture.</div>
                  </div>
                  <div>
                    <div className="font-semibold text-[4px]">Digital Campaign Graphics</div>
                    <div className="text-[3.5px] text-gray-500">Safaricom SME Campaign | 2023</div>
                    <div className="text-[4px]">Created marketing graphics used across social media ads and digital platforms. Developed over 50 unique assets increasing engagement by 40%.</div>
                  </div>
                  <div>
                    <div className="font-semibold text-[4px]">E-commerce Website Design</div>
                    <div className="text-[3.5px] text-gray-500">Zuri Fashion Boutique | 2023</div>
                    <div className="text-[4px]">Designed complete UI/UX for online fashion store including product photography direction and promotional materials.</div>
                  </div>
                </div>
              </div>
              
              {/* Work Experience */}
              <div className="mb-1.5">
                <div className="font-semibold text-[5.5px] border-b-2 border-indigo-600 pb-0.5 mb-1">Work Experience</div>
                <div className="space-y-1">
                  <div>
                    <div className="font-semibold text-[4px]">Senior Graphic Designer — Creative Edge Agency</div>
                    <div className="text-[3.5px] text-gray-500">Nairobi | 2022 – Present</div>
                  </div>
                  <div>
                    <div className="font-semibold text-[4px]">Graphic Designer — Pixel Studio</div>
                    <div className="text-[3.5px] text-gray-500">Nairobi | 2020 – 2022</div>
                  </div>
                  <div>
                    <div className="font-semibold text-[4px]">Junior Designer — Design Hub Kenya</div>
                    <div className="text-[3.5px] text-gray-500">Nairobi | 2019 – 2020</div>
                  </div>
                </div>
              </div>
              
              {/* Education */}
              <div className="mb-1.5">
                <div className="font-semibold text-[5.5px] border-b-2 border-indigo-600 pb-0.5 mb-1">Education</div>
                <div>
                  <div className="font-semibold text-[4px]">Diploma in Graphic Design</div>
                  <div className="text-[4px]">Nairobi Institute of Technology</div>
                  <div className="text-[3.5px] text-gray-500">2017 – 2019</div>
                </div>
              </div>
              
              {/* Awards */}
              <div>
                <div className="font-semibold text-[5.5px] border-b-2 border-indigo-600 pb-0.5 mb-1">Awards & Recognition</div>
                <div className="space-y-0.5 text-[4px]">
                  <div>• Best Brand Identity - Kenya Design Awards 2023</div>
                  <div>• Creative Excellence Award - Nairobi Creative Week 2022</div>
                </div>
              </div>
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
