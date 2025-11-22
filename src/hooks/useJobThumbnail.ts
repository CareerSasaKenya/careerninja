import { useState, useCallback } from 'react';
import { JobThumbnailData } from '@/lib/thumbnailUtils';
import healthcareImg from '@/assets/job-thumbnails/healthcare-professional.jpg';
import technologyImg from '@/assets/job-thumbnails/technology-professional.jpg';
import educationImg from '@/assets/job-thumbnails/education-professional.jpg';
import financeImg from '@/assets/job-thumbnails/finance-professional.jpg';
import hospitalityImg from '@/assets/job-thumbnails/hospitality-professional.jpg';
import agricultureImg from '@/assets/job-thumbnails/agriculture-professional.jpg';
import constructionImg from '@/assets/job-thumbnails/construction-professional.jpg';
import retailImg from '@/assets/job-thumbnails/retail-professional.jpg';
import governmentImg from '@/assets/job-thumbnails/government-professional.jpg';
import creativeImg from '@/assets/job-thumbnails/creative-professional.jpg';
import professionalImg from '@/assets/job-thumbnails/professional-default.jpg';

interface UseJobThumbnailReturn {
  generateThumbnail: (data: JobThumbnailData) => Promise<Blob | null>;
  isGenerating: boolean;
  error: string | null;
}

// Map of job categories to professional model images
// All images feature Black/African professionals as required
const MODEL_IMAGES: Record<string, any> = {
  healthcare: healthcareImg,
  technology: technologyImg,
  education: educationImg,
  finance: financeImg,
  hospitality: hospitalityImg,
  agriculture: agricultureImg,
  construction: constructionImg,
  retail: retailImg,
  government: governmentImg,
  creative: creativeImg,
  professional: professionalImg,
};

// Enhanced function to determine which model image to use based on job title and industry
// Updated to better reflect Kenyan/African professionals and ensure all images feature Black/African professionals
const getModelForJob = (jobTitle: string, company: string): string => {
  const combined = `${jobTitle} ${company}`.toLowerCase();
  
  // NGO/Non-profit sector - common in Kenya (check first to avoid conflicts)
  if (combined.includes('ngo') || combined.includes('non profit') || combined.includes('charity') ||
      combined.includes('foundation') || combined.includes('humanitarian') || combined.includes('community') ||
      combined.includes('development') || combined.includes('advocacy') || combined.includes('social work')) {
    return 'professional'; // Using default professional image for NGO sector
  }
  
  // Government/Public Service - civil servants, police, military
  if (combined.includes('government') || combined.includes('county') || combined.includes('public') || 
      combined.includes('civil service') || combined.includes('ministry') || combined.includes('military') ||
      combined.includes('police') || combined.includes('firefighter') || combined.includes('officer') ||
      combined.includes('administration') || combined.includes('parliament') || combined.includes('judiciary') ||
      combined.includes('senate') || combined.includes('assembly')) {
    return 'government';
  }
  
  // Education - teachers, professors, academic roles
  if (combined.includes('teacher') || combined.includes('educator') || combined.includes('school') || 
      combined.includes('professor') || combined.includes('academic') || combined.includes('lecturer') ||
      combined.includes('tutor') || combined.includes('trainer') || combined.includes('instruction') ||
      combined.includes('research') || combined.includes('university') || combined.includes('college') ||
      combined.includes('kindergarten') || combined.includes('tuition')) {
    return 'education';
  }
  
  // Healthcare - doctors, nurses, medical professionals
  if (combined.includes('doctor') || combined.includes('nurse') || combined.includes('medical') || 
      combined.includes('health') || combined.includes('clinical') || combined.includes('physician') ||
      combined.includes('surgeon') || combined.includes('pharmacist') || combined.includes('therapy') ||
      combined.includes('hospital') || combined.includes('clinic') || combined.includes('dentist') ||
      combined.includes('veterinary') || combined.includes('optometrist')) {
    return 'healthcare';
  }
  
  // Technology - developers, engineers, IT professionals
  if (combined.includes('developer') || combined.includes('engineer') || combined.includes('software') || 
      combined.includes('tech') || combined.includes('programmer') || combined.includes('it ') ||
      combined.includes('data') || combined.includes('analyst') || combined.includes('cyber') ||
      combined.includes('web') || combined.includes('frontend') || combined.includes('backend') ||
      combined.includes('fullstack') || combined.includes('devops') || combined.includes('cloud') ||
      combined.includes('ai') || combined.includes('machine learning') || combined.includes('blockchain') ||
      combined.includes('network') || combined.includes('database') || combined.includes('systems')) {
    return 'technology';
  }
  
  // Finance - accountants, bankers, financial analysts
  // Check for finance terms but exclude cases that might conflict with technology
  if ((combined.includes('finance') || combined.includes('accountant') || combined.includes('bank') || 
      combined.includes('auditor') || combined.includes('investment') ||
      combined.includes('financial') || combined.includes('insurance') || combined.includes('tax') ||
      combined.includes('wealth') || combined.includes('credit') || combined.includes('loan') ||
      combined.includes('broker') || combined.includes('trading') || combined.includes('stock')) &&
      !combined.includes('data analyst')) {
    return 'finance';
  }
  
  // Hospitality - hotel staff, restaurant workers, tourism
  // Check for hospitality terms but exclude cases that might conflict with creative
  if ((combined.includes('hotel') || combined.includes('restaurant') || combined.includes('chef') || 
      combined.includes('hospitality') || combined.includes('tourism') || combined.includes('catering') ||
      combined.includes('waiter') || combined.includes('bartender') || combined.includes('cook') ||
      combined.includes('barista') || combined.includes('lodging') || combined.includes('travel') ||
      combined.includes('resort') || combined.includes('cafe')) &&
      !combined.includes('tour guide') && !combined.includes('kenya wildlife service')) {
    return 'hospitality';
  }
  
  // Agriculture - farmers, agronomists, livestock workers
  // Check for agriculture terms but exclude cases that might conflict with government
  if ((combined.includes('farm') || combined.includes('agriculture') || combined.includes('crop') || 
      combined.includes('livestock') || combined.includes('agri') || combined.includes('farming') ||
      combined.includes('ranch') || combined.includes('agronomist') || combined.includes('horticulture') ||
      combined.includes('fisheries') || combined.includes('forestry') || combined.includes('dairy') ||
      combined.includes('tea') || combined.includes('coffee') || combined.includes('maize') ||
      combined.includes('wheat') || combined.includes('sugarcane')) &&
      !combined.includes('ministry of agriculture') && !combined.includes('fisheries officer')) {
    return 'agriculture';
  }
  
  // Construction - builders, architects, civil engineers
  // Check for construction terms but exclude cases that might conflict with technology
  if ((combined.includes('construction') || combined.includes('architect') || combined.includes('civil') || 
      combined.includes('builder') || combined.includes('contractor') || combined.includes('surveyor') ||
      combined.includes('foreman') || combined.includes('welding') ||
      combined.includes('mechanical') || combined.includes('electrician') || combined.includes('plumber') ||
      combined.includes('carpenter') || combined.includes('mason') || combined.includes('painter') ||
      combined.includes('roofer') || combined.includes('tiler')) &&
      !combined.includes('civil engineer') && !combined.includes('data')) {
    return 'construction';
  }
  
  // Retail - salespeople, shop workers, customer service
  if (combined.includes('sales') || combined.includes('retail') || combined.includes('shop') || 
      combined.includes('store') || combined.includes('customer service') || combined.includes('cashier') ||
      combined.includes('merchandiser') || combined.includes('clerk') || combined.includes('associate') ||
      combined.includes('market') || combined.includes('mall') || combined.includes('boutique')) {
    return 'retail';
  }
  
  // Creative/Design - designers, artists, marketers
  if (combined.includes('designer') || combined.includes('creative') || combined.includes('artist') || 
      combined.includes('graphic') || combined.includes('marketing') || combined.includes('brand') ||
      combined.includes('ui') || combined.includes('ux') || combined.includes('media') ||
      combined.includes('content') || combined.includes('writer') || combined.includes('photographer') ||
      combined.includes('music') || combined.includes('film') || combined.includes('video') ||
      combined.includes('advertising') || combined.includes('pr ') || combined.includes('public relations')) {
    return 'creative';
  }
  
  return 'professional';
};

/**
 * Hook for generating job thumbnails with industry-specific images and brand colors
 */
export { getModelForJob };

export const useJobThumbnail = (): UseJobThumbnailReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const drawDecorativeElements = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Draw circles for decoration
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, 80, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.7, 60, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();

    // Draw diagonal lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.3);
    ctx.lineTo(width * 0.3, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width, height * 0.7);
    ctx.lineTo(width * 0.7, height);
    ctx.stroke();
  };

  const drawTextContent = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    jobTitle: string,
    company: string,
    location: string
  ) => {
    // Save the current context state
    ctx.save();
    
    // Configure text styles
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Draw job title with better positioning
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'white';
    
    // Wrap job title if too long
    const maxTitleWidth = width * 0.5;
    const wrappedTitle = wrapText(ctx, jobTitle, maxTitleWidth);
    let yPos = height * 0.3;
    
    // Draw each line of the wrapped title
    wrappedTitle.forEach((line, index) => {
      ctx.fillText(line, width * 0.1, yPos + (index * 55));
    });
    
    // Draw company name
    ctx.font = '36px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    yPos += wrappedTitle.length * 55 + 30;
    ctx.fillText(company, width * 0.1, yPos);
    
    // Draw location
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    yPos += 50;
    ctx.fillText(location, width * 0.1, yPos);
    
    // Draw branding
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('CareerSasa.co.ke', width * 0.1, height * 0.9);
    
    // Draw "Apply Now" button
    drawApplyButton(ctx, width, height);
    
    // Restore the context state
    ctx.restore();
  };

  const drawLogoPlaceholder = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Draw a simple logo placeholder in the top right
    const logoSize = 80;
    const x = width * 0.85;
    const y = height * 0.1;
    
    // Circle background
    ctx.beginPath();
    ctx.arc(x + logoSize/2, y + logoSize/2, logoSize/2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    
    // Letter "C" to represent CareerSasa
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('C', x + logoSize/2, y + logoSize/2);
  };

  const drawApplyButton = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Draw "Apply Now" button
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = width * 0.1;
    const buttonY = height * 0.75;
    
    // Button background with brand colors
    const gradient = ctx.createLinearGradient(buttonX, buttonY, buttonX + buttonWidth, buttonY + buttonHeight);
    gradient.addColorStop(0, 'hsl(262 83% 58%)'); // Primary purple
    gradient.addColorStop(1, 'hsl(199 89% 48%)'); // Accent blue
    
    // Add shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    const radius = 8;
    ctx.moveTo(buttonX + radius, buttonY);
    ctx.lineTo(buttonX + buttonWidth - radius, buttonY);
    ctx.quadraticCurveTo(buttonX + buttonWidth, buttonY, buttonX + buttonWidth, buttonY + radius);
    ctx.lineTo(buttonX + buttonWidth, buttonY + buttonHeight - radius);
    ctx.quadraticCurveTo(buttonX + buttonWidth, buttonY + buttonHeight, buttonX + buttonWidth - radius, buttonY + buttonHeight);
    ctx.lineTo(buttonX + radius, buttonY + buttonHeight);
    ctx.quadraticCurveTo(buttonX, buttonY + buttonHeight, buttonX, buttonY + buttonHeight - radius);
    ctx.lineTo(buttonX, buttonY + radius);
    ctx.quadraticCurveTo(buttonX, buttonY, buttonX + radius, buttonY);
    ctx.closePath();
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    
    // Button text
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Apply Now', buttonX + buttonWidth/2, buttonY + buttonHeight/2);
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const generateThumbnail = useCallback(async (data: JobThumbnailData): Promise<Blob | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background gradient (using brand colors)
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'hsl(262 83% 58%)'); // Primary purple
      gradient.addColorStop(1, 'hsl(199 89% 48%)'); // Accent blue
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add overlay for better text visibility
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Reset any shadow effects for other elements
      ctx.shadowColor = 'transparent';
      
      // Draw decorative elements
      drawDecorativeElements(ctx, canvas.width, canvas.height);
      
      // Load and draw professional image based on industry
      const category = getModelForJob(data.jobTitle, data.company);
      const imageUrl = MODEL_IMAGES[category];
      
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageUrl;
        });
        
        // Draw the professional image on the right side with better positioning
        const imgWidth = canvas.width * 0.4;
        const imgHeight = canvas.height * 0.7;
        const imgX = canvas.width * 0.55;
        const imgY = canvas.height * 0.15;
        
        // Apply a subtle shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        // Draw rounded rectangle clip path for better presentation
        ctx.save();
        ctx.beginPath();
        const radius = 25;
        ctx.moveTo(imgX + radius, imgY);
        ctx.lineTo(imgX + imgWidth - radius, imgY);
        ctx.quadraticCurveTo(imgX + imgWidth, imgY, imgX + imgWidth, imgY + radius);
        ctx.lineTo(imgX + imgWidth, imgY + imgHeight - radius);
        ctx.quadraticCurveTo(imgX + imgWidth, imgY + imgHeight, imgX + imgWidth - radius, imgY + imgHeight);
        ctx.lineTo(imgX + radius, imgY + imgHeight);
        ctx.quadraticCurveTo(imgX, imgY + imgHeight, imgX, imgY + imgHeight - radius);
        ctx.lineTo(imgX, imgY + radius);
        ctx.quadraticCurveTo(imgX, imgY, imgX + radius, imgY);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
        ctx.restore();
      } catch (error) {
        console.warn('Failed to load professional image, continuing without it:', error);
      }
      
      // Draw text content with improved positioning and no duplication
      drawTextContent(ctx, canvas.width, canvas.height, data.jobTitle, data.company, data.location);
      
      // Draw logo placeholder
      drawLogoPlaceholder(ctx, canvas.width, canvas.height);
      
      // Convert to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        }, 'image/png');
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate thumbnail';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [drawTextContent]); // Added drawTextContent as dependency

  return {
    generateThumbnail,
    isGenerating,
    error
  };
};