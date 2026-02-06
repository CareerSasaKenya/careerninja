"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function LinkedInServicesPage() {
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

  const togglePackageDetails = (packageName: string) => {
    setExpandedPackage(expandedPackage === packageName ? null : packageName);
  };

  const services = [
    {
      id: "audit",
      title: "🔍 LinkedIn Profile Audit",
      subtitle: "Understand what's holding you back",
      features: [
        "Recruiter-readiness score",
        "Visibility & keyword gaps",
        "Clear improvement checklist"
      ],
      bestFor: "Best for students & first-time job seekers",
      price: "KES 2,500 – 4,000",
      whatsappMessage: "Hi, I'm interested in the LinkedIn Profile Audit service."
    },
    {
      id: "optimization",
      title: "✍️ LinkedIn Profile Optimization",
      subtitle: "Turn your profile into a recruiter magnet",
      features: [
        "Optimized headline & About section",
        "Achievement-focused experience rewrite",
        "Skills & LinkedIn SEO optimization"
      ],
      bestFor: "Best for active job seekers & professionals",
      price: "KES 5,000 – 8,000",
      whatsappMessage: "Hi, I'm interested in the LinkedIn Profile Optimization service."
    },
    {
      id: "alignment",
      title: "📄 LinkedIn + CV Alignment",
      subtitle: "Consistency recruiters trust",
      features: [
        "CV and LinkedIn alignment",
        "ATS-friendly language",
        "One professionally optimized CV"
      ],
      bestFor: "Best for serious job seekers",
      price: "KES 4,000 – 6,000",
      whatsappMessage: "Hi, I'm interested in the LinkedIn + CV Alignment service."
    },
    {
      id: "branding",
      title: "🌟 LinkedIn Personal Branding",
      subtitle: "Be visible, credible, and memorable",
      features: [
        "Personal brand positioning",
        "Banner & profile branding direction",
        "Industry-specific content ideas",
        "Networking & visibility strategy"
      ],
      bestFor: "Best for professionals & managers",
      price: "KES 8,000 – 12,000",
      whatsappMessage: "Hi, I'm interested in the LinkedIn Personal Branding service."
    },
    {
      id: "management",
      title: "📈 LinkedIn Social Media Management",
      subtitle: "We manage your LinkedIn. You focus on your career",
      features: [
        "Professionally written posts",
        "Content calendar & scheduling",
        "Engagement & visibility strategy",
        "Authentic, human content"
      ],
      bestFor: "Best for busy professionals, executives & consultants",
      price: "KES 10,000 – 15,000/month",
      whatsappMessage: "Hi, I'm interested in the LinkedIn Social Media Management service."
    }
  ];

  const packages = [
    {
      id: "graduate",
      title: "🟢 Graduate Launch Bundle",
      subtitle: "For students & fresh graduates",
      services: [
        "LinkedIn audit",
        "Entry-level profile optimization",
        "CV–LinkedIn alignment"
      ],
      price: "KES 3,500 – 5,000",
      whatsappMessage: "Hi, I'm interested in the Graduate Launch Bundle."
    },
    {
      id: "job-seeker",
      title: "🔵 Job Seeker Accelerator (Most Popular)",
      subtitle: "For active job seekers",
      services: [
        "Full LinkedIn optimization",
        "CV rewrite + alignment",
        "Job search & recruiter outreach strategy"
      ],
      price: "KES 7,000 – 10,000",
      whatsappMessage: "Hi, I'm interested in the Job Seeker Accelerator bundle."
    },
    {
      id: "growth",
      title: "🟣 Career Growth + Visibility Bundle",
      subtitle: "For professionals aiming higher",
      services: [
        "LinkedIn optimization",
        "Personal branding strategy",
        "1-month content plan",
        "6 professionally written posts"
      ],
      price: "KES 12,000 – 18,000",
      whatsappMessage: "Hi, I'm interested in the Career Growth + Visibility Bundle."
    },
    {
      id: "authority",
      title: "🔴 Authority Builder + Management Bundle",
      subtitle: "For managers & senior professionals",
      services: [
        "Advanced LinkedIn SEO optimization",
        "Personal brand positioning",
        "1-month LinkedIn management (8–12 posts)",
        "Networking & visibility playbook"
      ],
      price: "KES 20,000 – 30,000",
      whatsappMessage: "Hi, I'm interested in the Authority Builder + Management Bundle."
    },
    {
      id: "executive",
      title: "🟠 Executive Growth Retainer",
      subtitle: "For executives, consultants & founders",
      services: [
        "Executive-level profile optimization",
        "Thought leadership positioning",
        "Monthly LinkedIn management (12–16 posts)",
        "Authority & influence strategy"
      ],
      price: "KES 30,000 – 50,000 per month",
      whatsappMessage: "Hi, I'm interested in the Executive Growth Retainer."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* WhatsApp Button */}
      <WhatsAppButton />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            LinkedIn Career Services by <span className="text-primary">CareerSasa</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-8">
            Turn Your LinkedIn Profile Into Opportunities 🚀
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Your LinkedIn profile is no longer optional. It's your <strong>digital CV</strong>, your <strong>personal brand</strong>, and often the <strong>first interview filter</strong>.
          </p>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mt-4 leading-relaxed">
            At CareerSasa, we help students, job seekers, professionals, and executives <strong>use LinkedIn strategically</strong> — to get interviews, build credibility, and attract real opportunities.
          </p>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mt-4 leading-relaxed">
            Whether you want a better job, career growth, or professional visibility, we've built LinkedIn services that work for the African job market.
          </p>
        </section>

        {/* Why LinkedIn Matters */}
        <section className="mb-16 bg-blue-50 rounded-xl p-8 border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why LinkedIn Matters More Than Ever</h2>
          <ul className="space-y-4 max-w-4xl mx-auto">
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">•</span>
              <span className="text-gray-700"><strong>Recruiters search LinkedIn before shortlisting</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">•</span>
              <span className="text-gray-700"><strong>Hiring managers Google you before calling</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">•</span>
              <span className="text-gray-700"><strong>Your CV is checked against your LinkedIn profile</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-3">•</span>
              <span className="text-gray-700"><strong>A weak profile silently blocks opportunities</strong></span>
            </li>
          </ul>
          <p className="text-lg text-gray-700 mt-6 text-center italic">
            Most people lose interviews <strong>without ever knowing why</strong>. We make sure that doesn't happen to you.
          </p>
        </section>

        {/* What We Do Differently */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Do Differently at CareerSasa</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start mb-4">
                <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                <span className="font-semibold text-gray-800">Career-focused, not generic marketing</span>
              </div>
              <div className="flex items-start mb-4">
                <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                <span className="font-semibold text-gray-800">Industry-specific optimization (QA, Engineering, Biopharma, FMCG, Finance, HR & more)</span>
              </div>
              <div className="flex items-start mb-4">
                <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                <span className="font-semibold text-gray-800">Recruiter-oriented writing style</span>
              </div>
              <div className="flex items-start mb-4">
                <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                <span className="font-semibold text-gray-800">Practical strategies, not theory</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                <span className="font-semibold text-gray-800">Trusted career platform in Kenya & East Africa</span>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-4">
                We don't chase likes. We build <strong>career relevance and visibility</strong>.
              </p>
              <Link href="https://wa.me/254795564135" target="_blank">
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Chat with Us on WhatsApp
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Individual Services */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our LinkedIn Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.subtitle}</p>
                  <ul className="space-y-2 mb-4">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2 mt-1">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-500 italic mb-4">{service.bestFor}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-primary">{service.price}</span>
                    <Link href={`https://wa.me/254795564135?text=${encodeURIComponent(service.whatsappMessage)}`} target="_blank">
                      <Button variant="outline" size="sm">
                        WhatsApp Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bundled Packages */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Bundled LinkedIn Packages</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                  <p className="text-gray-600 mb-4">{pkg.subtitle}</p>
                  <ul className="space-y-2 mb-4">
                    {pkg.services.map((service, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2 mt-1">✓</span>
                        <span className="text-gray-700">{service}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-primary">{pkg.price}</span>
                    <Link href={`https://wa.me/254795564135?text=${encodeURIComponent(pkg.whatsappMessage)}`} target="_blank">
                      <Button variant="default" className="bg-green-500 hover:bg-green-600">
                        Order Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Custom Solutions */}
        <section className="mb-16 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">🧩 Custom LinkedIn Solutions</h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Need Something More Specific? Let's Build It Together.</h3>
          <p className="text-gray-700 mb-6 text-center">
            Not every career fits into a standard package. Some professionals need <strong>specialized LinkedIn support</strong> — whether it's a career transition, confidential job search, niche industry positioning, or advanced visibility strategy.
          </p>
          <p className="text-gray-700 mb-6 text-center">
            That's why CareerSasa offers <strong>Custom LinkedIn Packages</strong>, tailored exactly to your goals.
          </p>

          <h4 className="text-lg font-semibold text-gray-800 mb-4">What a Custom Package Can Include</h4>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span className="text-gray-700">Career transition positioning (e.g. technical → leadership)</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span className="text-gray-700">Confidential job search support</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span className="text-gray-700">Industry-specific keyword & recruiter targeting</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span className="text-gray-700">Advanced LinkedIn SEO & search visibility</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span className="text-gray-700">Executive personal branding & thought leadership</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span className="text-gray-700">LinkedIn social media management (custom volume)</span>
              </li>
            </ul>
          </div>

          <p className="text-gray-700 mb-6 text-center">
            If it involves LinkedIn and your career — we can build it.
          </p>

          <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">How It Works</h4>
          <ol className="space-y-2 mb-6 text-center">
            <li className="flex items-center justify-center">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
              <span className="text-gray-700">Contact CareerSasa and describe your needs</span>
            </li>
            <li className="flex items-center justify-center">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
              <span className="text-gray-700">We assess your goals and challenges</span>
            </li>
            <li className="flex items-center justify-center">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
              <span className="text-gray-700">We design a tailored LinkedIn solution</span>
            </li>
            <li className="flex items-center justify-center">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">4</span>
              <span className="text-gray-700">You receive a clear scope, timeline & price</span>
            </li>
          </ol>

          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              💰 <strong>Custom pricing based on scope and duration</strong>
            </p>
            <Link href="https://wa.me/254795564135?text=Hi,%20I'm%20interested%20in%20a%20custom%20LinkedIn%20solution." target="_blank">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg">
                👉 Contact us for a custom LinkedIn solution
              </Button>
            </Link>
          </div>
        </section>

        {/* Target Audience */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Who These Services Are For</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Students & fresh graduates",
              "Job seekers & career switchers",
              "Professionals seeking promotion",
              "Managers & senior leaders",
              "Consultants & founders"
            ].map((audience, idx) => (
              <div key={idx} className="bg-green-100 text-green-800 px-4 py-2 rounded-full border border-green-200">
              ✅ {audience}
            </div>
            ))}
          </div>
          <p className="text-center text-lg text-gray-700 mt-6">
            If LinkedIn affects your career — this is for you.
          </p>
        </section>

        {/* Process */}
        <section className="mb-16 bg-gray-50 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="text-center">
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {step}
                </div>
                <p className="text-gray-700">
                  {step === 1 && "Choose a service or bundle"}
                  {step === 2 && "Complete a short onboarding form"}
                  {step === 3 && "We optimize, position, and manage your LinkedIn"}
                  {step === 4 && "You get visibility, confidence, and opportunities"}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Be Seen for the Right Reasons?</h2>
          <p className="text-xl mb-8">
            Don't let a weak LinkedIn profile cost you interviews, promotions, or credibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="https://wa.me/254795564135?text=Hi,%20I'd%20like%20to%20choose%20a%20LinkedIn%20service%20today!" target="_blank">
              <Button className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-3">
                👉 Choose a LinkedIn service today
              </Button>
            </Link>
            <p className="text-white text-lg">
              ⏳ <em>Limited optimization & management slots available each month</em>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}