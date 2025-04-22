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
      api_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      handle_cache: {
        Row: {
          checked_at: string
          expires_at: string
          handle_id: string
          name: string
          platform: string
          status: string
        }
        Insert: {
          checked_at: string
          expires_at: string
          handle_id: string
          name: string
          platform: string
          status: string
        }
        Update: {
          checked_at?: string
          expires_at?: string
          handle_id?: string
          name?: string
          platform?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "handle_cache_handle_id_fkey"
            columns: ["handle_id"]
            isOneToOne: true
            referencedRelation: "handles"
            referencedColumns: ["id"]
          },
        ]
      }
      handle_check_logs: {
        Row: {
          created_at: string
          details: Json | null
          handle_id: string | null
          handle_name: string | null
          id: string
          level: string
          message: string
          platform: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          handle_id?: string | null
          handle_name?: string | null
          id?: string
          level: string
          message: string
          platform?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          handle_id?: string | null
          handle_name?: string | null
          id?: string
          level?: string
          message?: string
          platform?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handle_check_logs_handle_id_fkey"
            columns: ["handle_id"]
            isOneToOne: false
            referencedRelation: "handles"
            referencedColumns: ["id"]
          },
        ]
      }
      handle_history: {
        Row: {
          checked_at: string
          handle_id: string
          id: string
          status: string
        }
        Insert: {
          checked_at?: string
          handle_id: string
          id?: string
          status: string
        }
        Update: {
          checked_at?: string
          handle_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "handle_history_handle_id_fkey"
            columns: ["handle_id"]
            isOneToOne: false
            referencedRelation: "handles"
            referencedColumns: ["id"]
          },
        ]
      }
      handles: {
        Row: {
          created_at: string
          id: string
          last_checked: string | null
          monitoring_enabled: boolean | null
          name: string
          notifications_enabled: boolean | null
          platform: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_checked?: string | null
          monitoring_enabled?: boolean | null
          name: string
          notifications_enabled?: boolean | null
          platform: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_checked?: string | null
          monitoring_enabled?: boolean | null
          name?: string
          notifications_enabled?: boolean | null
          platform?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          check_frequency: string
          created_at: string
          handle_limit: number
          id: string
          name: string
          price: number
        }
        Insert: {
          check_frequency?: string
          created_at?: string
          handle_limit?: number
          id?: string
          name: string
          price: number
        }
        Update: {
          check_frequency?: string
          created_at?: string
          handle_limit?: number
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
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
