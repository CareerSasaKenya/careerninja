'use client';

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Linkedin, Mail, Sparkles } from "lucide-react";

export default function ServiceAdvertisement() {
  const services = [
    {
      number: 1,
      icon: <FileText className="h-5 w-5 text-primary" />,
      question: "Need a professional CV that stands out?",
      description: "Get expert help crafting a CV that gets you noticed.",
      linkText: "Build Your Perfect CV",
      href: "/services/cv"
    },
    {
      number: 2,
      icon: <Mail className="h-5 w-5 text-primary" />,
      question: "Want a compelling cover letter for this role?",
      description: "Let us help you write a personalized cover letter that impresses.",
      linkText: "Create Your Cover Letter",
      href: "/services/cover-letter"
    },
    {
      number: 3,
      icon: <Linkedin className="h-5 w-5 text-primary" />,
      question: "Looking to optimize your LinkedIn profile?",
      description: "Boost your professional presence and attract recruiters.",
      linkText: "Enhance Your LinkedIn Profile",
      href: "/services/linkedin"
    }
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Boost Your Application Success
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {services.map((service) => (
            <li key={service.number} className="flex gap-3">
              <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold mt-0.5">
                {service.number}
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-1">
                  {service.icon}
                  <p className="font-semibold text-foreground">{service.question}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {service.description}{" "}
                  <Link 
                    href={service.href} 
                    className="text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors"
                  >
                    {service.linkText}
                  </Link>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
