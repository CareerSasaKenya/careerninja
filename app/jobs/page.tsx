"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import { Loader2, ChevronLeft, ChevronRight, Search, RotateCcw, ChevronDown, ChevronUp, FileText, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { testSupabaseConnection } from "@/lib/testSupabase";

interface SearchFilters {
  searchTerm: string;
  location: string;
  jobType: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  remoteOnly: boolean;
  educationLevel: string;
  industry: string;
  sortBy: string;
}

// Static data for dropdowns
const JOB_FUNCTIONS = [
  { name: "Accounting, Auditing & Finance" },
  { name: "Admin & Office" },
  { name: "Agriculture, Food & Natural Resources" },
  { name: "Building & Architecture" },
  { name: "Community & Social Services" },
  { name: "Consulting & Strategy" },
  { name: "Creative & Design" },
  { name: "Customer Service & Support" },
  { name: "Driver & Transport Services" },
  { name: "Education & Training" },
  { name: "Engineering & Technology" },
  { name: "Environment, Energy & Natural Resources" },
  { name: "Estate Agents & Property Management" },
  { name: "Farming & Veterinary" },
  { name: "Food Services & Catering" },
  { name: "Health & Safety" },
  { name: "Healthcare & Medical" },
  { name: "Hospitality & Leisure" },
  { name: "Human Resources & Recruitment" },
  { name: "IT & Software" },
  { name: "Legal Services" },
  { name: "Management & Business Development" },
  { name: "Manufacturing & Warehousing" },
  { name: "Marketing & Communications" },
  { name: "Product & Project Management" },
  { name: "Quality Control & Assurance" },
  { name: "Research, Teaching & Training" },
  { name: "Sales" },
  { name: "Security" },
  { name: "Supply Chain & Procurement" },
  { name: "Trades & Services" },
  { name: "Travel, Tourism & Leisure" },
  { name: "Volunteer & NGO Work" },
  { name: "Government & Public Service" },
  { name: "Banking, Insurance & Financial Services" },
  { name: "Media, Advertising & PR" },
  { name: "Science & Laboratory" },
  { name: "Telecommunications" },
  { name: "Sports, Fitness & Recreation" },
  { name: "NGO, NPO & Charity" },
  { name: "Beauty, Wellness & Fitness" },
  { name: "Real Estate & Construction" },
  { name: "Logistics & Transportation" },
  { name: "Retail, Fashion & FMCG" },
  { name: "Maintenance, Repair & Installation" },
  { name: "Data, Analytics & AI" },
  { name: "Other / Miscellaneous" }
];

const INDUSTRIES = [
  { name: "Accounting, Auditing & Finance" },
  { name: "Advertising, Media & Communications" },
  { name: "Agriculture, Fishing & Forestry" },
  { name: "Automotive & Aviation" },
  { name: "Banking, Insurance & Financial Services" },
  { name: "Building, Construction & Real Estate" },
  { name: "Charity, NGO & Non-Profit" },
  { name: "Community & Social Services" },
  { name: "Consulting & Professional Services" },
  { name: "Creative Arts, Entertainment & Design" },
  { name: "Education & Training" },
  { name: "Energy, Utilities & Waste Management" },
  { name: "Engineering & Technical Services" },
  { name: "Environment & Natural Resources" },
  { name: "Fashion & Beauty" },
  { name: "Food Services, Hospitality & Catering" },
  { name: "Government & Public Administration" },
  { name: "Healthcare, Medical & Pharmaceutical" },
  { name: "Human Resources & Recruitment" },
  { name: "ICT & Telecommunications" },
  { name: "Import & Export" },
  { name: "Legal Services" },
  { name: "Logistics & Transportation" },
  { name: "Manufacturing & Warehousing" },
  { name: "Marketing & Public Relations" },
  { name: "Mining, Oil & Gas" },
  { name: "NGO, NPO & Charity" },
  { name: "Printing, Publishing & Packaging" },
  { name: "Real Estate & Property Management" },
  { name: "Research, Science & Technology" },
  { name: "Retail, Wholesale, E-commerce & FMCG" },
  { name: "Security & Defence" },
  { name: "Sports, Fitness & Recreation" },
  { name: "Tourism, Travel & Leisure" },
  { name: "Agriculture & Agribusiness" },
  { name: "Financial Technology (FinTech)" },
  { name: "Media, Film & Broadcasting" },
  { name: "Maritime & Shipping" },
  { name: "Education Technology (EdTech)" },
  { name: "Arts, Culture & Heritage" },
  { name: "Renewable Energy & Climate" },
  { name: "Chemical & Process Industry" },
  { name: "Transport & Infrastructure" },
  { name: "Business Process Outsourcing (BPO)" },
  { name: "Health Tech & Biotechnology" },
  { name: "Non-classified / Miscellaneous" }
];

const COUNTIES = [
  { name: "Baringo" }, { name: "Bomet" }, { name: "Bungoma" }, { name: "Busia" },
  { name: "Elgeyo-Marakwet" }, { name: "Embu" }, { name: "Garissa" }, { name: "Homa Bay" },
  { name: "Isiolo" }, { name: "Kajiado" }, { name: "Kakamega" }, { name: "Kericho" },
  { name: "Kiambu" }, { name: "Kilifi" }, { name: "Kirinyaga" }, { name: "Kisii" },
  { name: "Kisumu" }, { name: "Kitui" }, { name: "Kwale" }, { name: "Laikipia" },
  { name: "Lamu" }, { name: "Machakos" }, { name: "Makueni" }, { name: "Mandera" },
  { name: "Marsabit" }, { name: "Meru" }, { name: "Migori" }, { name: "Mombasa" },
  { name: "Murang'a" }, { name: "Nairobi" }, { name: "Nakuru" }, { name: "Nandi" },
  { name: "Narok" }, { name: "Nyamira" }, { name: "Nyandarua" }, { name: "Nyeri" },
  { name: "Samburu" }, { name: "Siaya" }, { name: "Taita–Taveta" }, { name: "Tana River" },
  { name: "Tharaka–Nithi" }, { name: "Trans Nzoia" }, { name: "Turkana" }, { name: "Uasin Gishu" },
  { name: "Vihiga" }, { name: "Wajir" }, { name: "West Pokot" }
];

const JOBS_PER_PAGE = 12;

const Jobs = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    location: "",
    jobType: "",
    employmentType: "",
    experienceLevel: "",
    salaryMin: null,
    salaryMax: null,
    remoteOnly: false,
    educationLevel: "",
    industry: "",
    sortBy: "newest"
  });
  
  // State to track dropdown open states
  const [dropdownStates, setDropdownStates] = useState({
    jobType: false,
    industry: false,
    location: false
  });
  
  // State for advanced search visibility on mobile
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["jobs", filters, currentPage],
    queryFn: async () => {
      try {
        console.log("Fetching jobs with filters:", filters);
        console.log("Current page:", currentPage);
        
        // First, get the total count
        let countQuery = supabase
          .from("jobs")
          .select("*", { count: "exact", head: true });

        // Apply search filters for count
        if (filters.searchTerm) {
          countQuery = countQuery.ilike("title", `%${filters.searchTerm}%`);
        }

        if (filters.location) {
          countQuery = countQuery.eq("job_location_county", filters.location);
        }

        if (filters.employmentType) {
          countQuery = countQuery.eq("employment_type", filters.employmentType as Database["public"]["Enums"]["employment_type"]);
        }

        if (filters.experienceLevel) {
          countQuery = countQuery.eq("experience_level", filters.experienceLevel as Database["public"]["Enums"]["experience_level"]);
        }

        if (filters.remoteOnly) {
          countQuery = countQuery.eq("job_location_type", "REMOTE");
        }

        if (filters.educationLevel) {
          countQuery = countQuery.ilike("education_requirements", `%${filters.educationLevel}%`);
        }

        if (filters.industry) {
          countQuery = countQuery.eq("industry", filters.industry);
        }

        if (filters.jobType) {
          countQuery = countQuery.eq("job_function", filters.jobType);
        }

        const { count, error: countError } = await countQuery;
        console.log("Count query result:", { count, countError });
        
        if (countError) {
          console.error("Count query error:", countError);
          throw new Error(`Failed to fetch job count: ${countError.message}`);
        }

        // Then get the paginated data with better error handling
        let query = supabase
          .from("jobs")
          .select(`
            *,
            companies (
              id,
              name,
              logo
            )
          `)
          .range((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE - 1);

        // Apply search filters
        if (filters.searchTerm) {
          query = query.ilike("title", `%${filters.searchTerm}%`);
        }

        if (filters.location) {
          query = query.eq("job_location_county", filters.location);
        }

        if (filters.employmentType) {
          query = query.eq("employment_type", filters.employmentType as Database["public"]["Enums"]["employment_type"]);
        }

        if (filters.experienceLevel) {
          query = query.eq("experience_level", filters.experienceLevel as Database["public"]["Enums"]["experience_level"]);
        }

        if (filters.remoteOnly) {
          query = query.eq("job_location_type", "REMOTE");
        }

        if (filters.educationLevel) {
          query = query.ilike("education_requirements", `%${filters.educationLevel}%`);
        }

        if (filters.industry) {
          query = query.eq("industry", filters.industry);
        }

        if (filters.jobType) {
          query = query.eq("job_function", filters.jobType);
        }

        // Apply salary filters
        if (filters.salaryMin !== null) {
          query = query.gte("salary_min", filters.salaryMin);
        }

        if (filters.salaryMax !== null) {
          query = query.lte("salary_max", filters.salaryMax);
        }

        // Apply sorting
        switch (filters.sortBy) {
          case "newest":
            query = query.order("created_at", { ascending: false });
            break;
          case "oldest":
            query = query.order("created_at", { ascending: true });
            break;
          case "salary_high":
            query = query.order("salary_max", { ascending: false });
            break;
          case "salary_low":
            query = query.order("salary_min", { ascending: true });
            break;
          default:
            query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;
        console.log("Data query result:", { data, error });

        if (error) {
          console.error("Data query error:", error);
          throw new Error(`Failed to fetch jobs: ${error.message}`);
        }
        
        // Return both data and count
        return {
          data,
          count: count || 0
        };
      } catch (err) {
        console.error("Query function error:", err);
        // Provide a more user-friendly error message
        if (err instanceof Error) {
          throw err;
        } else {
          throw new Error("An unexpected error occurred while fetching jobs");
        }
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update totalJobs when data changes
  useEffect(() => {
    if (data) {
      setTotalJobs(data.count);
    }
  }, [data]);

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error("React Query error:", error);
    }
  }, [error]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      const result = await testSupabaseConnection();
      console.log("Supabase connection test result:", result);
    };
    
    testConnection();
  }, []);

  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of job listings when page changes
      const jobListingsElement = document.getElementById('job-listings');
      if (jobListingsElement) {
        jobListingsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSearch = () => {
    // Reset to first page when search is triggered
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      location: "",
      jobType: "",
      employmentType: "",
      experienceLevel: "",
      salaryMin: null,
      salaryMax: null,
      remoteOnly: false,
      educationLevel: "",
      industry: "",
      sortBy: "newest"
    });
  };

  // Handle dropdown focus/blur events
  const handleDropdownFocus = (field: keyof typeof dropdownStates) => {
    setDropdownStates(prev => ({ ...prev, [field]: true }));
  };

  const handleDropdownBlur = (field: keyof typeof dropdownStates) => {
    // Small delay to allow for selection before closing
    setTimeout(() => {
      setDropdownStates(prev => ({ ...prev, [field]: false }));
    }, 150);
  };

  // Generate pagination buttons with ellipsis
  const generatePaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 10;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded-md ${
              currentPage === i
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Show first 10 pages and last page with ellipsis
      for (let i = 1; i <= Math.min(maxVisiblePages, totalPages); i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded-md ${
              currentPage === i
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {i}
          </button>
        );
      }
      
      // Add ellipsis if there are more pages beyond the visible range
      if (totalPages > maxVisiblePages) {
        buttons.push(
          <span key="ellipsis" className="px-2 py-1 text-gray-500">
            ...
          </span>
        );
        
        // Add last page button
        buttons.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {totalPages}
          </button>
        );
      }
    }
    
    return buttons;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-12 text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4 bg-gradient-primary bg-clip-text text-transparent px-4">
            Browse Jobs
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto px-4">
            Discover your next career opportunity from top companies in Kenya
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-grow">
            {/* Search Boxes - Responsive for Mobile */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              {/* Basic Search - Always visible */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Keyword Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Keywords"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                    className="w-full p-2 pl-8 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                {/* Function Search with Dropdown - Truly Compact with Dynamic Arrow */}
                <div className="relative">
                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                    onFocus={() => handleDropdownFocus('jobType')}
                    onBlur={() => handleDropdownBlur('jobType')}
                    className="w-full p-2 pl-6 pr-4 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary appearance-none truncate"
                  >
                    <option value="">Any Function</option>
                    {JOB_FUNCTIONS.map((func, index) => (
                      <option key={index} value={func.name}>
                        {func.name}
                      </option>
                    ))}
                  </select>
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {dropdownStates.jobType ? (
                      <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    ) : (
                      <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Industry Search with Dropdown - Truly Compact with Dynamic Arrow */}
                <div className="relative">
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters({...filters, industry: e.target.value})}
                    onFocus={() => handleDropdownFocus('industry')}
                    onBlur={() => handleDropdownBlur('industry')}
                    className="w-full p-2 pl-6 pr-4 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary appearance-none truncate"
                  >
                    <option value="">Any Industry</option>
                    {INDUSTRIES.map((ind, index) => (
                      <option key={index} value={ind.name}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {dropdownStates.industry ? (
                      <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    ) : (
                      <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Search Button */}
                <div className="flex items-center">
                  <button
                    onClick={handleSearch}
                    className="flex items-center justify-center gap-1 w-full bg-primary text-white p-2 rounded-md hover:bg-primary/90 transition-colors text-sm"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
              
              {/* Advanced Search Toggle for Mobile - Only visible on mobile */}
              <div className="md:hidden mt-3">
                <button
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className="flex items-center justify-center w-full py-2 text-sm text-primary font-medium bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {showAdvancedSearch ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide Advanced Search
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Advanced Search
                    </>
                  )}
                </button>
              </div>
              
              {/* Advanced Search Options - Only visible on mobile when toggled */}
              <div className={`md:hidden mt-3 ${showAdvancedSearch ? 'block' : 'hidden'}`}>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {/* Location Search with Counties Dropdown - Truly Compact with Dynamic Arrow */}
                  <div className="relative">
                    <select
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                      onFocus={() => handleDropdownFocus('location')}
                      onBlur={() => handleDropdownBlur('location')}
                      className="w-full p-2 pl-6 pr-4 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary appearance-none truncate"
                    >
                      <option value="">Any Location</option>
                      {COUNTIES.map((county, index) => (
                        <option key={index} value={county.name}>
                          {county.name}
                        </option>
                      ))}
                    </select>
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      {dropdownStates.location ? (
                        <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                        </svg>
                      ) : (
                        <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {/* Employment Type */}
                  <div className="relative">
                    <select
                      value={filters.employmentType}
                      onChange={(e) => setFilters({...filters, employmentType: e.target.value})}
                      className="w-full p-2 pl-6 pr-4 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary appearance-none truncate"
                    >
                      <option value="">Any Type</option>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACTOR">Contractor</option>
                      <option value="INTERN">Intern</option>
                      <option value="TEMPORARY">Temporary</option>
                      <option value="VOLUNTEER">Volunteer</option>
                      <option value="PER_DIEM">Per Diem</option>
                    </select>
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  </div>
                  
                  {/* Experience Level */}
                  <div className="relative">
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => setFilters({...filters, experienceLevel: e.target.value})}
                      className="w-full p-2 pl-6 pr-4 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary appearance-none truncate"
                    >
                      <option value="">Any Level</option>
                      <option value="Entry">Entry Level</option>
                      <option value="Mid">Mid Level</option>
                      <option value="Senior">Senior Level</option>
                      <option value="Managerial">Managerial</option>
                      <option value="Internship">Internship</option>
                    </select>
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  </div>
                  
                  {/* Education Level */}
                  <div className="relative">
                    <select
                      value={filters.educationLevel}
                      onChange={(e) => setFilters({...filters, educationLevel: e.target.value})}
                      className="w-full p-2 pl-6 pr-4 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary appearance-none truncate"
                    >
                      <option value="">Any Education</option>
                      <option value="High School">High School</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Advanced Diploma">Advanced Diploma</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="Doctorate (PhD)">Doctorate (PhD)</option>
                      <option value="Post-Doctorate">Post-Doctorate</option>
                      <option value="Professional Qualification">Professional Qualification</option>
                    </select>
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  </div>
                  
                  {/* Remote Only */}
                  <div className="flex items-center justify-center">
                    <label className="flex items-center text-xs">
                      <input
                        type="checkbox"
                        checked={filters.remoteOnly}
                        onChange={(e) => setFilters({...filters, remoteOnly: e.target.checked})}
                        className="h-3 w-3 text-primary focus:ring-primary border-gray-300 rounded mr-1"
                      />
                      Remote Only
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Job Listings */}
            <div id="job-listings">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading opportunities...</p>
                </div>
              ) : error ? (
                <div className="text-center py-32 animate-fade-in">
                  <div className="inline-flex p-6 rounded-full bg-red-100 mb-6">
                    <svg className="h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <p className="text-2xl font-semibold mb-2">Error Loading Jobs</p>
                  <p className="text-muted-foreground text-lg mb-4">There was a problem loading job listings.</p>
                  <button 
                    onClick={() => refetch()} 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Try Again
                  </button>
                </div>
              ) : data && data.data && data.data.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-6 md:gap-8">
                    {data.data.map((job, index) => (
                      <div key={job.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                        <JobCard
                          id={job.id}
                          title={job.title}
                          company={job.companies?.name || job.company}
                          location={job.location}
                          description={job.description}
                          salary={job.salary || undefined}
                          companyId={job.company_id}
                          companyLogo={job.companies?.logo}
                          industry={job.industry}
                          locationType={job.job_location_type}
                          employmentType={job.employment_type}
                          salaryMin={job.salary_min}
                          salaryMax={job.salary_max}
                          salaryCurrency={job.salary_currency}
                          salaryPeriod={job.salary_period}
                          experienceLevel={job.experience_level}
                          datePosted={job.date_posted}
                          validThrough={job.valid_through}
                          applicationUrl={job.application_url}
                          applyEmail={job.apply_email}
                          applyLink={job.apply_link}
                          skillsTop3={
                            Array.isArray(job.software_skills)
                              ? (job.software_skills as unknown[])
                                  .filter((s): s is string => typeof s === "string")
                                  .slice(0, 3)
                              : undefined
                          }
                          department={job.job_function}
                          jobSlug={job.job_slug}
                          educationLevel=""
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Enhanced Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col items-center mt-8 space-y-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {generatePaginationButtons()}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages} ({totalJobs} total jobs)
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-32 animate-fade-in">
                  <div className="inline-flex p-6 rounded-full bg-muted mb-6">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-semibold mb-2">No jobs found</p>
                  <p className="text-muted-foreground text-lg">Try adjusting your search filters</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar Filters - Only visible on desktop (lg and larger) */}
          <div className="hidden lg:block w-full lg:w-80 flex-shrink-0 order-first lg:order-last">
            <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-6 h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="salary_high">Salary: High to Low</option>
                    <option value="salary_low">Salary: Low to High</option>
                  </select>
                </div>
                
                {/* Employment Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Employment Type</label>
                  <select 
                    value={filters.employmentType}
                    onChange={(e) => setFilters({...filters, employmentType: e.target.value})}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Types</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="INTERN">Intern</option>
                    <option value="TEMPORARY">Temporary</option>
                    <option value="VOLUNTEER">Volunteer</option>
                    <option value="PER_DIEM">Per Diem</option>
                  </select>
                </div>
                
                {/* Experience Level */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Experience Level</label>
                  <select 
                    value={filters.experienceLevel}
                    onChange={(e) => setFilters({...filters, experienceLevel: e.target.value})}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Levels</option>
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Managerial">Managerial</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                
                {/* Education Level */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Education Level</label>
                  <select
                    value={filters.educationLevel}
                    onChange={(e) => setFilters({...filters, educationLevel: e.target.value})}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Any Education Level</option>
                    <option value="High School">High School</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Advanced Diploma">Advanced Diploma</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate (PhD)">Doctorate (PhD)</option>
                    <option value="Post-Doctorate">Post-Doctorate</option>
                    <option value="Professional Qualification">Professional Qualification</option>
                  </select>
                </div>
                
                {/* Industry */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Industry</label>
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters({...filters, industry: e.target.value})}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Any Industry</option>
                    {INDUSTRIES.map((ind, index) => (
                      <option key={index} value={ind.name}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Location */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Any Location</option>
                    {COUNTIES.map((county, index) => (
                      <option key={index} value={county.name}>
                        {county.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Remote Only */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remote-only"
                    checked={filters.remoteOnly}
                    onChange={(e) => setFilters({...filters, remoteOnly: e.target.checked})}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="remote-only" className="text-sm">Remote Only</label>
                </div>
                
                {/* Salary Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Salary Range (KES)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.salaryMin || ''}
                      onChange={(e) => setFilters({...filters, salaryMin: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <span className="text-sm">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.salaryMax || ''}
                      onChange={(e) => setFilters({...filters, salaryMax: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              
              {/* Reset Filter Button at Bottom */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;