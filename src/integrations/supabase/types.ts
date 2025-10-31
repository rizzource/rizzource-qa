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
      availability_slots: {
        Row: {
          created_at: string
          event_date: string
          id: string
          is_available: boolean
          time_slot: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          is_available?: boolean
          time_slot: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          is_available?: boolean
          time_slot?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_email: string | null
          owner_name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_email?: string | null
          owner_name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_email?: string | null
          owner_name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email: string
          id?: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      data_exports: {
        Row: {
          export_type: string
          exported_at: string
          id: string
          notes: string | null
          record_count: number | null
          user_id: string | null
        }
        Insert: {
          export_type: string
          exported_at?: string
          id?: string
          notes?: string | null
          record_count?: number | null
          user_id?: string | null
        }
        Update: {
          export_type?: string
          exported_at?: string
          id?: string
          notes?: string | null
          record_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          date: string
          description: string | null
          id: string
          location: string | null
          month: string
          month_index: number
          priority: boolean | null
          time: string | null
          title: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          created_by: string
          date: string
          description?: string | null
          id?: string
          location?: string | null
          month: string
          month_index: number
          priority?: boolean | null
          time?: string | null
          title: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string
          date?: string
          description?: string | null
          id?: string
          location?: string | null
          month?: string
          month_index?: number
          priority?: boolean | null
          time?: string | null
          title?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string | null
          id: string
          rating: string
          suggestions: string | null
          user_email: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating: string
          suggestions?: string | null
          user_email: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: string
          suggestions?: string | null
          user_email?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_email: string
          applicant_id: string
          applicant_name: string
          applicant_phone: string | null
          company_id: string
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          resume_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          applicant_email: string
          applicant_id: string
          applicant_name: string
          applicant_phone?: string | null
          company_id: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          resume_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          applicant_email?: string
          applicant_id?: string
          applicant_name?: string
          applicant_phone?: string | null
          company_id?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          resume_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
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
          application_deadline: string | null
          application_url: string | null
          area_of_law: string | null
          company_id: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          description: string
          external_job_id: string | null
          id: string
          job_type: string | null
          location: string | null
          salary_range: string | null
          source: string | null
          source_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          application_url?: string | null
          area_of_law?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          external_job_id?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          salary_range?: string | null
          source?: string | null
          source_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          application_url?: string | null
          area_of_law?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          external_job_id?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          salary_range?: string | null
          source?: string | null
          source_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
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
      meeting_choices: {
        Row: {
          created_at: string
          group_id: number | null
          id: string
          poll_id: string
          slot_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id?: number | null
          id?: string
          poll_id: string
          slot_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: number | null
          id?: string
          poll_id?: string
          slot_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_choices_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "meeting_polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_choices_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "meeting_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_polls: {
        Row: {
          created_at: string
          group_id: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      meeting_slots: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          poll_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          id?: string
          poll_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          poll_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_slots_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "meeting_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_votes: {
        Row: {
          choice: string
          id: string
          slot_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          choice: string
          id?: string
          slot_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          choice?: string
          id?: string
          slot_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_votes_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "meeting_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      mentees: {
        Row: {
          created_at: string
          email: string
          event: string
          id: string
          meetup_how: string
          meetup_when: string
        }
        Insert: {
          created_at?: string
          email: string
          event: string
          id?: string
          meetup_how: string
          meetup_when: string
        }
        Update: {
          created_at?: string
          email?: string
          event?: string
          id?: string
          meetup_how?: string
          meetup_when?: string
        }
        Relationships: []
      }
      mentors: {
        Row: {
          created_at: string
          email: string
          had_uploaded_outline: boolean | null
          id: string
          meetup_how: string
          meetup_when: string
          outline_preference: string | null
        }
        Insert: {
          created_at?: string
          email: string
          had_uploaded_outline?: boolean | null
          id?: string
          meetup_how: string
          meetup_when: string
          outline_preference?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          had_uploaded_outline?: boolean | null
          id?: string
          meetup_how?: string
          meetup_when?: string
          outline_preference?: string | null
        }
        Relationships: []
      }
      outline_ratings: {
        Row: {
          created_at: string
          id: string
          outline_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          outline_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          outline_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outline_ratings_outline_id_fkey"
            columns: ["outline_id"]
            isOneToOne: false
            referencedRelation: "outlines"
            referencedColumns: ["id"]
          },
        ]
      }
      outlines: {
        Row: {
          created_at: string
          downloads: number | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          mentor_email: string | null
          professor: string
          rating_avg: number | null
          rating_count: number | null
          title: string
          topic: string
          updated_at: string
          user_id: string
          year: string
        }
        Insert: {
          created_at?: string
          downloads?: number | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          mentor_email?: string | null
          professor: string
          rating_avg?: number | null
          rating_count?: number | null
          title: string
          topic: string
          updated_at?: string
          user_id: string
          year: string
        }
        Update: {
          created_at?: string
          downloads?: number | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          mentor_email?: string | null
          professor?: string
          rating_avg?: number | null
          rating_count?: number | null
          title?: string
          topic?: string
          updated_at?: string
          user_id?: string
          year?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          resume_file_name: string | null
          resume_uploaded_at: string | null
          resume_url: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          resume_file_name?: string | null
          resume_uploaded_at?: string | null
          resume_url?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          resume_file_name?: string | null
          resume_uploaded_at?: string | null
          resume_url?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scheduling_responses: {
        Row: {
          activities: string[]
          created_at: string
          date_type: string
          earliest_time: string
          email: string
          full_name: string
          id: string
          latest_time: string
          mentor_options: string[] | null
          selected_dates: string[] | null
          selected_days: string[] | null
          updated_at: string
          user_type: string
        }
        Insert: {
          activities: string[]
          created_at?: string
          date_type: string
          earliest_time: string
          email: string
          full_name: string
          id?: string
          latest_time: string
          mentor_options?: string[] | null
          selected_dates?: string[] | null
          selected_days?: string[] | null
          updated_at?: string
          user_type: string
        }
        Update: {
          activities?: string[]
          created_at?: string
          date_type?: string
          earliest_time?: string
          email?: string
          full_name?: string
          id?: string
          latest_time?: string
          mentor_options?: string[] | null
          selected_dates?: string[] | null
          selected_days?: string[] | null
          updated_at?: string
          user_type?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      export_data_to_json: { Args: { table_name: string }; Returns: Json }
      get_availability_heatmap: {
        Args: { target_date: string }
        Returns: {
          availability_percentage: number
          available_count: number
          time_slot: string
          total_participants: number
        }[]
      }
      get_choice_tallies: {
        Args: { poll_id_param: string }
        Returns: {
          choice_count: number
          date: string
          end_time: string
          slot_id: string
          start_time: string
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_group_member_emails: {
        Args: { user_email: string }
        Returns: string[]
      }
      get_group_user_count: { Args: { poll_id_param: string }; Returns: number }
      get_job_company_id: { Args: { _job_id: string }; Returns: string }
      get_slot_rankings: {
        Args: { poll_id_param: string }
        Returns: {
          date: string
          end_time: string
          maybe_count: number
          no_count: number
          score: number
          slot_id: string
          start_time: string
          yes_count: number
        }[]
      }
      get_user_choices: {
        Args: { poll_id_param: string; user_id_param: string }
        Returns: {
          slot_id: string
        }[]
      }
      get_user_company_role: {
        Args: { _company_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_email: { Args: { _user_id: string }; Returns: string }
      get_user_group_id: { Args: never; Returns: number }
      has_company_role: {
        Args: {
          _company_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_owner: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_superadmin: { Args: never; Returns: boolean }
      seed_fixed_poll: { Args: never; Returns: string }
    }
    Enums: {
      app_role:
        | "superadmin"
        | "owner"
        | "hr"
        | "admin"
        | "applicant"
        | "user"
        | "employee"
    }
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
      app_role: [
        "superadmin",
        "owner",
        "hr",
        "admin",
        "applicant",
        "user",
        "employee",
      ],
    },
  },
} as const
