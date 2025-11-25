'use client';

import { Facebook, Linkedin, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobShareButtonsProps {
  jobTitle: string;
  companyName?: string;
  location?: string;
  jobUrl?: string;
}

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function JobShareButtons({ jobTitle, companyName, location, jobUrl }: JobShareButtonsProps) {
  const currentUrl = jobUrl || (typeof window !== 'undefined' ? window.location.href : '');
  
  // Build share text with job metadata
  const shareTitle = `${jobTitle}${companyName ? ` at ${companyName}` : ''}${location ? ` - ${location}` : ''}`;
  const shareText = `🚀 Job Opportunity: ${shareTitle}\n\nApply now on CareerSasa:`;
  const emailSubject = `Job Opportunity: ${shareTitle}`;
  const emailBody = `Hi,\n\nI found this job opportunity that might interest you:\n\n${shareTitle}\n\nCheck it out here: ${currentUrl}\n\nBest regards`;
  
  const shareButtons = [
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      icon: <Facebook className="h-4 w-4" />,
      color: 'text-[#1877F2] hover:bg-[#1877F2]/10',
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      icon: <Linkedin className="h-4 w-4" />,
      color: 'text-[#0077B5] hover:bg-[#0077B5]/10',
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`,
      icon: <MessageCircle className="h-4 w-4" />,
      color: 'text-[#25D366] hover:bg-[#25D366]/10',
    },
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
      icon: <XIcon className="h-4 w-4" />,
      color: 'text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10',
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
      icon: <Mail className="h-4 w-4" />,
      color: 'text-gray-600 hover:bg-gray-600/10',
    },
  ];

  return (
    <div className="flex items-center gap-1">
      {shareButtons.map((button) => (
        <Button
          key={button.name}
          variant="ghost"
          size="sm"
          asChild
          className={`p-2 h-8 w-8 ${button.color} rounded-full transition-colors`}
        >
          <a
            href={button.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${button.name}`}
            title={`Share on ${button.name}`}
          >
            {button.icon}
          </a>
        </Button>
      ))}
    </div>
  );
}
