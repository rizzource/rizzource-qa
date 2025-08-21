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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          application_experience: string
          created_at: string
          experience_rating: string
          id: string
          liked_about_process: string | null
          suggestions: string | null
          thoughts: string | null
          user_email: string
        }
        Insert: {
          application_experience: string
          created_at?: string
          experience_rating: string
          id?: string
          liked_about_process?: string | null
          suggestions?: string | null
          thoughts?: string | null
          user_email: string
        }
        Update: {
          application_experience?: string
          created_at?: string
          experience_rating?: string
          id?: string
          liked_about_process?: string | null
          suggestions?: string | null
          thoughts?: string | null
          user_email?: string
        }
        Relationships: []
      }
      mentees: {
        Row: {
          car_availability: boolean | null
          comments: string | null
          created_at: string
          email: string
          expectations: string | null
          field_of_law: string
          first_name: string
          hobbies: string | null
          hometown: string
          id: string
          last_name: string
          mentorship_time_commitment: string
          undergraduate_university: string
        }
        Insert: {
          car_availability?: boolean | null
          comments?: string | null
          created_at?: string
          email: string
          expectations?: string | null
          field_of_law: string
          first_name: string
          hobbies?: string | null
          hometown: string
          id?: string
          last_name: string
          mentorship_time_commitment: string
          undergraduate_university: string
        }
        Update: {
          car_availability?: boolean | null
          comments?: string | null
          created_at?: string
          email?: string
          expectations?: string | null
          field_of_law?: string
          first_name?: string
          hobbies?: string | null
          hometown?: string
          id?: string
          last_name?: string
          mentorship_time_commitment?: string
          undergraduate_university?: string
        }
        Relationships: []
      }
      mentors: {
        Row: {
          car_availability: boolean | null
          class_year: string
          co_mentor_preference: string | null
          comments: string | null
          created_at: string
          email: string
          field_of_law: string
          first_name: string
          hobbies: string | null
          hometown: string
          id: string
          last_name: string
          mentorship_time_commitment: string
          undergraduate_university: string
        }
        Insert: {
          car_availability?: boolean | null
          class_year: string
          co_mentor_preference?: string | null
          comments?: string | null
          created_at?: string
          email: string
          field_of_law: string
          first_name: string
          hobbies?: string | null
          hometown: string
          id?: string
          last_name: string
          mentorship_time_commitment: string
          undergraduate_university: string
        }
        Update: {
          car_availability?: boolean | null
          class_year?: string
          co_mentor_preference?: string | null
          comments?: string | null
          created_at?: string
          email?: string
          field_of_law?: string
          first_name?: string
          hobbies?: string | null
          hometown?: string
          id?: string
          last_name?: string
          mentorship_time_commitment?: string
          undergraduate_university?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
