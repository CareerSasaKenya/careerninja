import React from "react";

interface CreativeTemplateProps {
  data: {
    name: string;
    tagline: string;
    contact: {
      location: string;
      phone: string;
      email: string;
      website: string;
    };
    profile: string;
    skills: string[];
    tools: string[];
    projects: Array<{
      title: string;
      client: string;
      year: string;
      description: string;
    }>;
    experience: Array<{
      role: string;
      company: string;
      location: string;
      dates: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      dates: string;
    }>;
  };
}

export default function CreativeTemplate({ data }: CreativeTemplateProps) {
  return (
    <div className="w-[794px] h-[1123px] bg-white grid grid-cols-3 font-sans">
      {/* Sidebar */}
      <aside className="col-span-1 bg-indigo-600 text-white p-8">
        <h1 className="text-2xl font-bold leading-tight">{data.name}</h1>
        <p className="text-sm opacity-90 mb-6 mt-2">{data.tagline}</p>

        <div className="text-sm mb-6 space-y-1">
          <p>{data.contact.location}</p>
          <p>{data.contact.phone}</p>
          <p className="break-words">{data.contact.email}</p>
          <p className="break-words">{data.contact.website}</p>
        </div>

        {/* Skills */}
        <section className="mb-6">
          <h2 className="font-semibold mb-2 text-base">Core Skills</h2>
          <ul className="text-sm space-y-1">
            {data.skills.map((skill, index) => (
              <li key={index}>• {skill}</li>
            ))}
          </ul>
        </section>

        {/* Tools */}
        <section>
          <h2 className="font-semibold mb-2 text-base">Design Tools</h2>
          <ul className="text-sm space-y-1">
            {data.tools.map((tool, index) => (
              <li key={index}>• {tool}</li>
            ))}
          </ul>
        </section>
      </aside>

      {/* Main Content */}
      <main className="col-span-2 p-10 text-gray-800">
        {/* Profile */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b-2 border-indigo-600 pb-1 mb-2">
            Creative Profile
          </h2>
          <p className="text-sm leading-relaxed">{data.profile}</p>
        </section>

        {/* Portfolio Projects */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b-2 border-indigo-600 pb-1 mb-3">
            Portfolio Projects
          </h2>

          {data.projects.map((project, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold text-sm">{project.title}</p>
              <p className="text-xs text-gray-500 mb-1">
                {project.client} | {project.year}
              </p>
              <p className="text-sm leading-relaxed">{project.description}</p>
            </div>
          ))}
        </section>

        {/* Work Experience */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b-2 border-indigo-600 pb-1 mb-2">
            Work Experience
          </h2>

          {data.experience.map((job, index) => (
            <div key={index} className="mb-3">
              <p className="text-sm font-semibold">
                {job.role} — {job.company}
              </p>
              <p className="text-xs text-gray-500">
                {job.location} | {job.dates}
              </p>
            </div>
          ))}
        </section>

        {/* Education */}
        <section>
          <h2 className="text-lg font-semibold border-b-2 border-indigo-600 pb-1 mb-2">
            Education
          </h2>

          {data.education.map((edu, index) => (
            <div key={index}>
              <p className="text-sm font-semibold">{edu.degree}</p>
              <p className="text-sm">{edu.institution}</p>
              <p className="text-xs text-gray-500">{edu.dates}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
