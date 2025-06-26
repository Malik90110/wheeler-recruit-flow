export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_discrepancies: {
        Row: {
          created_at: string
          field_name: string
          id: string
          logged_value: number
          manager_notes: string | null
          report_date: string
          report_id: string
          reported_value: number
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field_name: string
          id?: string
          logged_value: number
          manager_notes?: string | null
          report_date: string
          report_id: string
          reported_value: number
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          field_name?: string
          id?: string
          logged_value?: number
          manager_notes?: string | null
          report_date?: string
          report_id?: string
          reported_value?: number
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_discrepancies_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "production_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          candidates_contacted: number | null
          created_at: string
          date: string
          hires_made: number | null
          id: string
          interviews_scheduled: number | null
          notes: string | null
          offers_sent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          candidates_contacted?: number | null
          created_at?: string
          date?: string
          hires_made?: number | null
          id?: string
          interviews_scheduled?: number | null
          notes?: string | null
          offers_sent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          candidates_contacted?: number | null
          created_at?: string
          date?: string
          hires_made?: number | null
          id?: string
          interviews_scheduled?: number | null
          notes?: string | null
          offers_sent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          author: string
          category: string
          content: string
          date: string
          id: string
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          author: string
          category?: string
          content: string
          date?: string
          id?: string
          priority?: string
          title: string
          user_id: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          date?: string
          id?: string
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      production_report_entries: {
        Row: {
          candidates_contacted: number | null
          created_at: string
          employee_email: string | null
          employee_name: string
          hires_made: number | null
          id: string
          interviews_scheduled: number | null
          offers_sent: number | null
          report_id: string
          user_id: string | null
        }
        Insert: {
          candidates_contacted?: number | null
          created_at?: string
          employee_email?: string | null
          employee_name: string
          hires_made?: number | null
          id?: string
          interviews_scheduled?: number | null
          offers_sent?: number | null
          report_id: string
          user_id?: string | null
        }
        Update: {
          candidates_contacted?: number | null
          created_at?: string
          employee_email?: string | null
          employee_name?: string
          hires_made?: number | null
          id?: string
          interviews_scheduled?: number | null
          offers_sent?: number | null
          report_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_report_entries_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "production_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      production_reports: {
        Row: {
          created_at: string
          discrepancies_found: number | null
          file_name: string
          file_url: string
          id: string
          report_date: string
          status: string | null
          total_records: number | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          discrepancies_found?: number | null
          file_name: string
          file_url: string
          id?: string
          report_date: string
          status?: string | null
          total_records?: number | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          discrepancies_found?: number | null
          file_name?: string
          file_url?: string
          id?: string
          report_date?: string
          status?: string | null
          total_records?: number | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string
        }
        Insert: {
          created_at?: string
          first_name: string
          id: string
          last_name: string
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
