"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import WhatsAppButton from "@/components/WhatsAppButton";
import Navbar from "@/components/Navbar";

export default function LinkedInServicesPage() {
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



  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* WhatsApp Button */}
      <WhatsAppButton />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                LinkedIn Career Services by <span className="text-primary">CareerSasa</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
                Turn Your LinkedIn Profile Into Opportunities 🚀
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Your LinkedIn profile is no longer optional. It's your <strong>digital CV</strong>, your <strong>personal brand</strong>, and often the <strong>first interview filter</strong>.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                At CareerSasa, we help students, job seekers, professionals, and executives <strong>use LinkedIn strategically</strong> — to get interviews, build credibility, and attract real opportunities.
              </p>
              <p className="text-lg text-gray-600">
                Whether you want a better job, career growth, or professional visibility, we've built LinkedIn services that work for the African job market.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-lg">
                <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl overflow-hidden shadow-xl border-8 border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80" 
                    alt="LinkedIn Professional Network"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl overflow-hidden shadow-lg border-4 border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                    alt="Professional Success"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why LinkedIn Matters */}
        <section className="mb-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -translate-y-16 translate-x-16 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-200/30 rounded-full translate-y-20 -translate-x-20 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8 max-w-6xl mx-auto">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why LinkedIn Matters More Than Ever</h2>
                <ul className="space-y-4">
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
                <p className="text-lg text-gray-700 mt-6 italic text-center">
                  Most people lose interviews <strong>without ever knowing why</strong>. We make sure that doesn't happen to you.
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                    alt="LinkedIn Business Meeting"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do Differently */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Do Differently at CareerSasa</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-12 translate-x-12 blur-xl opacity-50"></div>
              <div className="relative z-10">
                <div className="flex items-start mb-6">
                  <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                  <span className="font-semibold text-gray-800">Career-focused, not generic marketing</span>
                </div>
                <div className="flex items-start mb-6">
                  <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                  <span className="font-semibold text-gray-800">Industry-specific optimization (QA, Engineering, Biopharma, FMCG, Finance, HR & more)</span>
                </div>
                <div className="flex items-start mb-6">
                  <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                  <span className="font-semibold text-gray-800">Recruiter-oriented writing style</span>
                </div>
                <div className="flex items-start mb-6">
                  <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                  <span className="font-semibold text-gray-800">Practical strategies, not theory</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                  <span className="font-semibold text-gray-800">Trusted career platform in Kenya & East Africa</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full -translate-x-16 -translate-y-16 blur-xl opacity-30"></div>
              <div className="relative z-10">
                <div className="flex flex-col h-full justify-center">
                  <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 mx-auto">
                      <span className="text-2xl text-white">🎯</span>
                    </div>
                    <p className="text-gray-700 mb-6 text-lg">
                      We don't chase likes. We build <strong>career relevance and visibility</strong>.
                    </p>
                  </div>
                  <Link href="https://wa.me/254795564135" target="_blank">
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 w-full text-white text-lg py-6">
                      Chat with Us on WhatsApp
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Pricing Table */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our LinkedIn Services</h2>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {services.map((service, index) => {
                  const colors = [
                    { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', icon: '🔍' },
                    { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', icon: '✍️' },
                    { bg: 'from-purple-50 to-violet-50', border: 'border-purple-200', icon: '📄' },
                    { bg: 'from-pink-50 to-rose-50', border: 'border-pink-200', icon: '🌟' },
                    { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', icon: '📈' }
                  ];
                  
                  const color = colors[index % colors.length];
                  
                  return (
                    <div 
                      key={service.id}
                      className={`relative bg-gradient-to-br ${color.bg} border-2 ${color.border} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full`}
                    >
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-3">{color.icon}</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title.substring(service.title.indexOf(' ') + 1)}</h3>
                        <p className="text-sm text-gray-600 mb-4">{service.subtitle}</p>
                      </div>
                      
                      <div className="flex-grow mb-4">
                        <ul className="space-y-2 text-sm">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-600 mr-2 mt-0.5 flex-shrink-0">✓</span>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-auto">
                        <p className="text-xs text-gray-500 italic mb-3 text-center">{service.bestFor}</p>
                        <div className="bg-white rounded-lg p-3 mb-3 text-center">
                          <span className="font-bold text-xl text-primary">{service.price}</span>
                        </div>
                        <Link href={`https://wa.me/254795564135?text=${encodeURIComponent(service.whatsappMessage)}`} target="_blank" className="block">
                          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                            Get Started
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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

            <div className="text-center">
              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full mb-6">
                <span className="text-lg mr-2">💰</span>
                <span className="font-semibold">Custom pricing based on scope and duration</span>
              </div>
              <Link href="https://wa.me/254795564135?text=Hi,%20I'm%20interested%20in%20a%20custom%20LinkedIn%20solution." target="_blank">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl font-semibold rounded-xl transition-all duration-200 transform hover:scale-105">
                  <span className="hidden sm:inline">👉 Get a custom LinkedIn solution</span>
                  <span className="sm:hidden">Get custom solution</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Target Audience */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Who These Services Are For</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              "Students & fresh graduates",
              "Job seekers & career switchers",
              "Professionals seeking promotion",
              "Managers & senior leaders",
              "Consultants & founders"
            ].map((audience, idx) => (
              <div key={idx} className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-6 py-3 rounded-full border border-green-200 flex items-center">
                <span className="mr-2">✅</span>{audience}
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto">
            <div className="flex-1">
              <p className="text-center text-lg text-gray-700">
                If LinkedIn affects your career — this is for you.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80" 
                  alt="Professional Success"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="mb-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-blue-200/20 rounded-full -translate-x-20 -translate-y-20 blur-xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-200/20 rounded-full translate-x-20 translate-y-20 blur-xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="text-center relative group">
                  <div className="bg-gradient-to-br from-primary to-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                    {step}
                  </div>
                  <p className="text-gray-700 mb-4">
                    {step === 1 && "Choose a service or bundle"}
                    {step === 2 && "Complete a short onboarding form"}
                    {step === 3 && "We optimize, position, and manage your LinkedIn"}
                    {step === 4 && "You get visibility, confidence, and opportunities"}
                  </p>
                  {step === 1 && (
                    <div className="mx-auto w-16 h-16 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                      <img 
                        src="https://images.unsplash.com/photo-1611944212129-29977ae1398c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80" 
                        alt="Choose service"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {step === 2 && (
                    <div className="mx-auto w-16 h-16 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                        alt="Onboarding form"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {step === 3 && (
                    <div className="mx-auto w-16 h-16 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                      <img 
                        src="https://images.unsplash.com/photo-1611944212129-29977ae1398c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80" 
                        alt="LinkedIn optimization"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {step === 4 && (
                    <div className="mx-auto w-16 h-16 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                      <img 
                        src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80" 
                        alt="Success"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/10 rounded-full translate-x-32 translate-y-32 blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Be Seen for the Right Reasons?</h2>
            <p className="text-xl mb-8">
              Don't let a weak LinkedIn profile cost you interviews, promotions, or credibility.
            </p>
            <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
              <Link href="https://wa.me/254795564135?text=Hi,%20I'd%20like%20to%20choose%20a%20LinkedIn%20service%20today!" target="_blank">
                <Button className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-10 py-4 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
                  👉 Choose a LinkedIn service today
                </Button>
              </Link>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-white mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80" 
                    alt="LinkedIn Success"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-white text-lg">
                  ⏳ <em>Limited optimization & management slots available each month</em>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      </div>
    </>
  );
}