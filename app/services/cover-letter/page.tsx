"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import WhatsAppButton from "@/components/WhatsAppButton";
import Navbar from "@/components/Navbar";

export default function CoverLetterServicesPage() {
  const services = [
    {
      id: "professional",
      title: "✍️ Professional Cover Letter Writing",
      subtitle: "Clear, tailored, and compelling",
      features: [
        "Fully written cover letter from scratch",
        "Customized to a specific job or role",
        "Professional tone and structure",
        "Strong opening lines that grab attention",
        "Achievement-focused content"
      ],
      bestFor: "Best for most job seekers",
      price: "KES 2,500 – 4,000",
      whatsappMessage: "Hi, I'm interested in the Professional Cover Letter Writing service."
    },
    {
      id: "graduate",
      title: "🎓 Graduate & Entry-Level Cover Letters",
      subtitle: "Tell your story, even with limited experience",
      features: [
        "Skills-based approach",
        "Internship, attachment & academic positioning",
        "Confidence without exaggeration",
        "Clear motivation narrative"
      ],
      bestFor: "Best for students & fresh graduates",
      price: "KES 1,500 – 2,500",
      whatsappMessage: "Hi, I'm interested in the Graduate & Entry-Level Cover Letters service."
    },
    {
      id: "transition",
      title: "🔄 Career Transition Cover Letters",
      subtitle: "Change direction without confusing recruiters",
      features: [
        "Clear explanation of career change",
        "Transferable skills highlighted",
        "Strong motivation narrative",
        "Honest, confident positioning"
      ],
      bestFor: "Best for career switchers",
      price: "KES 3,000 – 5,000",
      whatsappMessage: "Hi, I'm interested in the Career Transition Cover Letters service."
    },
    {
      id: "executive",
      title: "📌 Executive & Senior-Level Cover Letters",
      subtitle: "Position yourself as a leader",
      features: [
        "Strategic, impact-focused writing",
        "Leadership & decision-making emphasis",
        "Confidential handling",
        "Board-level positioning"
      ],
      bestFor: "Best for managers & executives",
      price: "KES 5,000 – 8,000",
      whatsappMessage: "Hi, I'm interested in the Executive & Senior-Level Cover Letters service."
    },
    {
      id: "alignment",
      title: "📄 CV + Cover Letter Alignment",
      subtitle: "One clear professional message",
      features: [
        "Cover letter aligned with CV",
        "Consistent tone and positioning",
        "Strong, credible personal narrative",
        "Complementary, not repetitive"
      ],
      bestFor: "Highly recommended",
      price: "KES 2,500 – 4,000",
      whatsappMessage: "Hi, I'm interested in the CV + Cover Letter Alignment service."
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
                Outstanding Cover Letters by <span className="text-primary">CareerSasa</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
                Cover Letters That Get Read 📄✉️
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Your CV shows what you've done. Your cover letter explains <strong>why you're the right fit</strong>.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                At CareerSasa, we write cover letters that connect your experience to the job, speak directly to recruiters, and increase your chances of getting shortlisted.
              </p>
              <p className="text-lg text-gray-600">
                Whether you're applying for your first job or a senior role, our cover letter services help your application stand out — for the right reasons.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-lg">
                <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl overflow-hidden shadow-xl border-8 border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                    alt="Professional Cover Letter Writing"
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

        {/* Why Cover Letters Matter */}
        <section className="mb-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -translate-y-16 translate-x-16 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-200/30 rounded-full translate-y-20 -translate-x-20 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8 max-w-6xl mx-auto">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Cover Letters Still Matter</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-3">•</span>
                    <span className="text-gray-700"><strong>Many recruiters read cover letters for serious roles</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-3">•</span>
                    <span className="text-gray-700"><strong>Cover letters explain career gaps and transitions</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-3">•</span>
                    <span className="text-gray-700"><strong>They show motivation, clarity, and communication skills</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-3">•</span>
                    <span className="text-gray-700"><strong>A generic cover letter can hurt a strong CV</strong></span>
                  </li>
                </ul>
                <p className="text-lg text-gray-700 mt-6 italic text-center">
                  When required, a weak cover letter can cost you an interview. We make sure yours strengthens your application.
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                    alt="Cover Letter Review"
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
                  <span className="font-semibold text-gray-800">Job-specific, not generic templates</span>
                </div>
                <div className="flex items-start mb-6">
                  <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                  <span className="font-semibold text-gray-800">Recruiter-focused writing</span>
                </div>
                <div className="flex items-start mb-6">
                  <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                  <span className="font-semibold text-gray-800">Clear structure and strong opening lines</span>
                </div>
                <div className="flex items-start mb-6">
                  <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                  <span className="font-semibold text-gray-800">Honest, confident positioning</span>
                </div>
                <div className="flex items-start mb-6">
                  <span className="text-green-600 font-bold mr-3 text-xl">✔</span>
                  <span className="font-semibold text-gray-800">Aligned with your CV and LinkedIn profile</span>
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
                      <span className="text-2xl text-white">✉️</span>
                    </div>
                    <p className="text-gray-700 mb-6 text-lg">
                      We don't repeat your CV. We explain your value.
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Cover Letter Services</h2>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {services.map((service, index) => {
                  const colors = [
                    { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', icon: '✍️' },
                    { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', icon: '🎓' },
                    { bg: 'from-purple-50 to-violet-50', border: 'border-purple-200', icon: '🔄' },
                    { bg: 'from-pink-50 to-rose-50', border: 'border-pink-200', icon: '📌' },
                    { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', icon: '📄' }
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Custom Cover Letter Solutions</h2>
              <h3 className="text-xl font-semibold text-gray-700">Need Something More Specific? Let's Build It Together.</h3>
            </div>
            
            <div className="text-center mb-8 max-w-3xl mx-auto">
              <p className="text-gray-700 mb-4">
                Some applications require special handling — international roles, confidential searches, scholarships, fellowships, or highly technical positions.
              </p>
              <p className="text-gray-700">
                That's why we offer <strong>Custom Cover Letter Packages</strong>, tailored to your exact needs.
              </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 mb-6 border border-white/30">
              <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center">Custom solutions may include:</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">International job or scholarship applications</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Technical or academic cover letters</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Confidential job search support</span>
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Employer- or institution-specific requirements</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Fellowship or grant applications</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Multiple cover letters for different industries</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full mb-6">
                <span className="text-lg mr-2">💰</span>
                <span className="font-semibold">Custom pricing based on scope</span>
              </div>
              <Link href="https://wa.me/254795564135?text=Hi,%20I'm%20interested%20in%20a%20custom%20cover%20letter%20solution." target="_blank">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl font-semibold rounded-xl transition-all duration-200 transform hover:scale-105">
                  <span className="hidden sm:inline">👉 Get a custom cover letter solution</span>
                  <span className="sm:hidden">Get custom solution</span>
                </Button>
              </Link>
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
                    {step === 1 && "Choose a cover letter service"}
                    {step === 2 && "Share the job details and your CV"}
                    {step === 3 && "We write and refine your cover letter"}
                    {step === 4 && "You receive a ready-to-send document"}
                  </p>
                  {step === 1 && (
                    <div className="mx-auto w-16 h-16 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                      <img 
                        src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                        alt="Choose service"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {step === 2 && (
                    <div className="mx-auto w-16 h-16 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                      <img 
                        src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                        alt="Share details"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {step === 3 && (
                    <div className="mx-auto w-16 h-16 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                      <img 
                        src="https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1473&q=80" 
                        alt="Writing process"
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

        {/* Target Audience */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Who These Services Are For</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            A cover letter isn't just a formality — it's your chance to explain why you're the right fit. We make sure yours strengthens your application, not weakens it.
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
                You're applying for your first real job, and you're not sure what to say beyond "I'm a hard worker." We help you write cover letters that show motivation, highlight relevant skills from internships and projects, and position you as someone ready to learn and contribute — without sounding desperate or generic.
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
                You're applying to roles that require explanation — maybe you're changing industries, have a career gap, or your CV doesn't tell the full story. A strong cover letter bridges that gap. We write letters that clarify your transition, highlight transferable skills, and give recruiters confidence in your fit for the role.
              </p>
            </div>

            {/* Professionals Applying for Competitive Roles */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 px-4 py-2 rounded-full border border-purple-200 flex items-center">
                  <span className="mr-2">✅</span>
                  <span className="font-semibold">Professionals Applying for Competitive Roles</span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                You're competing with dozens of qualified candidates, and a generic cover letter won't cut it. You need a letter that speaks directly to the role, shows you understand the company's needs, and positions you as the solution. We write cover letters that get read — and remembered.
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
                At your level, a cover letter is a strategic positioning tool. It's not about listing achievements — it's about demonstrating leadership, vision, and fit for high-stakes roles. We write executive-level cover letters that reflect your seniority, communicate impact, and open doors to board-level and C-suite opportunities.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-16 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/10 rounded-full translate-x-32 translate-y-32 blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Strengthen Your Applications?</h2>
            <p className="text-xl mb-8">
              Don't let a weak or generic cover letter undermine your CV.
            </p>
            <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
              <Link href="https://wa.me/254795564135?text=Hi,%20I'd%20like%20to%20choose%20a%20cover%20letter%20service%20today!" target="_blank">
                <Button className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-10 py-4 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
                  Yes, I'm Ready!
                </Button>
              </Link>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-white mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                    alt="Cover Letter Success"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-white text-lg">
                  ⏳ <em>Limited writing slots available each week</em>
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
