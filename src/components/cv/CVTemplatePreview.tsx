/**
 * CV Template Preview Component
 * Renders a thumbnail preview of CV templates with full content
 */

import React from 'react';

interface CVTemplatePreviewProps {
  templateName: string;
  showDescription?: boolean;
  descriptionOnly?: boolean;
}

const templateDescriptions: Record<string, string> = {
  'Classic Professional': 'A clean, ATS-friendly single-column layout perfect for entry to mid-level professionals.',
  'Modern Professional': 'A stylized two-column design with blue accents. Ideal for corporate roles and marketing positions.',
  'Executive Leadership': 'A premium layout emphasizing leadership achievements. Perfect for directors, CEOs, and senior management.',
  'Graduate Starter CV': 'Education-focused layout for fresh graduates and students.',
  'Skills-Based (Functional)': 'Emphasizes skills over chronological history. Perfect for career changers.',
  'Internship / Industrial Attachment': 'Student-focused template for industrial attachment or internship opportunities.',
  'Creative Portfolio': 'Bold sidebar design showcasing portfolio projects. Perfect for designers and creative professionals.',
  'Digital Professional': 'Tech-focused template with dark sidebar. Perfect for developers and IT professionals.',
  'Personal Brand CV': 'For professionals whose reputation matters. Highlights tagline, online presence, and speaking engagements.',
  'Academic / Research CV': 'Serif layout for academics, researchers, and PhD applicants.',
  'Technical / Engineering CV': 'Two-column layout highlighting engineering projects and technical skills.',
  'International / ATS Optimized CV': 'Plain-text-friendly CV built to pass Applicant Tracking Systems. Essential for international and remote roles.',
};

// Inline SVG avatar — African male (dark skin, short hair)
const MaleAvatar = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#e8d5c4" />
    <ellipse cx="50" cy="38" rx="18" ry="20" fill="#5c3317" />
    <rect x="32" y="28" width="36" height="14" rx="7" fill="#2c1a0e" />
    <ellipse cx="50" cy="55" rx="22" ry="18" fill="#5c3317" />
    <ellipse cx="50" cy="80" rx="30" ry="22" fill="#3a5a8c" />
  </svg>
);

// Inline SVG avatar — African female (dark skin, long hair)
const FemaleAvatar = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#e8d5c4" />
    <ellipse cx="50" cy="38" rx="18" ry="22" fill="#5c3317" />
    <ellipse cx="32" cy="45" rx="6" ry="18" fill="#2c1a0e" />
    <ellipse cx="68" cy="45" rx="6" ry="18" fill="#2c1a0e" />
    <rect x="32" y="20" width="36" height="20" rx="10" fill="#2c1a0e" />
    <ellipse cx="50" cy="55" rx="22" ry="18" fill="#5c3317" />
    <ellipse cx="50" cy="80" rx="30" ry="22" fill="#c2185b" />
  </svg>
);

export default function CVTemplatePreview({ templateName, showDescription = false, descriptionOnly = false }: CVTemplatePreviewProps) {
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
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded p-3 text-[4px] leading-[1.4] overflow-hidden shadow-sm">
            <div className="border-b border-gray-800 pb-1.5 mb-1.5">
              <div className="flex items-start gap-1.5 mb-0.5">
                <MaleAvatar className="w-7 h-7 rounded-full flex-shrink-0" />
                <div>
                  <div className="font-bold text-[7px]">JOHN MWANGI KARIUKI</div>
                  <div className="text-[5px] text-gray-700">Administrative Officer</div>
                  <div className="text-[3.5px] text-gray-600 mt-0.5">Nairobi, Kenya | +254 712 345 678 | johnmwangi@email.com</div>
                </div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-bold text-[4.5px] uppercase border-b border-gray-300 mb-0.5">Professional Summary</div>
              <div className="text-[3.5px] text-gray-700">Results-driven administrative professional with 5+ years supporting organizational efficiency and office coordination.</div>
            </div>
            <div className="mb-1">
              <div className="font-bold text-[4.5px] uppercase border-b border-gray-300 mb-0.5">Key Skills</div>
              <div className="grid grid-cols-2 gap-x-2 text-[3.5px]">
                <div>- Office Administration</div><div>- Records Management</div>
                <div>- Customer Service</div><div>- Scheduling</div>
                <div>- Report Preparation</div><div>- Microsoft Office</div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-bold text-[4.5px] uppercase border-b border-gray-300 mb-0.5">Professional Experience</div>
              <div className="text-[3.5px] mb-0.5">
                <div className="font-semibold">Administrative Officer — ABC Logistics Ltd, Nairobi</div>
                <div className="text-gray-500 italic">March 2021 - Present</div>
                <div>- Coordinate daily office operations and administrative activities</div>
                <div>- Prepare reports, meeting minutes, and official correspondence</div>
                <div>- Manage document filing systems and maintain accurate records</div>
              </div>
              <div className="text-[3.5px] mb-0.5">
                <div className="font-semibold">Office Assistant — Greenfield Solutions Ltd, Nairobi</div>
                <div className="text-gray-500 italic">Jan 2019 - Feb 2021</div>
                <div>- Supported administrative tasks including data entry and scheduling</div>
                <div>- Managed incoming calls, emails, and office correspondence</div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-bold text-[4.5px] uppercase border-b border-gray-300 mb-0.5">Education</div>
              <div className="text-[3.5px]">
                <div className="font-semibold">Bachelor of Business Administration — University of Nairobi</div>
                <div className="text-gray-500 italic">2014 - 2018</div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-bold text-[4.5px] uppercase border-b border-gray-300 mb-0.5">Certifications</div>
              <div className="text-[3.5px]">
                <div>- Certificate in Project Management — KIM 2020</div>
                <div>- Advanced Microsoft Excel — Strathmore 2019</div>
              </div>
            </div>
            <div>
              <div className="font-bold text-[4.5px] uppercase border-b border-gray-300 mb-0.5">Referees</div>
              <div className="text-[3.5px] italic">Available upon request.</div>
            </div>
          </div>
        );

      case 'Modern Professional':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded overflow-hidden flex text-[3.5px] leading-[1.3]">
            <div className="w-[35%] bg-blue-50 p-2">
              <div className="flex justify-center mb-1.5">
                <FemaleAvatar className="w-8 h-8 rounded-full" />
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[5px] text-blue-900 uppercase mb-0.5">Key Skills</div>
                <div className="space-y-0.5 text-[3.5px]">
                  <div>- Digital Marketing Strategy</div>
                  <div>- Social Media Management</div>
                  <div>- Content Marketing</div>
                  <div>- SEO Optimization</div>
                  <div>- Campaign Analytics</div>
                  <div>- Brand Communication</div>
                </div>
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[5px] text-blue-900 uppercase mb-0.5">Tools</div>
                <div className="space-y-0.5 text-[3.5px]">
                  <div>- Google Analytics</div>
                  <div>- Meta Ads Manager</div>
                  <div>- Canva / Mailchimp</div>
                  <div>- Hootsuite</div>
                </div>
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[5px] text-blue-900 uppercase mb-0.5">Languages</div>
                <div className="text-[3.5px]"><div>English - Fluent</div><div>Swahili - Fluent</div></div>
              </div>
              <div>
                <div className="font-bold text-[5px] text-blue-900 uppercase mb-0.5">Referees</div>
                <div className="text-[3.5px] italic">Available upon request.</div>
              </div>
            </div>
            <div className="flex-1 p-2">
              <div className="border-b border-blue-600 pb-1 mb-1">
                <div className="font-bold text-[8px]">GRACE WANJIKU NJOROGE</div>
                <div className="text-[5.5px] text-blue-700 font-medium">Digital Marketing Specialist</div>
                <div className="text-[3.5px] text-gray-600">Nairobi, Kenya | +254 723 456 789 | grace.njoroge@email.com</div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] text-blue-900 uppercase mb-0.5">Professional Profile</div>
                <div className="text-[3.5px] text-gray-700">Results-driven digital marketing specialist with 6+ years developing campaigns that increase brand visibility and drive engagement.</div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] text-blue-900 uppercase mb-0.5">Experience</div>
                <div className="mb-0.5">
                  <div className="font-bold text-[3.5px]">Digital Marketing Officer — BrightWave Communications</div>
                  <div className="text-[3px] text-gray-500 italic">April 2021 - Present</div>
                  <div className="text-[3.5px]">- Develop and execute digital marketing campaigns</div>
                  <div className="text-[3.5px]">- Increased social media engagement by 45%</div>
                </div>
                <div className="mb-0.5">
                  <div className="font-bold text-[3.5px]">Marketing Assistant — Skyline Retail Group</div>
                  <div className="text-[3px] text-gray-500 italic">Jan 2019 - Mar 2021</div>
                  <div className="text-[3.5px]">- Assisted with promotional campaigns and events</div>
                </div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] text-blue-900 uppercase mb-0.5">Education</div>
                <div className="text-[3.5px]">
                  <div className="font-bold">BCom Marketing — Kenyatta University</div>
                  <div className="text-gray-500 italic">2014 - 2018</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[5px] text-blue-900 uppercase mb-0.5">Achievements</div>
                <div className="text-[3.5px]">
                  <div>- Grew email subscribers from 5,000 to 15,000 in 18 months</div>
                  <div>- Won Best Digital Campaign — Kenya Marketing Awards 2023</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Executive Leadership':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded overflow-hidden text-[3.5px] leading-[1.3]">
            <div className="border-b border-gray-900 pb-1 mb-1 px-2 pt-2">
              <div className="flex items-start gap-1.5 mb-0.5">
                <MaleAvatar className="w-7 h-7 rounded-full flex-shrink-0" />
                <div>
                  <div className="font-bold text-[9px]">DAVID OCHIENG OTIENO</div>
                  <div className="text-[6px] text-gray-700">Chief Operations Officer</div>
                  <div className="text-[3.5px] text-gray-600">Nairobi, Kenya | +254 711 234 567 | david.otieno@email.com</div>
                </div>
              </div>
            </div>
            <div className="px-2">
              <div className="mb-1">
                <div className="font-bold text-[5px] uppercase mb-0.5">Leadership Profile</div>
                <div className="text-[3.5px] text-gray-700">Strategic operations executive with 15+ years driving operational efficiency and business growth across East Africa.</div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] uppercase mb-0.5">Key Achievements</div>
                <div className="text-[3.5px]">
                  <div>- Led restructuring reducing costs by 28% within two years</div>
                  <div>- Oversaw expansion into three East African markets</div>
                  <div>- Managed cross-functional teams of 250+ employees</div>
                  <div>- Achieved 40% revenue growth through strategic initiatives</div>
                </div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] uppercase mb-0.5">Experience</div>
                <div className="mb-0.5">
                  <div className="font-semibold text-[3.5px]">Chief Operations Officer — EastAfrica Logistics Group</div>
                  <div className="text-[3px] text-gray-500 italic">2019 - Present</div>
                  <div className="text-[3.5px]">- Lead operational strategy for 300+ staff regional company</div>
                  <div className="text-[3.5px]">- Drive business growth and operational excellence</div>
                </div>
                <div className="mb-0.5">
                  <div className="font-semibold text-[3.5px]">Operations Director — TransGlobal Supply Chain Ltd</div>
                  <div className="text-[3px] text-gray-500 italic">2015 - 2019</div>
                  <div className="text-[3.5px]">- Managed nationwide logistics and distribution network</div>
                </div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] uppercase mb-0.5">Education</div>
                <div className="text-[3.5px]">
                  <div className="font-semibold">MBA — Strathmore Business School (2012-2014)</div>
                  <div className="font-semibold">BCom Operations — University of Nairobi (2004-2008)</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[5px] uppercase mb-0.5">Certifications</div>
                <div className="text-[3.5px]">
                  <div>- Certified Supply Chain Professional (CSCP)</div>
                  <div>- Strategic Leadership — Harvard Business School</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Graduate Starter CV':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded p-2 text-[3.5px] leading-[1.35] overflow-hidden shadow-sm">
            <div className="border-b border-gray-300 pb-1 mb-1">
              <div className="flex items-start gap-1.5 mb-0.5">
                <MaleAvatar className="w-6 h-6 rounded-full flex-shrink-0" />
                <div>
                  <div className="font-bold text-[8px] text-gray-900">BRIAN KIPRONO CHEBET</div>
                  <div className="text-[5px] text-gray-700">Recent Graduate - Mechanical Engineering</div>
                  <div className="text-[3.5px] text-gray-600">Nakuru, Kenya | +254 712 987 654 | brian.chebet@email.com</div>
                </div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[5px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Career Objective</div>
              <div className="text-[3.5px] text-gray-700">Motivated mechanical engineering graduate seeking an entry-level role to apply technical knowledge and problem-solving skills.</div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[5px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Education</div>
              <div className="text-[3.5px] mb-0.5">
                <div className="font-semibold">BSc Mechanical Engineering — JKUAT</div>
                <div className="text-gray-500 italic">2019 - 2023 | Second Class Honours (Upper)</div>
              </div>
              <div className="text-[3.5px]">
                <div className="font-semibold">KCSE — Nakuru High School</div>
                <div className="text-gray-500 italic">2015 - 2018 | Grade A-</div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[5px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Academic Projects</div>
              <div className="text-[3.5px]">
                <div className="font-semibold">Automated Irrigation System (Final Year, 2023)</div>
                <div>- Designed sensor-based system reducing water usage by 35%</div>
                <div className="font-semibold mt-0.5">Solar Water Heater Design (2022)</div>
                <div>- Built low-cost heater achieving 80% efficiency</div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[5px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Skills</div>
              <div className="text-[3.5px]">
                <div>- AutoCAD, SolidWorks, MATLAB</div>
                <div>- Technical Report Writing</div>
                <div>- Team Collaboration</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-[5px] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5">Referees</div>
              <div className="text-[3.5px] italic">Available upon request.</div>
            </div>
          </div>
        );

      case 'Skills-Based (Functional)':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded overflow-hidden flex text-[3.5px] leading-[1.3]">
            <div className="w-[32%] bg-teal-700 text-white p-2">
              <div className="flex justify-center mb-1.5">
                <FemaleAvatar className="w-8 h-8 rounded-full border-2 border-white" />
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[5px] uppercase mb-0.5">Contact</div>
                <div className="text-[3.5px] space-y-0.5">
                  <div>Nairobi, Kenya</div>
                  <div>+254 722 111 222</div>
                  <div>mary.achieng@email.com</div>
                </div>
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[5px] uppercase mb-0.5">Core Skills</div>
                <div className="text-[3.5px] space-y-0.5">
                  <div>- Project Management</div>
                  <div>- Stakeholder Engagement</div>
                  <div>- Budget Management</div>
                  <div>- Team Leadership</div>
                  <div>- Data Analysis</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[5px] uppercase mb-0.5">Education</div>
                <div className="text-[3.5px]">
                  <div>BA Development Studies</div>
                  <div>University of Nairobi</div>
                  <div className="italic">2010 - 2014</div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-2">
              <div className="border-b border-teal-700 pb-1 mb-1">
                <div className="font-bold text-[8px]">MARY ACHIENG ODHIAMBO</div>
                <div className="text-[5.5px] text-teal-700">Programme Manager</div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] text-teal-800 uppercase mb-0.5">Professional Profile</div>
                <div className="text-[3.5px] text-gray-700">Experienced programme manager with 8+ years in NGO and development sector project coordination across East Africa.</div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] text-teal-800 uppercase mb-0.5">Key Competencies</div>
                <div className="text-[3.5px]">
                  <div className="font-semibold">Project Management</div>
                  <div>- Managed 12+ donor-funded projects worth KES 50M+</div>
                  <div>- Delivered all projects on time and within budget</div>
                  <div className="font-semibold mt-0.5">Stakeholder Engagement</div>
                  <div>- Coordinated with government, donors, and communities</div>
                  <div>- Facilitated 30+ community workshops across 5 counties</div>
                </div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] text-teal-800 uppercase mb-0.5">Work History</div>
                <div className="text-[3.5px]">
                  <div className="font-semibold">Programme Manager — CARE Kenya (2018-Present)</div>
                  <div className="font-semibold">Project Officer — ActionAid Kenya (2014-2018)</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[5px] text-teal-800 uppercase mb-0.5">Certifications</div>
                <div className="text-[3.5px]">
                  <div>- PMP Certification (2019)</div>
                  <div>- M&amp;E for Development — ILRI (2017)</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Internship / Industrial Attachment':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded p-2 text-[3.5px] leading-[1.35] overflow-hidden shadow-sm">
            <div className="bg-green-700 text-white p-1.5 -mx-2 -mt-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <MaleAvatar className="w-7 h-7 rounded-full border-2 border-white flex-shrink-0" />
                <div>
                  <div className="font-bold text-[7px]">KEVIN MUTUA MULI</div>
                  <div className="text-[5px]">Computer Science Student</div>
                  <div className="text-[3.5px]">Nairobi | +254 700 123 456 | kevin.mutua@email.com</div>
                </div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[5px] text-green-800 border-b border-green-300 pb-0.5 mb-0.5">Objective</div>
              <div className="text-[3.5px] text-gray-700">Computer Science student seeking a 3-month industrial attachment to apply programming skills in a real-world environment.</div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[5px] text-green-800 border-b border-green-300 pb-0.5 mb-0.5">Education</div>
              <div className="text-[3.5px]">
                <div className="font-semibold">BSc Computer Science — University of Nairobi</div>
                <div className="text-gray-500 italic">2021 - Present | Year 3</div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[5px] text-green-800 border-b border-green-300 pb-0.5 mb-0.5">Technical Skills</div>
              <div className="text-[3.5px]">
                <div>- Python, Java, JavaScript, HTML/CSS</div>
                <div>- MySQL, Git, Linux</div>
                <div>- React, Node.js (basic)</div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[5px] text-green-800 border-b border-green-300 pb-0.5 mb-0.5">Projects</div>
              <div className="text-[3.5px]">
                <div className="font-semibold">Student Portal System</div>
                <div>- Built web app for student registration using React and Node.js</div>
                <div className="font-semibold mt-0.5">Library Management System</div>
                <div>- Developed Python/MySQL system for book tracking</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-[5px] text-green-800 border-b border-green-300 pb-0.5 mb-0.5">Referees</div>
              <div className="text-[3.5px] italic">Available upon request.</div>
            </div>
          </div>
        );

      case 'Creative Portfolio':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded overflow-hidden flex text-[3.5px] leading-[1.3]">
            <div className="w-[38%] bg-indigo-800 text-white p-2">
              <div className="flex justify-center mb-1.5">
                <MaleAvatar className="w-9 h-9 rounded-full border-2 border-indigo-300" />
              </div>
              <div className="text-center mb-1.5">
                <div className="font-bold text-[6px]">BRIAN MWANGI KIMANI</div>
                <div className="text-[4px] text-indigo-200">UI/UX Designer</div>
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[4.5px] uppercase mb-0.5 text-indigo-200">Skills</div>
                <div className="text-[3.5px] space-y-0.5">
                  <div>- UI/UX Design</div>
                  <div>- Figma / Adobe XD</div>
                  <div>- Brand Identity</div>
                  <div>- Motion Graphics</div>
                  <div>- Illustration</div>
                </div>
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[4.5px] uppercase mb-0.5 text-indigo-200">Contact</div>
                <div className="text-[3.5px] space-y-0.5">
                  <div>Nairobi, Kenya</div>
                  <div>+254 711 222 333</div>
                  <div>brian.kimani@email.com</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[4.5px] uppercase mb-0.5 text-indigo-200">Education</div>
                <div className="text-[3.5px]">
                  <div>BA Graphic Design</div>
                  <div>Kenyatta University</div>
                  <div className="italic">2015 - 2019</div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-2">
              <div className="mb-1">
                <div className="font-bold text-[5px] text-indigo-800 uppercase mb-0.5">Profile</div>
                <div className="text-[3.5px] text-gray-700">Creative UI/UX designer with 5+ years crafting user-centered digital experiences for startups and established brands.</div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] text-indigo-800 uppercase mb-0.5">Portfolio Projects</div>
                <div className="text-[3.5px]">
                  <div className="font-semibold">M-Pesa Super App Redesign</div>
                  <div>- Redesigned onboarding flow, improving completion by 40%</div>
                  <div className="font-semibold mt-0.5">Jumia Kenya Mobile App</div>
                  <div>- Led UX research and prototyping for checkout redesign</div>
                  <div className="font-semibold mt-0.5">Safaricom Brand Guidelines</div>
                  <div>- Developed comprehensive visual identity system</div>
                </div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] text-indigo-800 uppercase mb-0.5">Experience</div>
                <div className="text-[3.5px]">
                  <div className="font-semibold">Senior UI/UX Designer — TechBridge Africa (2021-Present)</div>
                  <div className="font-semibold">Graphic Designer — Creative Hub Nairobi (2019-2021)</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[5px] text-indigo-800 uppercase mb-0.5">Awards</div>
                <div className="text-[3.5px]">
                  <div>- Best Digital Design — Kenya Design Awards 2023</div>
                  <div>- Top 10 African Designers — Behance 2022</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Digital Professional':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded overflow-hidden flex text-[3.5px] leading-[1.3]">
            <div className="w-[35%] bg-gray-900 text-white p-2">
              <div className="flex justify-center mb-1.5">
                <MaleAvatar className="w-8 h-8 rounded-full border-2 border-gray-600" />
              </div>
              <div className="text-center mb-1.5">
                <div className="font-bold text-[5.5px]">KEVIN OTIENO</div>
                <div className="text-[3.5px] text-gray-400">Software Engineer</div>
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[4.5px] uppercase mb-0.5 text-gray-400">Tech Stack</div>
                <div className="text-[3.5px] space-y-0.5">
                  <div>- React / Next.js</div>
                  <div>- Node.js / Express</div>
                  <div>- Python / Django</div>
                  <div>- PostgreSQL / MongoDB</div>
                  <div>- Docker / AWS</div>
                </div>
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[4.5px] uppercase mb-0.5 text-gray-400">Certifications</div>
                <div className="text-[3.5px] space-y-0.5">
                  <div>- AWS Solutions Architect</div>
                  <div>- Google Cloud Professional</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[4.5px] uppercase mb-0.5 text-gray-400">Contact</div>
                <div className="text-[3.5px] space-y-0.5">
                  <div>Nairobi, Kenya</div>
                  <div>kevin.otieno@email.com</div>
                  <div>github.com/kevinotieno</div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-2">
              <div className="border-b border-gray-800 pb-1 mb-1">
                <div className="font-bold text-[8px]">KEVIN OTIENO</div>
                <div className="text-[5px] text-gray-600">Senior Software Engineer</div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] uppercase mb-0.5">Profile</div>
                <div className="text-[3.5px] text-gray-700">Full-stack engineer with 7+ years building scalable web applications and APIs for fintech and e-commerce platforms.</div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] uppercase mb-0.5">Experience</div>
                <div className="mb-0.5">
                  <div className="font-semibold text-[3.5px]">Senior Software Engineer — Safaricom PLC</div>
                  <div className="text-[3px] text-gray-500 italic">2021 - Present</div>
                  <div className="text-[3.5px]">- Built M-Pesa API integrations serving 30M+ users</div>
                  <div className="text-[3.5px]">- Led migration to microservices architecture</div>
                </div>
                <div>
                  <div className="font-semibold text-[3.5px]">Software Developer — Andela Kenya</div>
                  <div className="text-[3px] text-gray-500 italic">2018 - 2021</div>
                  <div className="text-[3.5px]">- Developed React/Node.js applications for US clients</div>
                </div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] uppercase mb-0.5">Education</div>
                <div className="text-[3.5px]">
                  <div className="font-semibold">BSc Computer Science — University of Nairobi (2014-2018)</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[5px] uppercase mb-0.5">Key Projects</div>
                <div className="text-[3.5px]">
                  <div>- M-Pesa Super App — 30M+ active users</div>
                  <div>- Real-time fraud detection system — 99.9% accuracy</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Personal Brand CV':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded overflow-hidden flex text-[3.5px] leading-[1.3]">
            <div className="w-[35%] bg-purple-700 text-white p-2">
              <div className="flex justify-center mb-1.5">
                <FemaleAvatar className="w-9 h-9 rounded-full border-2 border-purple-300" />
              </div>
              <div className="text-center mb-1.5">
                <div className="font-bold text-[5.5px]">GRACE WANJIKU MWANGI</div>
                <div className="text-[3.5px] text-purple-200 italic">"Empowering brands to tell authentic stories"</div>
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[4.5px] uppercase mb-0.5 text-purple-200">Online Presence</div>
                <div className="text-[3.5px] space-y-0.5">
                  <div>gracemwangi.com</div>
                  <div>@gracemwangi (50K followers)</div>
                  <div>linkedin.com/in/gracemwangi</div>
                </div>
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[4.5px] uppercase mb-0.5 text-purple-200">Expertise</div>
                <div className="text-[3.5px] space-y-0.5">
                  <div>- Brand Strategy</div>
                  <div>- Content Creation</div>
                  <div>- Public Speaking</div>
                  <div>- Executive Coaching</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[4.5px] uppercase mb-0.5 text-purple-200">Contact</div>
                <div className="text-[3.5px]">grace@gracemwangi.com</div>
              </div>
            </div>
            <div className="flex-1 p-2">
              <div className="border-b border-purple-600 pb-1 mb-1">
                <div className="font-bold text-[7px]">GRACE WANJIKU MWANGI</div>
                <div className="text-[5px] text-purple-700">Brand Strategist &amp; Executive Coach</div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] text-purple-800 uppercase mb-0.5">Brand Statement</div>
                <div className="text-[3.5px] text-gray-700">Award-winning brand strategist helping African businesses build authentic, impactful brand identities that resonate globally.</div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] text-purple-800 uppercase mb-0.5">Speaking Engagements</div>
                <div className="text-[3.5px]">
                  <div>- TEDx Nairobi 2023 — "The Power of Authentic Branding"</div>
                  <div>- Africa CEO Forum 2022 — Brand Strategy Panel</div>
                </div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] text-purple-800 uppercase mb-0.5">Experience</div>
                <div className="text-[3.5px]">
                  <div className="font-semibold">Founder — Grace Mwangi Consulting (2019-Present)</div>
                  <div className="font-semibold">Brand Manager — Equity Bank Kenya (2015-2019)</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[5px] text-purple-800 uppercase mb-0.5">Media Features</div>
                <div className="text-[3.5px]">
                  <div>- Forbes Africa 30 Under 30 (2021)</div>
                  <div>- Business Daily Africa — Top Marketers (2022)</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Academic / Research CV':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded p-2 text-[3.5px] leading-[1.35] overflow-hidden shadow-sm">
            <div className="border-b-2 border-gray-800 pb-1 mb-1">
              <div className="flex items-start gap-1.5">
                <MaleAvatar className="w-6 h-6 rounded-full flex-shrink-0" />
                <div>
                  <div className="font-bold text-[8px] text-gray-900">Dr. DANIEL MWANGI NJOROGE</div>
                  <div className="text-[5px] text-gray-700">Senior Lecturer | Public Health Researcher</div>
                  <div className="text-[3.5px] text-gray-600">Nairobi, Kenya | d.njoroge@university.ac.ke</div>
                </div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[5px] border-b border-gray-300 pb-0.5 mb-0.5">Research Interests</div>
              <div className="text-[3.5px]">Infectious disease epidemiology, maternal health, health systems strengthening, and community-based interventions in sub-Saharan Africa.</div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[5px] border-b border-gray-300 pb-0.5 mb-0.5">Academic Positions</div>
              <div className="text-[3.5px]">
                <div className="font-semibold">Senior Lecturer — University of Nairobi (2019-Present)</div>
                <div className="font-semibold">Lecturer — Kenyatta University (2015-2019)</div>
                <div className="font-semibold">Research Fellow — KEMRI (2012-2015)</div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[5px] border-b border-gray-300 pb-0.5 mb-0.5">Education</div>
              <div className="text-[3.5px]">
                <div className="font-semibold">PhD Public Health — University of Nairobi (2012)</div>
                <div className="font-semibold">MSc Epidemiology — London School of Hygiene (2008)</div>
                <div className="font-semibold">MBChB — University of Nairobi (2005)</div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[5px] border-b border-gray-300 pb-0.5 mb-0.5">Selected Publications</div>
              <div className="text-[3.5px]">
                <div>- Njoroge D. et al. (2023). Maternal mortality in rural Kenya. Lancet Global Health.</div>
                <div>- Njoroge D. et al. (2021). COVID-19 vaccine hesitancy. BMC Public Health.</div>
                <div>- Njoroge D. et al. (2019). Malaria prevention interventions. Malaria Journal.</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-[5px] border-b border-gray-300 pb-0.5 mb-0.5">Grants &amp; Awards</div>
              <div className="text-[3.5px]">
                <div>- Wellcome Trust Research Grant — KES 15M (2022)</div>
                <div>- Best Researcher Award — University of Nairobi (2021)</div>
              </div>
            </div>
          </div>
        );

      case 'Technical / Engineering CV':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded overflow-hidden flex text-[3.5px] leading-[1.3]">
            <div className="w-[32%] bg-gray-100 border-r border-gray-300 p-2">
              <div className="flex justify-center mb-1.5">
                <MaleAvatar className="w-8 h-8 rounded-full" />
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[4.5px] uppercase mb-0.5 text-gray-700">Technical Skills</div>
                <div className="text-[3.5px] space-y-0.5">
                  <div>- AutoCAD / SolidWorks</div>
                  <div>- SAP PM / CMMS</div>
                  <div>- MATLAB / Simulink</div>
                  <div>- PLC Programming</div>
                  <div>- Lean / Six Sigma</div>
                </div>
              </div>
              <div className="mb-1.5">
                <div className="font-bold text-[4.5px] uppercase mb-0.5 text-gray-700">Certifications</div>
                <div className="text-[3.5px] space-y-0.5">
                  <div>- EBK Registered Engineer</div>
                  <div>- Six Sigma Green Belt</div>
                  <div>- OSHA Safety Cert.</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[4.5px] uppercase mb-0.5 text-gray-700">Contact</div>
                <div className="text-[3.5px] space-y-0.5">
                  <div>Nairobi, Kenya</div>
                  <div>+254 722 333 444</div>
                  <div>s.cheruiyot@email.com</div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-2">
              <div className="border-b-2 border-gray-800 pb-1 mb-1">
                <div className="font-bold text-[8px]">SAMUEL K. CHERUIYOT</div>
                <div className="text-[5px] text-gray-700">Mechanical Engineer</div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] uppercase border-b border-gray-300 pb-0.5 mb-0.5">Engineering Projects</div>
                <div className="text-[3.5px]">
                  <div className="font-semibold">Production Line Optimization — East Africa Packaging (2023)</div>
                  <div>- Increased efficiency by 18%, reduced stoppages by 30%</div>
                  <div className="font-semibold mt-0.5">Preventive Maintenance Overhaul — Nairobi Steel (2022)</div>
                  <div>- Reduced downtime by 25%, extended machine life by 2 years</div>
                  <div className="font-semibold mt-0.5">Energy Audit — East Africa Packaging (2023)</div>
                  <div>- Saved KES 1.8M annually through system optimization</div>
                </div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] uppercase border-b border-gray-300 pb-0.5 mb-0.5">Experience</div>
                <div className="text-[3.5px]">
                  <div className="font-semibold">Mechanical Engineer — East Africa Packaging Ltd (2022-Present)</div>
                  <div>- Oversee maintenance of 40+ production machines</div>
                  <div className="font-semibold mt-0.5">Maintenance Engineer — Nairobi Steel Manufacturing (2019-2022)</div>
                  <div>- Managed mechanical maintenance for steel equipment</div>
                </div>
              </div>
              <div className="mb-1">
                <div className="font-bold text-[5px] uppercase border-b border-gray-300 pb-0.5 mb-0.5">Education</div>
                <div className="text-[3.5px]">
                  <div className="font-semibold">BSc Mechanical Engineering — JKUAT (2014-2018)</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-[5px] uppercase border-b border-gray-300 pb-0.5 mb-0.5">Memberships</div>
                <div className="text-[3.5px]">
                  <div>- Engineers Board of Kenya (EBK)</div>
                  <div>- Institution of Engineers of Kenya (IEK)</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'International / ATS Optimized CV':
        return (
          <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded p-2 text-[3.5px] leading-[1.3] overflow-hidden shadow-sm">
            <div className="mb-1">
              <div className="flex items-start gap-1.5 mb-0.5">
                <MaleAvatar className="w-6 h-6 rounded-full flex-shrink-0" />
                <div>
                  <div className="font-bold text-[7px] text-gray-900">DAVID OCHIENG ONYANGO</div>
                  <div className="text-[4.5px] text-gray-700">Data Analyst</div>
                  <div className="text-[3.5px] text-gray-600">Nairobi, Kenya | +254 712 000 111 | david.onyango@email.com | linkedin.com/in/davidonyango</div>
                </div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[4px] uppercase border-b border-gray-400 pb-0.5 mb-0.5 tracking-wide">Professional Summary</div>
              <div className="text-[3.5px] text-gray-700">Data analyst with 5+ years transforming complex datasets into actionable insights. Skilled in SQL, Python, and Power BI to support data-driven decision making.</div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[4px] uppercase border-b border-gray-400 pb-0.5 mb-0.5 tracking-wide">Core Skills</div>
              <div className="grid grid-cols-2 text-[3.5px] gap-y-0.5">
                <div>- Data Analysis</div><div>- SQL</div>
                <div>- Python</div><div>- Power BI</div>
                <div>- Excel (Advanced)</div><div>- Data Visualization</div>
                <div>- Statistical Analysis</div><div>- ETL Pipelines</div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[4px] uppercase border-b border-gray-400 pb-0.5 mb-0.5 tracking-wide">Professional Experience</div>
              <div className="mb-0.5">
                <div className="font-semibold text-[3.5px]">Data Analyst — Insight Analytics Ltd</div>
                <div className="text-[3.2px] text-gray-600 mb-0.5">Nairobi, Kenya | January 2021 - Present</div>
                <div className="text-[3.5px] text-gray-700">
                  <div>- Analyzed large datasets supporting decisions across 5 departments.</div>
                  <div>- Developed Power BI dashboards tracking 20+ KPIs for leadership.</div>
                  <div>- Automated weekly reporting using Python, saving 8 hours/week.</div>
                </div>
              </div>
              <div className="mb-0.5">
                <div className="font-semibold text-[3.5px]">Junior Data Analyst — TechData Solutions</div>
                <div className="text-[3.2px] text-gray-600 mb-0.5">Nairobi, Kenya | March 2019 - December 2020</div>
                <div className="text-[3.5px] text-gray-700">
                  <div>- Prepared reports and visualizations for management review.</div>
                  <div>- Maintained company data warehouse and ensured data integrity.</div>
                </div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[4px] uppercase border-b border-gray-400 pb-0.5 mb-0.5 tracking-wide">Education</div>
              <div className="text-[3.5px]">
                <div className="font-semibold">BSc Statistics — University of Nairobi (2015-2019)</div>
                <div className="text-gray-600">Second Class Honours (Upper Division)</div>
              </div>
            </div>
            <div className="mb-1">
              <div className="font-semibold text-[4px] uppercase border-b border-gray-400 pb-0.5 mb-0.5 tracking-wide">Certifications</div>
              <div className="text-[3.5px] text-gray-700">
                <div>- Google Data Analytics Professional Certificate (2022)</div>
                <div>- Microsoft Power BI Data Analyst Associate (2023)</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-[4px] uppercase border-b border-gray-400 pb-0.5 mb-0.5 tracking-wide">References</div>
              <div className="text-[3.5px] text-gray-700">Available upon request.</div>
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
