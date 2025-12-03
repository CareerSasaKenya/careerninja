# CareerSasa Brand Guide

## Brand Overview

**Brand Name:** CareerSasa  
**Tagline:** Your Career Starts Sasa (Sasa means "now" in Swahili)  
**Mission:** Empowering Kenyan professionals to discover and secure their dream careers  
**Website:** www.careersasa.co.ke

---

## Color Palette

### Primary Colors

#### Primary Blue
- **HEX:** `#0b66c3`
- **RGB:** `rgb(11, 102, 195)`
- **HSL:** `hsl(210, 89%, 40%)`
- **Usage:** Primary buttons, links, headers, brand elements, CTAs
- **CSS Variable:** `--primary`

#### Primary Blue (Light Mode Glow)
- **HSL:** `hsl(210, 89%, 50%)`
- **Usage:** Hover states, glow effects
- **CSS Variable:** `--primary-glow`

#### Primary Blue (Dark Mode)
- **HSL:** `hsl(210, 89%, 50%)`
- **Usage:** Primary color in dark mode for better visibility
- **CSS Variable:** `--primary` (dark mode)

### Secondary Colors

#### Teal/Cyan
- **HEX:** `#0ea5e9`
- **HSL:** `hsl(199, 89%, 48%)`
- **Usage:** Accent elements, secondary CTAs, highlights
- **CSS Variable:** `--accent`

#### Orange
- **HEX:** `#f97316`
- **HSL:** `hsl(25, 95%, 53%)`
- **Usage:** Important actions, notifications, featured badges
- **CSS Variable:** `--secondary`

### Neutral Colors

#### Background (Light Mode)
- **HSL:** `hsl(220, 20%, 98%)`
- **Usage:** Page backgrounds
- **CSS Variable:** `--background`

#### Background (Dark Mode)
- **HSL:** `hsl(222, 47%, 6%)`
- **Usage:** Dark mode page backgrounds
- **CSS Variable:** `--background` (dark mode)

#### Foreground Text (Light Mode)
- **HSL:** `hsl(222, 47%, 11%)`
- **Usage:** Primary text color
- **CSS Variable:** `--foreground`

#### Foreground Text (Dark Mode)
- **HSL:** `hsl(210, 40%, 98%)`
- **Usage:** Dark mode text color
- **CSS Variable:** `--foreground` (dark mode)

#### Muted
- **Light Mode:** `hsl(220, 13%, 95%)`
- **Dark Mode:** `hsl(217, 33%, 17%)`
- **Usage:** Subtle backgrounds, disabled states
- **CSS Variable:** `--muted`

#### Border
- **Light Mode:** `hsl(220, 13%, 91%)`
- **Dark Mode:** `hsl(217, 33%, 17%)`
- **Usage:** Borders, dividers
- **CSS Variable:** `--border`

### Semantic Colors

#### Success Green
- **HSL:** `hsl(142, 76%, 36%)` (light mode)
- **HSL:** `hsl(142, 76%, 45%)` (dark mode)
- **Usage:** Success messages, confirmations
- **CSS Variable:** `--success`

#### Destructive Red
- **HSL:** `hsl(0, 84%, 60%)` (light mode)
- **HSL:** `hsl(0, 63%, 50%)` (dark mode)
- **Usage:** Error messages, delete actions
- **CSS Variable:** `--destructive`

---

## Gradients

### Primary Gradient
```css
linear-gradient(135deg, hsl(210 89% 40%), hsl(199 89% 48%))
```
**Usage:** Hero sections, featured cards, primary backgrounds

### Secondary Gradient
```css
linear-gradient(135deg, hsl(210 89% 40%), hsl(199 89% 55%))
```
**Usage:** Secondary elements, alternative backgrounds

### Hero Gradient
```css
linear-gradient(135deg, hsl(210 89% 40%) 0%, hsl(199 89% 48%) 100%)
```
**Usage:** Main hero sections, landing pages

### Subtle Gradient (Light Mode)
```css
linear-gradient(180deg, hsl(220 20% 98%), hsl(220 13% 95%))
```
**Usage:** Subtle section backgrounds

### Mesh Gradient
```css
radial-gradient(at 40% 20%, hsl(210 89% 40% / 0.3) 0px, transparent 50%),
radial-gradient(at 80% 0%, hsl(199 89% 48% / 0.25) 0px, transparent 50%),
radial-gradient(at 0% 50%, hsl(199 89% 48% / 0.2) 0px, transparent 50%)
```
**Usage:** Background decorative effects

---

## Typography

### Font Family
- **Primary Font:** Inter (Google Fonts)
- **Fallback:** system-ui, -apple-system, sans-serif
- **Implementation:** `font-family: Inter, system-ui, -apple-system, sans-serif`

### Font Sizes

#### Headings
- **H1:** 72px (3xl) - Hero titles
- **H2:** 48px (2xl) - Section headers
- **H3:** 36px (xl) - Subsection headers
- **H4:** 28px (lg) - Card titles

#### Body Text
- **Large:** 42px - Hero subtitles
- **Regular:** 32px - Standard body text in OG images
- **Small:** 24px - Secondary text, captions
- **Extra Small:** 20px - Fine print, labels

#### Buttons
- **Primary CTA:** 32px bold
- **Secondary:** 24px bold
- **Small:** 20px

### Font Weights
- **Bold:** 700 - Headings, CTAs, emphasis
- **Semi-bold:** 600 - Subheadings, important text
- **Regular:** 400 - Body text

---

## Spacing & Layout

### Border Radius
- **Large:** `0.75rem` (12px) - Cards, containers
- **Medium:** `calc(0.75rem - 2px)` - Nested elements
- **Small:** `calc(0.75rem - 4px)` - Buttons, inputs
- **Button Radius:** `12px` - CTA buttons
- **Image Radius:** `25px` - Professional images in thumbnails

### Shadows

#### Standard Shadows
- **Small:** `0 1px 2px 0 hsl(220 13% 91% / 0.5)`
- **Medium:** `0 4px 6px -1px hsl(220 13% 91% / 0.5)`
- **Large:** `0 10px 15px -3px hsl(220 13% 91% / 0.5)`
- **Extra Large:** `0 20px 25px -5px hsl(220 13% 91% / 0.5)`

#### Glow Effects
- **Primary Glow:** `0 0 20px hsl(210 89% 40% / 0.3)`
- **Accent Glow:** `0 0 20px hsl(199 89% 48% / 0.3)`
- **Button Shadow:** `0 8px 16px rgba(0, 0, 0, 0.2)`

### Container Padding
- **Desktop:** 40px
- **Mobile:** 20px

---

## Logo & Branding Elements

### Logo Placeholder
- **Shape:** Circle
- **Background:** Orange (`#f97316`)
- **Letter:** "C" (for CareerSasa)
- **Size:** 80px diameter (standard)
- **Font Size:** 40-48px bold
- **Color:** White

### Brand Tagline
"CareerSasa.co.ke — Enrich Your Career Now"

---

## UI Components

### Buttons

#### Primary Button
- **Background:** Primary gradient or solid primary blue
- **Text Color:** White
- **Font:** Bold, 32px (large CTA) or 24px (standard)
- **Padding:** 20px 40px (large) or 12px 24px (standard)
- **Border Radius:** 12px
- **Shadow:** `0 8px 16px rgba(0, 0, 0, 0.2)`
- **Hover:** Slightly lighter shade or scale effect

#### Secondary Button
- **Background:** Transparent with border
- **Border:** 2px solid primary blue
- **Text Color:** Primary blue
- **Hover:** Filled with primary blue, text turns white

#### Apply Now Button (Featured)
- **Background:** Orange (`#f97316`)
- **Text:** "APPLY NOW" (uppercase)
- **Style:** Bold, prominent, with shadow

### Cards

#### Standard Card
- **Background:** White (light mode) / `hsl(222, 47%, 9%)` (dark mode)
- **Border:** 1px solid border color
- **Border Radius:** 12px
- **Padding:** 24px
- **Shadow:** Medium shadow

#### Glass Card
- **Background:** `bg-card/80` with backdrop blur
- **Border:** `1px solid border/50`
- **Effect:** Glassmorphism

### Decorative Elements

#### Background Circles
- **Color:** `rgba(255, 255, 255, 0.1)`
- **Sizes:** 140px, 100px, 80px, 60px
- **Usage:** Subtle background decoration

#### Diagonal Lines
- **Color:** `rgba(255, 255, 255, 0.05)`
- **Width:** 2px
- **Usage:** Subtle background patterns

---

## Open Graph (OG) Images

### Dimensions
- **Width:** 1200px
- **Height:** 630px

### Layout Structure
1. **Background:** Primary gradient (blue to teal)
2. **Overlay:** `rgba(0, 0, 0, 0.3)` for text contrast
3. **Logo:** Top left (40px from edges)
4. **Job Title:** Top center, 60px bold, white
5. **Company Info:** Left column, starting 220px from top
6. **Professional Image:** Right side (55% from left, 40% width)
7. **CTA Button:** Bottom right, orange background
8. **Branding:** Bottom left, tagline

### Text Hierarchy
- **Job Title:** 60px bold, truncated at 45 characters
- **Company Name:** 36px semi-bold
- **Location:** 32px regular
- **Salary:** 34px semi-bold
- **Job Function:** 32px regular

---

## Animations

### Keyframe Animations

#### Fade In
```css
from: opacity 0, translateY(10px)
to: opacity 1, translateY(0)
duration: 0.6s ease-out
```

#### Slide Up
```css
from: opacity 0, translateY(30px)
to: opacity 1, translateY(0)
duration: 0.6s ease-out
```

#### Scale In
```css
from: opacity 0, scale(0.95)
to: opacity 1, scale(1)
duration: 0.4s ease-out
```

#### Float
```css
0%, 100%: translateY(0px)
50%: translateY(-20px)
duration: 6s ease-in-out infinite
```

---

## Accessibility

### Contrast Ratios
- Primary blue on white: Meets WCAG AA standards
- White text on primary blue: Meets WCAG AAA standards
- All text maintains minimum 4.5:1 contrast ratio

### Focus States
- **Ring Color:** Primary blue
- **Ring Width:** 2px
- **Ring Offset:** 2px

---

## Usage Guidelines

### Do's
✓ Use primary blue for main CTAs and important actions  
✓ Use gradients for hero sections and featured content  
✓ Maintain consistent spacing and border radius  
✓ Use Inter font for all text  
✓ Ensure proper contrast for accessibility  
✓ Use orange sparingly for high-priority actions  

### Don'ts
✗ Don't use colors outside the defined palette  
✗ Don't mix different gradient styles  
✗ Don't use primary blue for destructive actions  
✗ Don't reduce font sizes below minimum for readability  
✗ Don't ignore dark mode color variations  
✗ Don't overuse animations or glow effects  

---

## File References

### CSS Variables
All colors and design tokens are defined in: `src/index.css`

### OG Image Generation
Dynamic OG images: `app/api/og/job/[id]/route.tsx`

### Thumbnail Generation
Job thumbnails: `src/hooks/useJobThumbnail.ts`

### Static Assets
- Logo/Icons: `public/`
- OG Image SVG: `public/og-image.svg`

---

## Version History

**Version 1.0** - December 2024
- Initial brand guide creation
- Primary color updated to blue (#0b66c3)
- Comprehensive color palette defined
- Typography and spacing standards established

---

*This brand guide ensures consistency across all CareerSasa touchpoints, from the website to social media previews and marketing materials.*
