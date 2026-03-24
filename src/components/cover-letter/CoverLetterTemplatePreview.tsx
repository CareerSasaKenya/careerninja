/**
 * Cover Letter Template Preview
 * Renders a scaled-down thumbnail of a cover letter template for the gallery.
 * Mirrors the pattern used in CVTemplatePreview.tsx.
 */

import React from 'react';

interface Props {
  templateName: string;
  showDescription?: boolean;
  descriptionOnly?: boolean;
}

const descriptions: Record<string, string> = {
  'Classic Professional Cover Letter':
    'A formal, structured layout with traditional formatting. The safest option — works for government, NGOs, banking, corporate, and administrative roles.',
  'Modern Professional Cover Letter':
    'Cleaner layout with better spacing and a contemporary tone. Ideal for private sector, marketing, business, and mid-level professional roles.',
  'Short & Direct Cover Letter':
    'A concise, high-impact letter of 3 short paragraphs. Perfect for startups, tech companies, online applications, and busy recruiters.',
  'Graduate / Entry-Level Cover Letter':
    'Focuses on education, projects, and potential rather than experience. Solves the "I don\'t have experience" problem for fresh graduates.',
  'Internship / Attachment Cover Letter':
    'Tailored for students applying for industrial attachment or internships. Highly relevant for university and TVET students in Kenya.',
  'Career Change Cover Letter':
    'Helps candidates explain transitions between industries or roles. Ideal for career switchers and people re-entering the workforce.',
  'Personal Brand Cover Letter':
    'Highlights personality, online presence, and unique voice. Pairs perfectly with the Personal Brand CV for creatives and consultants.',
  'International / ATS-Friendly Cover Letter':
    'Simple, clean, keyword-focused format optimised for global applications, remote jobs, and ATS-based hiring systems.',
};

function ClassicPreviewThumbnail() {
  return (
    <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded px-4 py-4 text-[5px] leading-[1.5] overflow-hidden shadow-sm font-serif">
      {/* Header */}
      <div className="border-b border-gray-300 pb-2 mb-2">
        <div className="font-bold text-[8px]">JOHN MWANGI KARIUKI</div>
        <div className="text-gray-600 space-y-0.5 mt-0.5">
          <div>+254 712 345 678</div>
          <div>john.mwangi@email.com</div>
          <div>Nairobi, Kenya</div>
        </div>
      </div>
      {/* Date */}
      <div className="mb-2">24 March 2026</div>
      {/* Employer */}
      <div className="mb-2 space-y-0.5">
        <div className="font-semibold">Hiring Manager</div>
        <div>ABC Company Ltd</div>
        <div className="text-gray-500">P.O. Box 12345, Nairobi</div>
      </div>
      {/* Salutation */}
      <div className="mb-2">Dear Hiring Manager,</div>
      {/* Body */}
      <div className="space-y-2 mb-3 text-gray-700">
        <p>I am writing to express my interest in the Administrative Officer position at ABC Company Ltd. With a strong background in office administration and customer service, I am confident in my ability to contribute effectively to your team.</p>
        <p>In my previous role, I successfully managed office operations, coordinated schedules, and supported senior staff in daily administrative tasks. I am highly organised, detail-oriented, and proficient in Microsoft Office tools.</p>
        <p>I am particularly interested in this opportunity because of your company's reputation for excellence. I would welcome the opportunity to contribute my skills and grow within your organisation.</p>
      </div>
      {/* Closing */}
      <div>
        <div className="mb-3">Sincerely,</div>
        <div className="font-semibold">John Mwangi Kariuki</div>
      </div>
    </div>
  );
}

function ModernPreviewThumbnail() {
  return (
    <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded px-4 py-4 text-[5px] leading-[1.5] overflow-hidden shadow-sm font-sans">
      {/* Header */}
      <div className="mb-3">
        <div className="font-bold text-[8px] text-gray-900">Grace Wanjiku Mwangi</div>
        <div className="flex gap-2 text-gray-500 mt-0.5 flex-wrap">
          <span>+254 712 555 444</span>
          <span>grace@email.com</span>
          <span>Nairobi, Kenya</span>
        </div>
        <div className="mt-1.5 h-[1.5px] w-6 bg-gray-800 rounded" />
      </div>
      {/* Date */}
      <div className="text-gray-500 mb-2">24 March 2026</div>
      {/* Employer */}
      <div className="mb-2 space-y-0.5">
        <div className="font-semibold text-gray-900">Hiring Manager</div>
        <div>BrightWave Marketing Ltd</div>
        <div className="text-gray-500">P.O. Box 67890, Nairobi</div>
      </div>
      {/* Salutation */}
      <div className="mb-2">Dear Hiring Manager,</div>
      {/* Body */}
      <div className="space-y-2 mb-3 text-gray-700">
        <p>I am excited to apply for the Marketing Executive position at BrightWave Marketing Ltd. With over five years of experience in digital marketing and brand strategy, I have developed a strong ability to create impactful campaigns.</p>
        <p>In my current role, I have successfully managed multi-channel marketing campaigns, increased social media engagement, and contributed to revenue growth through data-driven strategies.</p>
        <p>I am particularly drawn to your company's innovative approach to marketing and would welcome the opportunity to contribute my expertise to your team.</p>
      </div>
      {/* Closing */}
      <div>
        <div className="mb-2 text-gray-700">Sincerely,</div>
        <div className="font-semibold text-gray-900">Grace Wanjiku Mwangi</div>
      </div>
    </div>
  );
}

function ShortDirectPreviewThumbnail() {
  return (
    <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded px-4 py-4 text-[5px] leading-[1.5] overflow-hidden shadow-sm font-sans">
      {/* Header */}
      <div className="mb-2">
        <div className="font-bold text-[8px] text-gray-900">David Otieno Mwangi</div>
        <div className="flex gap-2 text-gray-500 mt-0.5 flex-wrap">
          <span>+254 700 123 456</span>
          <span>david@email.com</span>
          <span>Nairobi, Kenya</span>
        </div>
      </div>
      {/* Date */}
      <div className="text-gray-500 mb-1.5">24 March 2026</div>
      {/* Employer */}
      <div className="mb-1.5 space-y-0.5">
        <div className="font-medium text-gray-900">Hiring Manager</div>
        <div>TechNova Ltd</div>
        <div className="text-gray-500">P.O. Box 98765, Nairobi</div>
      </div>
      {/* Salutation */}
      <div className="mb-1.5">Dear Hiring Manager,</div>
      {/* Body */}
      <div className="space-y-1.5 mb-2 text-gray-700">
        <p>I am applying for the Software Developer position at TechNova Ltd. With 3 years of experience in web development, I have delivered solutions that increased client satisfaction by 20%.</p>
        <p>I lead project teams, streamline workflows, and implement efficient coding practices. My technical skills and proactive approach will contribute positively to your team.</p>
        <p>I am excited about TechNova's mission and would welcome the opportunity to bring my expertise to your projects.</p>
      </div>
      {/* Closing */}
      <div>
        <div className="mb-1.5 text-gray-700">Best regards,</div>
        <div className="font-semibold text-gray-900">David Otieno Mwangi</div>
      </div>
    </div>
  );
}

function GenericPreviewThumbnail({ templateName }: { templateName: string }) {
  const isShort = templateName === 'Short & Direct Cover Letter';
  const isPersonalBrand = templateName === 'Personal Brand Cover Letter';
  const isInternship = templateName === 'Internship / Attachment Cover Letter';

  return (
    <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded px-4 py-4 text-[5px] leading-[1.5] overflow-hidden shadow-sm font-sans">
      {/* Header bar */}
      <div className={`pb-2 mb-2 ${isPersonalBrand ? 'border-b-2 border-orange-400' : 'border-b border-gray-300'}`}>
        <div className={`font-bold text-[8px] ${isPersonalBrand ? 'text-orange-600' : 'text-gray-900'}`}>
          {isPersonalBrand ? 'AMINA ODHIAMBO' : isInternship ? 'KEVIN OTIENO OUMA' : 'GRACE WANJIKU NJOROGE'}
        </div>
        {isPersonalBrand && (
          <div className="text-orange-500 text-[6px] italic mb-0.5">Brand Strategist & Content Creator</div>
        )}
        <div className="text-gray-500 mt-0.5">
          {isInternship ? 'Kenyatta University • BSc Computer Science (Year 3)' : '+254 723 456 789 | grace@email.com | Nairobi'}
        </div>
      </div>
      {/* Date + recipient */}
      {!isShort && !isPersonalBrand && (
        <div className="mb-2 space-y-0.5">
          <div>24 March 2026</div>
          <div className="font-semibold mt-1">Hiring Manager</div>
          <div className="text-gray-500">XYZ Company Ltd, Nairobi</div>
        </div>
      )}
      {/* Salutation */}
      <div className="mb-2">
        {isPersonalBrand ? 'Hi Sarah,' : isShort ? 'Hi Hiring Manager,' : 'Dear Hiring Manager,'}
      </div>
      {/* Body lines */}
      <div className="space-y-2 text-gray-700">
        {isShort ? (
          <>
            <p>I am applying for the Marketing Manager position at XYZ Ltd. I have 5 years of experience in digital marketing and a proven ability to grow brand presence by 40%.</p>
            <p>My core strengths — SEO, content strategy, and campaign analytics — match what you are looking for. At BrightWave, I led a team of 4 and delivered 20+ successful campaigns.</p>
            <p>I would love to bring this energy to XYZ Ltd. Happy to chat at your convenience.</p>
          </>
        ) : isPersonalBrand ? (
          <>
            <p>I am Amina Odhiambo — a brand strategist who turns ideas into movements.</p>
            <p>I am reaching out about the Brand Manager opportunity at XYZ Ltd. I have been following your work in sustainable fashion and I believe there is a strong alignment between what you are building and what I do best.</p>
            <p>My work speaks for itself: 3 award-winning campaigns, 50K+ engaged followers, and a portfolio that blends creativity with measurable results.</p>
          </>
        ) : (
          <>
            <p>I am writing to apply for the {isInternship ? 'industrial attachment' : 'position'} at XYZ Company Ltd. {isInternship ? 'I am a third-year Computer Science student at Kenyatta University seeking practical experience.' : 'With 4 years of experience in marketing, I am confident in my ability to contribute to your team.'}</p>
            <p>{isInternship ? 'Through my coursework, I have developed foundational knowledge in Python, web development, and database management. I am eager to apply these skills in a real-world environment.' : 'In my current role, I have successfully managed campaigns that increased brand awareness by 35% and grew our social media following by 20,000 in 12 months.'}</p>
            <p>I am particularly drawn to your organisation because of your reputation for innovation. I would welcome the opportunity to {isInternship ? 'learn from your team' : 'contribute my skills and grow with you'}.</p>
          </>
        )}
      </div>
      {/* Closing */}
      <div className="mt-3">
        <div className="mb-2">{isPersonalBrand ? "Let's connect." : isShort ? '' : 'Sincerely,'}</div>
        <div className="font-semibold">
          {isPersonalBrand ? 'Amina Odhiambo' : isInternship ? 'Kevin Otieno Ouma' : 'Grace Wanjiku Njoroge'}
        </div>
      </div>
    </div>
  );
}

export default function CoverLetterTemplatePreview({ templateName, showDescription = false, descriptionOnly = false }: Props) {
  if (descriptionOnly && descriptions[templateName]) {
    return (
      <p className="text-xs text-muted-foreground leading-relaxed">
        {descriptions[templateName]}
      </p>
    );
  }

  const thumbnail = templateName === 'Classic Professional Cover Letter'
    ? <ClassicPreviewThumbnail />
    : templateName === 'Modern Professional Cover Letter'
    ? <ModernPreviewThumbnail />
    : templateName === 'Short & Direct Cover Letter'
    ? <ShortDirectPreviewThumbnail />
    : <GenericPreviewThumbnail templateName={templateName} />;

  return (
    <div>
      {thumbnail}
      {showDescription && descriptions[templateName] && (
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          {descriptions[templateName]}
        </p>
      )}
    </div>
  );
}
