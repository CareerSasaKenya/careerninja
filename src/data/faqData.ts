export interface FAQ {
  q: string;
  a: string;
}

export interface FAQCategory {
  title: string;
  icon: string;
  questions: FAQ[];
}

export interface FAQSection {
  id: string;
  label: string;
  icon: string;
  categories: FAQCategory[];
}

export const faqData: FAQSection[] = [
  // ==========================================================================
  // CANDIDATES
  // ==========================================================================
  {
    id: "candidates",
    label: "For Candidate",
    icon: "User",
    categories: [
      {
        title: "Getting Started",
        icon: "Rocket",
        questions: [
          { q: "How do I create an account?", a: "Click 'Sign Up' on the top right, or go to /auth. You can register with your email address and a password. After signing up, you'll be taken to your dashboard where you can complete your profile." },
          { q: "Is CareerSasa free for job seekers?", a: "Yes. Browsing jobs, applying, saving jobs, using career tools, and all candidate features are completely free." },
          { q: "How do I complete my profile?", a: "Go to Dashboard > My Profile. Fill in your personal details, work experience, education, skills, and upload your CV. A complete profile helps employers find you and improves your applications." },
          { q: "Can I use CareerSasa on my phone?", a: "Yes. CareerSasa is fully responsive and works on any device. You can browse jobs, apply, and manage your account from your phone or tablet." },
        ],
      },
      {
        title: "Finding & Applying for Jobs",
        icon: "Search",
        questions: [
          { q: "How do I search for jobs?", a: "Use the search bar on the homepage or the /jobs page. You can search by keyword, job title, company, or location. Use the filters to narrow results by employment type, experience level, and location." },
          { q: "How do I apply for a job?", a: "Click on a job listing to view details, then click the 'Apply Now' button. Some jobs allow instant apply with your CareerSasa profile, while others may redirect you to the employer's application page." },
          { q: "Can I save jobs to apply later?", a: "Yes. Click the bookmark icon on any job listing to save it. View all saved jobs from Dashboard > Saved Jobs." },
          { q: "Can I save my search criteria?", a: "Yes. After performing a search, click 'Save Search' to store your filters. Access saved searches from Dashboard > Saved Searches. You can also set up email alerts for new matching jobs." },
          { q: "How do job alerts work?", a: "Job alerts send you email notifications when new jobs match your saved search criteria. Set them up at /job-alerts or from your Saved Searches in the dashboard." },
          { q: "Can I track my applications?", a: "Yes. Dashboard > All Applications shows every job you've applied to through CareerSasa, with status updates when employers respond." },
          { q: "Can I compare multiple jobs side by side?", a: "Yes. Use the Compare Jobs feature (Dashboard > Compare Jobs) to view salary, location, requirements, and benefits of multiple listings side by side." },
        ],
      },
      {
        title: "Career Tools",
        icon: "Briefcase",
        questions: [
          { q: "What is the CV Builder?", a: "The CV Builder (Career Tools > CV Builder) generates a professionally formatted CV from your profile data. Choose from multiple templates and download as PDF." },
          { q: "How does the Cover Letter Generator work?", a: "Career Tools > Cover Letters uses AI to generate tailored cover letters based on the job you're applying to. Enter the job title and company, and it creates a personalized letter you can edit and download." },
          { q: "What are Skill Assessments?", a: "Career Tools > Assessments offers quizzes that validate your skills in various areas. Passing an assessment adds a verified badge to your profile, making you more attractive to employers." },
          { q: "How does Career Path Planning work?", a: "Career Tools > Career Path analyzes your skills and experience to suggest career directions and goals. You can set and track professional milestones." },
          { q: "What is the Salary Insights tool?", a: "Career Tools > Salary (dollar sign icon on mobile) shows market salary data for any job title in Kenya. Search by role and get salary ranges in KES. If data isn't in our database, our AI generates a Smart Estimate instantly." },
          { q: "Is the salary data accurate?", a: "Salary data comes from two sources: our curated Kenyan market database (170+ roles across 14+ towns) and AI-powered Smart Estimates for roles not yet in the database. Smart Estimates are clearly labeled." },
        ],
      },
      {
        title: "Career Boost Services",
        icon: "Zap",
        questions: [
          { q: "What career services does CareerSasa offer?", a: "We offer three premium services: CV Writing (professional CV creation), Cover Letter Writing (tailored cover letters), and LinkedIn Profile Optimization (make your LinkedIn recruiter-ready). Find them under the Career Boost menu or at /services." },
          { q: "How do I request a CV writing service?", a: "Go to /services/cv or click Career Boost in the menu. Fill in the form with your details and our team will craft a professional CV for you." },
          { q: "What's included in the LinkedIn optimization service?", a: "Our team reviews and rewrites your LinkedIn profile to improve visibility to recruiters. This includes headline optimization, summary writing, experience section enhancement, and keyword strategy." },
        ],
      },
      {
        title: "Account & Settings",
        icon: "Settings",
        questions: [
          { q: "How do I change my password?", a: "Go to Dashboard > Preferences. You can update your password and notification settings there." },
          { q: "How do I update my email or personal details?", a: "Go to Dashboard > My Profile to edit your name, phone, location, bio, and other personal information." },
          { q: "How do I manage email notifications?", a: "Dashboard > Preferences lets you control which emails you receive: job alerts, newsletter, application updates, etc." },
          { q: "How do I sign out?", a: "Click your name or the menu icon in the top right, then click 'Sign Out'. You'll be taken to the homepage." },
          { q: "Can I delete my account?", a: "Contact us at /contact and we'll handle account deletion requests within 48 hours." },
        ],
      },
      {
        title: "Blog & Resources",
        icon: "BookOpen",
        questions: [
          { q: "Where can I find career advice articles?", a: "Visit /blog for career tips, interview guides, CV advice, and job market insights for Kenya." },
          { q: "What is the Toolkit?", a: "The Toolkit (/toolkit) provides downloadable resources including CV templates, interview checklists, and career planning worksheets." },
          { q: "How does the newsletter work?", a: "Subscribe via the footer or /newsletter to receive weekly career tips, job market trends, and curated job picks delivered to your inbox." },
        ],
      },
    ],
  },

  // ==========================================================================
  // EMPLOYERS
  // ==========================================================================
  {
    id: "employers",
    label: "For Employer",
    icon: "Building2",
    categories: [
      {
        title: "Getting Started",
        icon: "Rocket",
        questions: [
          { q: "How do I register as an employer?", a: "Click 'Sign Up' at /auth and select the Employer role during registration. You'll be taken to the employer dashboard where you can start posting jobs." },
          { q: "Is it free to post jobs?", a: "Yes. Standard job postings are free. Premium features like featured listings and promoted jobs are available as add-ons." },
          { q: "How do I set up my company profile?", a: "Go to Dashboard > Company Profile tab. Add your company name, description, logo, website, industry, and location. A complete profile builds trust with candidates." },
        ],
      },
      {
        title: "Posting Jobs",
        icon: "FilePlus",
        questions: [
          { q: "How do I post a new job?", a: "Click 'Post a Job' from your dashboard or go to /post-job. Fill in the title, description, requirements, salary range, and other details. You can also paste a job description and let our AI parse and enrich it automatically." },
          { q: "Can I use AI to help write job descriptions?", a: "Yes. When posting a job, paste your raw job text and the AI parser will structure it, add relevant tags, and suggest improvements. This saves time and ensures your listing is optimized." },
          { q: "How do I edit a posted job?", a: "Go to Dashboard > My Jobs tab, find the job, and click 'Edit'. You can update any field including title, description, salary, and status." },
          { q: "How do I expire or close a job listing?", a: "In Dashboard > My Jobs, change the job status to 'Closed' or 'Expired'. Jobs also auto-expire after the date you set when posting." },
          { q: "What are featured and promoted jobs?", a: "Featured jobs appear at the top of search results with a special badge. Promoted jobs get priority placement and highlighted styling. Both increase visibility and application rates." },
          { q: "How long do job listings stay active?", a: "Jobs remain active until the expiry date you set (default is 30 days). You can extend, close, or renew them from the Job Management tab." },
        ],
      },
      {
        title: "Managing Applications",
        icon: "Users",
        questions: [
          { q: "How do I view applications for my jobs?", a: "Go to Dashboard > Applications tab to see all applications across your posted jobs. You can filter by job, status, and date." },
          { q: "Can I contact applicants directly?", a: "Yes. Use the Messages feature (Dashboard > Messages) to communicate with candidates directly through CareerSasa." },
          { q: "How do I shortlist or reject candidates?", a: "In the Applications tab, you can change each application's status: Received, Under Review, Shortlisted, Interview, Rejected, or Offered." },
        ],
      },
      {
        title: "Analytics & Insights",
        icon: "BarChart3",
        questions: [
          { q: "What analytics are available?", a: "Dashboard > Analytics provides views, clicks, applications, and conversion rates for each job listing. Track which jobs perform best." },
          { q: "Can I see which jobs get the most views?", a: "Yes. The Analytics tab shows view counts, application rates, and click-through rates for all your listings." },
        ],
      },
      {
        title: "Job Management",
        icon: "ClipboardList",
        questions: [
          { q: "What is the Job Management Dashboard?", a: "Dashboard > Job Management gives you a comprehensive view of all your jobs with bulk actions: renew, close, delete, or extend multiple listings at once." },
          { q: "Can I bulk manage my job listings?", a: "Yes. The Job Management dashboard lets you select multiple jobs and perform bulk actions like closing or renewing them simultaneously." },
        ],
      },
    ],
  },

];
