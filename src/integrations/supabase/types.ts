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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_payouts: {
        Row: {
          agent_id: string
          amount: number
          created_at: string | null
          id: string
          payment_method: string
          payment_reference: string | null
          processed_at: string | null
          status: string
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string | null
          id?: string
          payment_method: string
          payment_reference?: string | null
          processed_at?: string | null
          status?: string
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string | null
          id?: string
          payment_method?: string
          payment_reference?: string | null
          processed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_payouts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_sales: {
        Row: {
          agent_id: string
          commission_amount: number
          created_at: string | null
          id: string
          order_id: string
          sale_amount: number
          status: string
        }
        Insert: {
          agent_id: string
          commission_amount: number
          created_at?: string | null
          id?: string
          order_id: string
          sale_amount: number
          status?: string
        }
        Update: {
          agent_id?: string
          commission_amount?: number
          created_at?: string | null
          id?: string
          order_id?: string
          sale_amount?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_sales_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_sales_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          business_name: string
          commission_rate: number
          created_at: string | null
          id: string
          pending_payout: number
          phone: string
          referral_code: string | null
          status: Database["public"]["Enums"]["agent_status"]
          total_commission: number
          total_sales: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_name: string
          commission_rate?: number
          created_at?: string | null
          id?: string
          pending_payout?: number
          phone: string
          referral_code?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          total_commission?: number
          total_sales?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_name?: string
          commission_rate?: number
          created_at?: string | null
          id?: string
          pending_payout?: number
          phone?: string
          referral_code?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          total_commission?: number
          total_sales?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity: string
          entity_id: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          bundle_id: string | null
          created_at: string | null
          id: string
          quantity: number | null
          recipient_phone: string | null
          user_id: string
        }
        Insert: {
          bundle_id?: string | null
          created_at?: string | null
          id?: string
          quantity?: number | null
          recipient_phone?: string | null
          user_id: string
        }
        Update: {
          bundle_id?: string | null
          created_at?: string | null
          id?: string
          quantity?: number | null
          recipient_phone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "data_bundles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_bundles: {
        Row: {
          created_at: string | null
          data_amount: string
          delivery_type: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          provider: string
          provider_capacity: string | null
          provider_network_key: string | null
        }
        Insert: {
          created_at?: string | null
          data_amount: string
          delivery_type?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          provider: string
          provider_capacity?: string | null
          provider_network_key?: string | null
        }
        Update: {
          created_at?: string | null
          data_amount?: string
          delivery_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          provider?: string
          provider_capacity?: string | null
          provider_network_key?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          bundle_id: string | null
          created_at: string | null
          data_amount: string
          external_reference: string | null
          id: string
          order_status: string | null
          package_name: string
          payment_method: string | null
          payment_status: string | null
          price: number
          provider_status: string | null
          recipient_phone: string
          referred_by_agent_id: string | null
          user_id: string
        }
        Insert: {
          bundle_id?: string | null
          created_at?: string | null
          data_amount: string
          external_reference?: string | null
          id?: string
          order_status?: string | null
          package_name: string
          payment_method?: string | null
          payment_status?: string | null
          price: number
          provider_status?: string | null
          recipient_phone: string
          referred_by_agent_id?: string | null
          user_id: string
        }
        Update: {
          bundle_id?: string | null
          created_at?: string | null
          data_amount?: string
          external_reference?: string | null
          id?: string
          order_status?: string | null
          package_name?: string
          payment_method?: string | null
          payment_status?: string | null
          price?: number
          provider_status?: string | null
          recipient_phone?: string
          referred_by_agent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "data_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_referred_by_agent_id_fkey"
            columns: ["referred_by_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          notification_preference: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
          wallet_balance: number | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          notification_preference?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
          wallet_balance?: number | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          notification_preference?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_balance?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_ghana_phone: { Args: { phone: string }; Returns: boolean }
    }
    Enums: {
      agent_status: "pending" | "approved" | "suspended"
      app_role: "admin" | "moderator" | "user" | "agent"
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
      agent_status: ["pending", "approved", "suspended"],
      app_role: ["admin", "moderator", "user", "agent"],
    },
  },
} as const
