"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import WhatsAppButton from "@/components/WhatsAppButton";
import Navbar from "@/components/Navbar";
import { usePageContent, getContentValue } from "@/hooks/usePageContent";

export default function LinkedInServicesPage() {
  // Fetch CMS content
  const { data: content } = usePageContent("services-linkedin");

  // Get content values with fallbacks
  const heroTitle = getContentValue(content, "hero_title", "Recruiters Google You Before They Call. What Do They Find?");
  const heroSubtitle = getContentValue(content, "hero_subtitle", "Your LinkedIn profile is the interview filter most people don't know is working against them");
  const heroDescription1 = getContentValue(content, "hero_description_1", "Before a recruiter calls you, they search your LinkedIn. Before a hiring manager schedules an interview, they compare your CV to your profile. If your LinkedIn is weak, outdated, or doesn't match your CV, you've lost the interview before it started.");
  const heroDescription2 = getContentValue(content, "hero_description_2", "At CareerSasa, we help students, job seekers, professionals, and executives use LinkedIn strategically: not as a digital CV, but as a recruiter magnet that gets you found, verified, and contacted for opportunities.");
  const heroDescription3 = getContentValue(content, "hero_description_3", "Whether you want a better job, career growth, or professional visibility, our LinkedIn services are built for the Kenyan and East African job market, not generic social media advice.");

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
                {heroTitle}
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
                {heroSubtitle}
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                {heroDescription1}
              </p>
              <p className="text-lg text-gray-600 mb-4">
                {heroDescription2}
              </p>
              <p className="text-lg text-gray-600">
                {heroDescription3}
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">The LinkedIn Problem That's Silently Costing You Jobs</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-3">•</span>
                    <span className="text-gray-700"><strong>87% of recruiters use LinkedIn to vet candidates before making a call — if your profile is weak, they move to the next person</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-3">•</span>
                    <span className="text-gray-700"><strong>Hiring managers Google you — and your LinkedIn is the first thing they see. A blank or outdated profile signals disinterest</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-3">•</span>
                    <span className="text-gray-700"><strong>If your CV says one thing and your LinkedIn says another, recruiters question your credibility — and quietly reject you</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-3">•</span>
                    <span className="text-gray-700"><strong>A weak LinkedIn profile blocks opportunities you never even see — recruiters find other people instead</strong></span>
                  </li>
                </ul>
                <p className="text-lg text-gray-700 mt-6 italic text-center">
                  Most people lose interviews without ever knowing why. Often, their LinkedIn profile told a different story than their CV. We fix that.
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why CareerSasa LinkedIn Services Actually Work</h2>
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
                  <span className="font-semibold text-gray-800">Built for Kenya's job market — not generic LinkedIn advice from overseas</span>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Who These Services Are For</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            LinkedIn isn't optional anymore. It's where recruiters search, where hiring managers verify you, and where opportunities find you — if your profile is ready.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Students & Fresh Graduates */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full border border-green-200 flex items-center">
                  <span className="mr-2">✅</span>
                  <span className="font-semibold">Students & Fresh Graduates</span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                You're building your professional presence from scratch, and your LinkedIn profile is often the first thing recruiters see. We help you create a profile that positions you as career-ready — highlighting internships, projects, and skills in a way that shows potential, not just inexperience. Start your career with a profile that opens doors.
              </p>
            </div>

            {/* Job Seekers & Career Switchers */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 px-4 py-2 rounded-full border border-blue-200 flex items-center">
                  <span className="mr-2">✅</span>
                  <span className="font-semibold">Job Seekers & Career Switchers</span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                You're actively job hunting, but your LinkedIn profile isn't helping. Maybe it's outdated, generic, or doesn't match your CV. Recruiters are searching for people like you — but they're not finding you. We optimize your profile for recruiter searches, align it with your CV, and position you as the candidate they're looking for.
              </p>
            </div>

            {/* Professionals Seeking Promotion */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 px-4 py-2 rounded-full border border-purple-200 flex items-center">
                  <span className="mr-2">✅</span>
                  <span className="font-semibold">Professionals Seeking Promotion</span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                You've grown in your career, but your LinkedIn still reads like your first job. To attract senior opportunities, you need a profile that reflects leadership, impact, and industry credibility. We reposition your profile to show you're ready for the next level — not stuck at the current one.
              </p>
            </div>

            {/* Managers & Senior Leaders */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-4 py-2 rounded-full border border-orange-200 flex items-center">
                  <span className="mr-2">✅</span>
                  <span className="font-semibold">Managers & Senior Leaders</span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                At your level, LinkedIn is more than a profile — it's your professional brand. Executive recruiters, board members, and industry peers are watching. We optimize your profile for authority, manage your content strategy, and position you as a thought leader in your field. Your LinkedIn should reflect the influence you've built.
              </p>
            </div>

            {/* Consultants & Founders */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 px-4 py-2 rounded-full border border-pink-200 flex items-center">
                  <span className="mr-2">✅</span>
                  <span className="font-semibold">Consultants & Founders</span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Your LinkedIn isn't just about jobs — it's about clients, partnerships, and visibility. You need a profile that builds trust, demonstrates expertise, and attracts the right opportunities. We help you position yourself as an authority, manage your content, and turn LinkedIn into a business development tool that works while you sleep.
              </p>
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
        <section className="mb-16 bg-gradient-to-br from-blue-600 via-blue-500 to-orange-500 rounded-2xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/10 rounded-full translate-x-32 translate-y-32 blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Be Found for the Right Reasons?</h2>
            <p className="text-xl mb-4">
              Right now, a recruiter might be searching for someone exactly like you, but finding your competitor instead. Their LinkedIn is optimized and yours isn't.
            </p>
            <p className="text-lg mb-8 opacity-90">
              Our clients report more recruiter messages, more profile views, and stronger interview callbacks within 30 days of a CareerSasa LinkedIn optimization.
            </p>
            <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
              <Link href="https://wa.me/254795564135?text=Hi,%20I'd%20like%20to%20choose%20a%20LinkedIn%20service%20today!" target="_blank">
                <Button className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-10 py-4 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
                  Yes, I'm Ready!
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