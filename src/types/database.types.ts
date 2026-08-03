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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance_records: {
        Row: {
          clock_in: string | null
          clock_out: string | null
          created_at: string
          date: string
          employee_id: string
          hours_worked: number | null
          id: string
          shift: Database["public"]["Enums"]["shift_type"] | null
          status: Database["public"]["Enums"]["attendance_status"] | null
          updated_at: string
        }
        Insert: {
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date: string
          employee_id: string
          hours_worked?: number | null
          id?: string
          shift?: Database["public"]["Enums"]["shift_type"] | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          updated_at?: string
        }
        Update: {
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          hours_worked?: number | null
          id?: string
          shift?: Database["public"]["Enums"]["shift_type"] | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_advances: {
        Row: {
          amount: number
          created_at: string
          date: string
          employee_id: string
          id: string
          reason: string | null
          status: Database["public"]["Enums"]["advance_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          employee_id: string
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["advance_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["advance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_advances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["category_type"]
          updated_at?: string
        }
        Relationships: []
      }
      employee_pay_overrides: {
        Row: {
          created_at: string
          employee_id: string
          half_day_rate_multiplier: number | null
          id: string
          late_deduction_per_minute: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          half_day_rate_multiplier?: number | null
          id?: string
          late_deduction_per_minute?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          half_day_rate_multiplier?: number | null
          id?: string
          late_deduction_per_minute?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_pay_overrides_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_color: string | null
          created_at: string
          daily_rate: number
          hire_date: string
          id: string
          is_active: boolean
          name: string
          pay_frequency: Database["public"]["Enums"]["pay_frequency"]
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_color?: string | null
          created_at?: string
          daily_rate: number
          hire_date: string
          id?: string
          is_active?: boolean
          name: string
          pay_frequency?: Database["public"]["Enums"]["pay_frequency"]
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_color?: string | null
          created_at?: string
          daily_rate?: number
          hire_date?: string
          id?: string
          is_active?: boolean
          name?: string
          pay_frequency?: Database["public"]["Enums"]["pay_frequency"]
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          date: string
          description: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          product_id: string | null
          quantity_purchased: number | null
          supplier: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          product_id?: string | null
          quantity_purchased?: number | null
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          product_id?: string | null
          quantity_purchased?: number | null
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          created_at: string
          date_issued: string
          employee_id: string
          id: string
          notes: string | null
          principal: number
          remaining_balance: number
          status: Database["public"]["Enums"]["loan_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_issued: string
          employee_id: string
          id?: string
          notes?: string | null
          principal: number
          remaining_balance: number
          status?: Database["public"]["Enums"]["loan_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_issued?: string
          employee_id?: string
          id?: string
          notes?: string | null
          principal?: number
          remaining_balance?: number
          status?: Database["public"]["Enums"]["loan_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      pay_rule_settings: {
        Row: {
          absence_deduction_mode: Database["public"]["Enums"]["absence_deduction_mode"]
          created_at: string
          default_reorder_threshold: number
          half_day_rate_multiplier: number
          half_day_threshold_hours: number
          holiday_rate_multiplier: number
          id: string
          late_deduction_per_minute: number
          late_grace_minutes: number
          night_differential_percent: number
          payday_rules: Json
          rest_day_rate_multiplier: number
          round_hours_to: number
          standard_hours_per_day: number
          updated_at: string
        }
        Insert: {
          absence_deduction_mode?: Database["public"]["Enums"]["absence_deduction_mode"]
          created_at?: string
          default_reorder_threshold?: number
          half_day_rate_multiplier?: number
          half_day_threshold_hours?: number
          holiday_rate_multiplier?: number
          id?: string
          late_deduction_per_minute?: number
          late_grace_minutes?: number
          night_differential_percent?: number
          payday_rules?: Json
          rest_day_rate_multiplier?: number
          round_hours_to?: number
          standard_hours_per_day?: number
          updated_at?: string
        }
        Update: {
          absence_deduction_mode?: Database["public"]["Enums"]["absence_deduction_mode"]
          created_at?: string
          default_reorder_threshold?: number
          half_day_rate_multiplier?: number
          half_day_threshold_hours?: number
          holiday_rate_multiplier?: number
          id?: string
          late_deduction_per_minute?: number
          late_grace_minutes?: number
          night_differential_percent?: number
          payday_rules?: Json
          rest_day_rate_multiplier?: number
          round_hours_to?: number
          standard_hours_per_day?: number
          updated_at?: string
        }
        Relationships: []
      }
      payroll_runs: {
        Row: {
          adjustment_note: string | null
          adjustments: number
          advance_deductions: number
          advance_ids: Json
          created_at: string
          daily_rate: number
          employee_id: string
          gross_pay: number
          hours_worked: number
          id: string
          loan_deductions: number
          loan_id: string | null
          net_pay: number
          paid_at: string | null
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["payroll_status"]
          updated_at: string
        }
        Insert: {
          adjustment_note?: string | null
          adjustments?: number
          advance_deductions?: number
          advance_ids?: Json
          created_at?: string
          daily_rate: number
          employee_id: string
          gross_pay: number
          hours_worked: number
          id?: string
          loan_deductions?: number
          loan_id?: string | null
          net_pay: number
          paid_at?: string | null
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["payroll_status"]
          updated_at?: string
        }
        Update: {
          adjustment_note?: string | null
          adjustments?: number
          advance_deductions?: number
          advance_ids?: Json
          created_at?: string
          daily_rate?: number
          employee_id?: string
          gross_pay?: number
          hours_worked?: number
          id?: string
          loan_deductions?: number
          loan_id?: string | null
          net_pay?: number
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["payroll_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          default_price: number
          id: string
          is_active: boolean
          name: string
          reorder_threshold: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_price: number
          id?: string
          is_active?: boolean
          name: string
          reorder_threshold?: number | null
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_price?: number
          id?: string
          is_active?: boolean
          name?: string
          reorder_threshold?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      repayments: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          loan_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          id?: string
          loan_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          loan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          notes: string | null
          product_id: string
          quantity_sold: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          product_id: string
          quantity_sold: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity_sold?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustments: {
        Row: {
          created_at: string
          date: string
          id: string
          note: string
          product_id: string
          quantity: number
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          note: string
          product_id: string
          quantity: number
          source?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          note?: string
          product_id?: string
          quantity?: number
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      pay_payroll_run: {
        Args: {
          p_adjustment_note: string | null
          p_adjustments: number
          p_advance_deductions: number
          p_advance_ids: string[]
          p_daily_rate: number
          p_employee_id: string
          p_gross_pay: number
          p_hours_worked: number
          p_loan_deduction: number
          p_loan_id: string | null
          p_net_pay: number
          p_paid_at: string
          p_period_end: string
          p_period_start: string
          p_salaries_category_id: string
          p_ready_run_id?: string | null
        }
        Returns: string
      }
    }
    Enums: {
      absence_deduction_mode: "full_day" | "none"
      advance_status: "pending" | "deducted"
      attendance_status: "present" | "absent" | "closed"
      category_type: "expense" | "stock"
      loan_status: "active" | "paid"
      pay_frequency: "weekly" | "semi_monthly" | "monthly"
      payment_method: "cash" | "gcash" | "bank_transfer" | "credit"
      payroll_status: "upcoming" | "ready" | "paid"
      shift_type: "full" | "half"
      user_role: "manager" | "staff"
      weekend_adjustment: "none" | "move_earlier" | "move_later"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      absence_deduction_mode: ["full_day", "none"],
      advance_status: ["pending", "deducted"],
      attendance_status: ["present", "absent", "closed"],
      category_type: ["expense", "stock"],
      loan_status: ["active", "paid"],
      pay_frequency: ["weekly", "semi_monthly", "monthly"],
      payment_method: ["cash", "gcash", "bank_transfer", "credit"],
      payroll_status: ["upcoming", "ready", "paid"],
      shift_type: ["full", "half"],
      user_role: ["manager", "staff"],
      weekend_adjustment: ["none", "move_earlier", "move_later"],
    },
  },
} as const
