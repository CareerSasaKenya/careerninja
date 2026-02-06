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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const colors = [
                'from-green-50 to-emerald-50',
                'from-blue-50 to-cyan-50',
                'from-purple-50 to-violet-50',
                'from-pink-50 to-rose-50',
                'from-amber-50 to-orange-50'
              ];
              
              const color = colors[index % colors.length];
              
              return (
                <div 
                  key={service.id}
                  className={`relative bg-gradient-to-br ${color} border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden`}
                >
                  {/* Decorative corner elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/30 to-transparent rounded-tr-full"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start mb-4">
                      <div className="mr-3 mt-1">
                        <span className="text-2xl">{service.title.split(' ')[0]}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{service.title.substring(service.title.indexOf(' ') + 1)}</h3>
                        <p className="text-gray-600 mt-1">{service.subtitle}</p>
                      </div>
                    </div>
                    
                    <ul className="space-y-2 mb-4">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-600 mr-2 mt-1">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <p className="text-sm text-gray-500 italic mb-4">{service.bestFor}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <span className="font-bold text-lg text-primary">{service.price}</span>
                      <Link href={`https://wa.me/254795564135?text=${encodeURIComponent(service.whatsappMessage)}`} target="_blank">
                        <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600">
                          WhatsApp Us
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bundled Packages */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Bundled LinkedIn Packages</h2>
          <div className="space-y-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => {
              const colors = [
                { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', accent: 'bg-emerald-500', text: 'text-emerald-700' },
                { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', accent: 'bg-blue-500', text: 'text-blue-700' },
                { bg: 'from-violet-50 to-purple-50', border: 'border-violet-200', accent: 'bg-violet-500', text: 'text-violet-700' },
                { bg: 'from-rose-50 to-pink-50', border: 'border-rose-200', accent: 'bg-rose-500', text: 'text-rose-700' },
                { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', accent: 'bg-amber-500', text: 'text-amber-700' }
              ];
              
              const color = colors[index % colors.length];
              
              return (
                <div 
                  key={pkg.id}
                  className={`relative bg-gradient-to-br ${color.bg} border ${color.border} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden`}
                >
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/30 blur-xl"></div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/30 blur-xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                        <p className="text-gray-600 font-medium">{pkg.subtitle}</p>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-6">
                        <div className={`inline-block px-4 py-2 rounded-full ${color.accent} text-white font-bold text-lg`}>
                          {pkg.price}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <span className={`${color.accent} w-2 h-2 rounded-full mr-2`}></span>
                          What's Included:
                        </h4>
                        <ul className="space-y-2">
                          {pkg.services.map((service, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-600 mr-2 mt-1">✓</span>
                              <span className="text-gray-700">{service}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <Link href={`https://wa.me/254795564135?text=${encodeURIComponent(pkg.whatsappMessage)}`} target="_blank">
                          <Button className={`${color.accent} hover:${color.accent.replace('500', '600')} text-white px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-105`}>
                            Get Started Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Custom Solutions */}
        <section className="mb-16 relative overflow-hidden rounded-2xl border border-purple-200">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-100 opacity-70"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-300/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4">
                <span className="text-2xl text-white">🧩</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Custom LinkedIn Solutions</h2>
              <h3 className="text-xl font-semibold text-gray-700">Need Something More Specific? Let's Build It Together.</h3>
            </div>
            
            <div className="text-center mb-8 max-w-3xl mx-auto">
              <p className="text-gray-700 mb-4">
                Not every career fits into a standard package. Some professionals need <strong>specialized LinkedIn support</strong> — whether it's a career transition, confidential job search, niche industry positioning, or advanced visibility strategy.
              </p>
              <p className="text-gray-700">
                That's why CareerSasa offers <strong>Custom LinkedIn Packages</strong>, tailored exactly to your goals.
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 mb-8 border border-white/30">
              <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center">What a Custom Package Can Include</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Career transition positioning (e.g. technical → leadership)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Confidential job search support</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Industry-specific keyword & recruiter targeting</span>
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Advanced LinkedIn SEO & search visibility</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Executive personal branding & thought leadership</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">LinkedIn social media management (custom volume)</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-gray-700 mb-8 text-center max-w-2xl mx-auto">
              If it involves LinkedIn and your career — we can build it.
            </p>

            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
              <h4 className="text-xl font-semibold mb-6 text-center">How It Works</h4>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">1</div>
                  <p>Describe your needs</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">2</div>
                  <p>We assess challenges</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">3</div>
                  <p>Design solution</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">4</div>
                  <p>Get scope & pricing</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full mb-6">
                <span className="text-lg mr-2">💰</span>
                <span className="font-semibold">Custom pricing based on scope and duration</span>
              </div>
              <Link href="https://wa.me/254795564135?text=Hi,%20I'm%20interested%20in%20a%20custom%20LinkedIn%20solution." target="_blank">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-10 py-4 text-xl font-semibold rounded-xl transition-all duration-200 transform hover:scale-105">
                  👉 Contact us for a custom LinkedIn solution
                </Button>
              </Link>
            </div>
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