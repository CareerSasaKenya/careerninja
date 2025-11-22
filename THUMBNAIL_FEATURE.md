# Job Thumbnail Generator Feature

## Overview
The Job Thumbnail Generator is a dynamic feature that creates branded social media thumbnails for job postings. Each thumbnail maintains consistent brand colors while displaying job-specific information including the job title, company name, and location. The system also intelligently selects an appropriate African model image based on the job category.

## Features
1. **Dynamic Generation**: Thumbnails are generated in real-time based on job data
2. **Brand Consistency**: Uses CareerSasa's brand colors (purple to teal gradient)
3. **Job-Specific Content**: Displays job title, company, and location
4. **Contextual Models**: Selects appropriate African model images based on job category
5. **Social Media Optimization**: Generates 1200x630px images (Open Graph standard)
6. **Download Capability**: Users can download thumbnails for sharing

## How It Works

### 1. Automatic Detection
The system automatically detects the job category based on keywords in the job title and company name:
- Healthcare (doctor, nurse, medical, etc.)
- Technology (developer, engineer, software, etc.)
- Education (teacher, educator, school, etc.)
- Finance (finance, accountant, bank, etc.)
- Hospitality (hotel, restaurant, chef, etc.)
- Agriculture (farm, agriculture, crop, etc.)
- Construction (construction, architect, civil, etc.)
- Retail (sales, retail, shop, etc.)
- Government (government, county, public, etc.)
- Creative (designer, creative, artist, etc.)
- Professional (default category)

### 2. Image Generation
The thumbnail is generated using HTML5 Canvas with the following elements:
- Gradient background using brand colors
- Contextual African model image on the right side
- Job title, company name, and location on the left
- CareerSasa branding
- Decorative elements for visual appeal

### 3. Integration Points
- **Job Details Page**: Automatically generates and displays thumbnail
- **Share Functionality**: Updates Open Graph tags for social sharing
- **Download Button**: Allows users to download the thumbnail

## Components

### JobThumbnailGenerator
Main component that generates the thumbnail using Canvas API.

### JobThumbnailPreview
UI component that allows users to preview and download thumbnails.

### useJobThumbnail
React hook for generating thumbnails programmatically.

### thumbnailUtils
Utility functions for filename generation and blob handling.

## Usage

### In Job Details Page
The thumbnail is automatically generated when viewing a job details page. Users can download it using the "Download Thumbnail" button in the share section.

### Custom Implementation
To generate a thumbnail programmatically:
```typescript
import { useJobThumbnail } from '@/hooks/useJobThumbnail';
import { generateThumbnailFilename, downloadBlob } from '@/lib/thumbnailUtils';

const { generateThumbnail, isGenerating, error } = useJobThumbnail();

const handleGenerateThumbnail = async () => {
  const jobData = {
    jobTitle: "Software Engineer",
    company: "TechCorp Ltd",
    location: "Nairobi, Kenya",
    jobId: "job-123"
  };
  
  const blob = await generateThumbnail(jobData);
  if (blob) {
    const filename = generateThumbnailFilename(jobData.jobTitle, jobData.company);
    downloadBlob(blob, filename);
  }
};
```

## Customization

### Brand Colors
To change the brand colors, modify the gradient in the thumbnail generator:
```typescript
// In JobThumbnailGenerator.tsx
const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, 'hsl(262 83% 58%)'); // Primary color
gradient.addColorStop(1, 'hsl(199 89% 48%)'); // Accent color
```

### Model Images
To update model images, modify the MODEL_IMAGES constant:
```typescript
const MODEL_IMAGES: Record<string, string> = {
  healthcare: 'NEW_IMAGE_URL',
  // ... other categories
};
```

### Job Category Detection
To add new job categories, extend the getModelForJob function:
```typescript
const getModelForJob = (jobTitle: string, company: string): string => {
  // Add new category detection logic here
};
```

## Technical Details

### Canvas Dimensions
- Width: 1200px
- Height: 630px
- Format: PNG

### Text Styling
- Font: system-ui, -apple-system, sans-serif
- Job Title: 48px bold white
- Company: 36px light white
- Location: 28px lighter white
- Branding: 24px bold semi-transparent white

### Performance
- Thumbnails are generated client-side using Canvas API
- Model images are loaded asynchronously
- Failed image loads gracefully fall back to text-only thumbnails

## Troubleshooting

### Thumbnail Not Generating
1. Check browser console for Canvas errors
2. Verify job data is being passed correctly
3. Ensure the component is mounted before generation

### Model Images Not Loading
1. Check network tab for image loading errors
2. Verify image URLs are accessible
3. Confirm CORS settings for external images

### Download Issues
1. Ensure browser supports Blob URLs
2. Check for ad blockers that might interfere
3. Verify file save permissions