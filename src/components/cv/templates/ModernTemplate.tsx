/**
 * Modern Professional CV Template
 * Two-column grid layout with subtle styling for Kenyan candidates
 * A4 size: 794px × 1123px
 */

import React from 'react';

interface ContactInfo {
  phone: string;
  email: string;
  linkedin?: string;
  location: string;
}

interface Experience {
  jobTitle: string;
  company: string;
  location: string;
  dates: string;
  details: string[];
}

interface Education {
  degree: string;
  institution: string;
  dates: string;
}

interface CVData {
  name: string;
  title: string;
  contact: ContactInfo;
  profile: string;
  skills: string[];
  tools?: string[];
  languages?: string[];
  experience: Experience[];
  education: Education[];
  certifications?: string[];
  referees?: string;
}

interface ModernTemplateProps {
  data: CVData;
}

export default function ModernTemplate({ data }: ModernTemplateProps) {
  return (
    <div className="w-[794px] h-[1123px] bg-white grid grid-cols-3 font-sans text-gray-800 shadow-lg print:shadow-none">
      {/* LEFT SIDEBAR */}
      <aside className="col-span-1 bg-gray-100 p-6">
        <h1 className="text-xl font-bold mb-1">{data.name}</h1>
        <p className="text-sm text-gray-700 mb-4">{data.title}</p>
        
        <div className="text-sm mb-6 space-y-1">
          <p>{data.contact.location}</p>
          <p>{data.contact.phone}</p>
          <p className="break-words">{data.contact.email}</p>
          {data.contact.linkedin && (
            <p className="text-blue-600 break-words">{data.contact.linkedin}</p>
          )}
        </div>

        {/* Skills */}
        <section className="mb-6">
          <h2 className="font-semibold mb-2 text-base">Key Skills</h2>
          <ul className="text-sm space-y-1">
            {data.skills.map((skill, index) => (
              <li key={index}>• {skill}</li>
            ))}
          </ul>
        </section>

        {/* Tools */}
        {data.tools && data.tools.length > 0 && (
          <section className="mb-6">
            <h2 className="font-semibold mb-2 text-base">Tools & Platforms</h2>
            <ul className="text-sm space-y-1">
              {data.tools.map((tool, index) => (
                <li key={index}>• {tool}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <section className="mb-6">
            <h2 className="font-semibold mb-2 text-base">Languages</h2>
            <ul className="text-sm space-y-1">
              {data.languages.map((lang, index) => (
                <li key={index}>• {lang}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Referees */}
        <section>
          <h2 className="font-semibold mb-2 text-base">Referees</h2>
          <p className="text-sm italic">{data.referees || 'Available upon request.'}</p>
        </section>
      </aside>

      {/* MAIN CONTENT */}
      <main className="col-span-2 p-8">
        {/* Profile */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">
            Professional Profile
          </h2>
          <p className="text-sm leading-relaxed">{data.profile}</p>
        </section>

        {/* Experience */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">
            Professional Experience
          </h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-4">
              <p className="text-sm font-semibold">
                {job.jobTitle} — {job.company}
              </p>
              <p className="text-xs text-gray-500">
                {job.location} | {job.dates}
              </p>
              <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                {job.details.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Education */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">
            Education
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <p className="text-sm font-semibold">{edu.degree}</p>
              <p className="text-sm">{edu.institution}</p>
              <p className="text-xs text-gray-500">{edu.dates}</p>
            </div>
          ))}
        </section>

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">
              Certifications
            </h2>
            <ul className="list-disc list-inside text-sm space-y-1">
              {data.certifications.map((cert, index) => (
                <li key={index}>{cert}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
