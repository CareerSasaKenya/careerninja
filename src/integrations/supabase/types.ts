export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry: string | null
          location: string | null
          logo: string | null
          name: string
          size: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo?: string | null
          name: string
          size?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo?: string | null
          name?: string
          size?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          created_at: string
          id: string
          job_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_url: string | null
          applications_count: number | null
          apply_email: string | null
          apply_link: string | null
          company: string
          company_id: string | null
          created_at: string
          date_posted: string | null
          description: string
          direct_apply: boolean | null
          education_requirements: string | null
          education_level_id: number | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null
          hiring_organization_logo: string | null
          hiring_organization_name: string | null
          hiring_organization_url: string | null
          id: string
          identifier: string | null
          industry: string | null
          job_function: string | null
          job_location_city: string | null
          job_location_country: string | null
          job_location_county: string | null
          job_location_type:
            | Database["public"]["Enums"]["job_location_type"]
            | null
          job_slug: string | null
          language_requirements: string | null
          license_requirements: string | null
          location: string
          posted_by: Database["public"]["Enums"]["posted_by"] | null
          practice_area: string | null
          project_type: string | null
          required_qualifications: string | null
          salary: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          salary_period: Database["public"]["Enums"]["salary_period"] | null
          software_skills: string | null
          specialization: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          tags: Json | null
          title: string
          updated_at: string
          user_id: string | null
          valid_through: string | null
          views_count: number | null
          visa_sponsorship:
            | Database["public"]["Enums"]["visa_sponsorship"]
            | null
          work_schedule: string | null
          additional_info: string | null
          // New fields
          responsibilities: string | null
          qualifications: string | null
          minimum_experience: number | null
          job_function_id: number | null
          industry_id: number | null
          experience_level_ref_id: number | null
          county_id: number | null
          location_town: string | null
          salary_visibility: Database["public"]["Enums"]["salary_visibility"] | null
          salary_type: Database["public"]["Enums"]["salary_type"] | null
          source: Database["public"]["Enums"]["job_source"] | null
          google_indexed: boolean | null
          is_featured: boolean | null
          application_deadline: string | null
          posted_date: string | null
          slug: string | null
        }
        Insert: {
          application_url?: string | null
          applications_count?: number | null
          apply_email?: string | null
          apply_link?: string | null
          company: string
          company_id?: string | null
          created_at?: string
          date_posted?: string | null
          description: string
          direct_apply?: boolean | null
          education_requirements?: string | null
          education_level_id?: number | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          hiring_organization_logo?: string | null
          hiring_organization_name?: string | null
          hiring_organization_url?: string | null
          id?: string
          identifier?: string | null
          industry?: string | null
          job_function?: string | null
          job_location_city?: string | null
          job_location_country?: string | null
          job_location_county?: string | null
          job_location_type?:
            | Database["public"]["Enums"]["job_location_type"]
            | null
          job_slug?: string | null
          language_requirements?: string | null
          license_requirements?: string | null
          location: string
          posted_by?: Database["public"]["Enums"]["posted_by"] | null
          practice_area?: string | null
          project_type?: string | null
          required_qualifications?: string | null
          salary?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: Database["public"]["Enums"]["salary_period"] | null
          software_skills?: string | null
          specialization?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          tags?: Json | null
          title: string
          updated_at?: string
          user_id?: string | null
          valid_through?: string | null
          views_count?: number | null
          visa_sponsorship?:
            | Database["public"]["Enums"]["visa_sponsorship"]
            | null
          work_schedule?: string | null
          additional_info?: string | null
          // New fields
          responsibilities?: string | null
          qualifications?: string | null
          minimum_experience?: number | null
          job_function_id?: number | null
          industry_id?: number | null
          experience_level_ref_id?: number | null
          county_id?: number | null
          location_town?: string | null
          salary_visibility?: Database["public"]["Enums"]["salary_visibility"] | null
          salary_type?: Database["public"]["Enums"]["salary_type"] | null
          source?: Database["public"]["Enums"]["job_source"] | null
          google_indexed?: boolean | null
          is_featured?: boolean | null
          application_deadline?: string | null
          posted_date?: string | null
          slug?: string | null
        }
        Update: {
          application_url?: string | null
          applications_count?: number | null
          apply_email?: string | null
          apply_link?: string | null
          company?: string
          company_id?: string | null
          created_at?: string
          date_posted?: string | null
          description?: string
          direct_apply?: boolean | null
          education_requirements?: string | null
          education_level_id?: number | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          hiring_organization_logo?: string | null
          hiring_organization_name?: string | null
          hiring_organization_url?: string | null
          id?: string
          identifier?: string | null
          industry?: string | null
          job_function?: string | null
          job_location_city?: string | null
          job_location_country?: string | null
          job_location_county?: string | null
          job_location_type?:
            | Database["public"]["Enums"]["job_location_type"]
            | null
          job_slug?: string | null
          language_requirements?: string | null
          license_requirements?: string | null
          location?: string
          posted_by?: Database["public"]["Enums"]["posted_by"] | null
          practice_area?: string | null
          project_type?: string | null
          required_qualifications?: string | null
          salary?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: Database["public"]["Enums"]["salary_period"] | null
          software_skills?: string | null
          specialization?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          tags?: Json | null
          title?: string
          updated_at?: string
          user_id?: string | null
          valid_through?: string | null
          views_count?: number | null
          visa_sponsorship?:
            | Database["public"]["Enums"]["visa_sponsorship"]
            | null
          work_schedule?: string | null
          additional_info?: string | null
          // New fields
          responsibilities?: string | null
          qualifications?: string | null
          minimum_experience?: number | null
          job_function_id?: number | null
          industry_id?: number | null
          experience_level_ref_id?: number | null
          county_id?: number | null
          location_town?: string | null
          salary_visibility?: Database["public"]["Enums"]["salary_visibility"] | null
          salary_type?: Database["public"]["Enums"]["salary_type"] | null
          source?: Database["public"]["Enums"]["job_source"] | null
          google_indexed?: boolean | null
          is_featured?: boolean | null
          application_deadline?: string | null
          posted_date?: string | null
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          site_name: string
          logo_url: string | null
          favicon_url: string | null
          primary_color: string
          secondary_color: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          site_name?: string
          logo_url?: string | null
          favicon_url?: string | null
          primary_color?: string
          secondary_color?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          site_name?: string
          logo_url?: string | null
          favicon_url?: string | null
          primary_color?: string
          secondary_color?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      // Add the missing lookup tables
      industries: {
        Row: {
          id: number
          name: string
          slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      education_levels: {
        Row: {
          id: number
          name: string
          slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_functions: {
        Row: {
          id: number
          name: string
          slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      counties: {
        Row: {
          id: number
          name: string
          slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      towns: {
        Row: {
          id: number
          name: string
          county_id: number
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          county_id: number
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          county_id?: number
          slug?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_towns_county"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "employer" | "candidate" | "admin"
      employment_type:
        | "FULL_TIME"
        | "PART_TIME"
        | "CONTRACTOR"
        | "INTERN"
        | "TEMPORARY"
        | "VOLUNTEER"
        | "PER_DIEM"
      experience_level: "Entry" | "Mid" | "Senior" | "Managerial" | "Internship"
      job_location_type: "ON_SITE" | "REMOTE" | "HYBRID"
      job_status: "active" | "expired" | "draft" | "pending"
      posted_by: "admin" | "employer"
      salary_period: "YEAR" | "MONTH" | "WEEK" | "DAY" | "HOUR"
      visa_sponsorship: "Yes" | "No" | "Not Applicable"
      salary_visibility: "Show" | "Hide"
      salary_type: "Monthly" | "Weekly" | "Hourly" | "Annually"
      job_source: "Employer" | "Admin" | "Scraper"
    },
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["employer", "candidate", "admin"],
      employment_type: [
        "FULL_TIME",
        "PART_TIME",
        "CONTRACTOR",
        "INTERN",
        "TEMPORARY",
        "VOLUNTEER",
        "PER_DIEM",
      ],
      experience_level: ["Entry", "Mid", "Senior", "Managerial", "Internship"],
      job_location_type: ["ON_SITE", "REMOTE", "HYBRID"],
      job_status: ["active", "expired", "draft", "pending"],
      posted_by: ["admin", "employer"],
      salary_period: ["YEAR", "MONTH", "WEEK", "DAY", "HOUR"],
      visa_sponsorship: ["Yes", "No", "Not Applicable"],
      salary_visibility: ["Show", "Hide"],
      salary_type: ["Monthly", "Weekly", "Hourly", "Annually"],
      job_source: ["Employer", "Admin", "Scraper"],
    },
  },
} as const