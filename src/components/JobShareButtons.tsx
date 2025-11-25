'use client';

import { Facebook, Linkedin, Mail, Twitter, MessageSquare, Instagram } from "lucide-react";

interface JobShareButtonsProps {
  jobTitle: string;
}

export default function JobShareButtons({ jobTitle }: JobShareButtonsProps) {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Share:</span>
      <div className="flex flex-wrap gap-2">
        <a 
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#1877F2] hover:bg-[#1877F2]/10 p-2 rounded-full transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook className="h-5 w-5" />
        </a>
        <a 
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#0077B5] hover:bg-[#0077B5]/10 p-2 rounded-full transition-colors"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="h-5 w-5" />
        </a>
        <a 
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(`Check out this job: ${jobTitle}`)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#1DA1F2] hover:bg-[#1DA1F2]/10 p-2 rounded-full transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter className="h-5 w-5" />
        </a>
        <a 
          href={`https://wa.me/?text=${encodeURIComponent(`Check out this job: ${currentUrl}`)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#25D366] hover:bg-[#25D366]/10 p-2 rounded-full transition-colors"
          aria-label="Share on WhatsApp"
        >
          <MessageSquare className="h-5 w-5" />
        </a>
        <a 
          href={`https://www.instagram.com/?url=${encodeURIComponent(currentUrl)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#E1306C] hover:bg-[#E1306C]/10 p-2 rounded-full transition-colors"
          aria-label="Share on Instagram"
        >
          <Instagram className="h-5 w-5" />
        </a>
        <a 
          href={`mailto:?subject=${encodeURIComponent(`Job Opportunity: ${jobTitle}`)}&body=${encodeURIComponent(`Check out this job: ${currentUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:bg-gray-600/10 p-2 rounded-full transition-colors flex items-center justify-center"
          aria-label="Share via Email"
        >
          <Mail className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}
