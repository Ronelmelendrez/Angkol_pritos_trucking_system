export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          daily_rate: number;
          hire_date: string;
          is_active: boolean;
          avatar_color: string | null;
          pay_frequency: "weekly" | "semi_monthly" | "monthly";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          daily_rate: number;
          hire_date: string;
          is_active?: boolean;
          avatar_color?: string | null;
          pay_frequency?: "weekly" | "semi_monthly" | "monthly";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          daily_rate?: number;
          hire_date?: string;
          is_active?: boolean;
          avatar_color?: string | null;
          pay_frequency?: "weekly" | "semi_monthly" | "monthly";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "manager" | "staff";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: "manager" | "staff";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: "manager" | "staff";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      attendance_records: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          clock_in: string | null;
          clock_out: string | null;
          hours_worked: number | null;
          shift: "full" | "half" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          date: string;
          clock_in?: string | null;
          clock_out?: string | null;
          hours_worked?: number | null;
          shift?: "full" | "half" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          date?: string;
          clock_in?: string | null;
          clock_out?: string | null;
          hours_worked?: number | null;
          shift?: "full" | "half" | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          default_price: number;
          unit: string;
          is_active: boolean;
          reorder_threshold: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          default_price: number;
          unit: string;
          is_active?: boolean;
          reorder_threshold?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          default_price?: number;
          unit?: string;
          is_active?: boolean;
          reorder_threshold?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          type: "expense" | "stock";
        };
        Insert: {
          id?: string;
          name: string;
          type: "expense" | "stock";
        };
        Update: {
          id?: string;
          name?: string;
          type?: "expense" | "stock";
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          date: string;
          category_id: string;
          description: string | null;
          amount: number;
          supplier: string | null;
          payment_method: "cash" | "gcash" | "bank_transfer" | "credit";
          product_id: string | null;
          quantity_purchased: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          category_id: string;
          description?: string | null;
          amount: number;
          supplier?: string | null;
          payment_method: "cash" | "gcash" | "bank_transfer" | "credit";
          product_id?: string | null;
          quantity_purchased?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          category_id?: string;
          description?: string | null;
          amount?: number;
          supplier?: string | null;
          payment_method?: "cash" | "gcash" | "bank_transfer" | "credit";
          product_id?: string | null;
          quantity_purchased?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      cash_advances: {
        Row: {
          id: string;
          employee_id: string;
          amount: number;
          date: string;
          status: "pending" | "deducted";
          reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          amount: number;
          date: string;
          status?: "pending" | "deducted";
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          amount?: number;
          date?: string;
          status?: "pending" | "deducted";
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cash_advances_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      loans: {
        Row: {
          id: string;
          employee_id: string;
          principal: number;
          remaining_balance: number;
          date_issued: string;
          status: "active" | "paid";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          principal: number;
          remaining_balance: number;
          date_issued: string;
          status?: "active" | "paid";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          principal?: number;
          remaining_balance?: number;
          date_issued?: string;
          status?: "active" | "paid";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loans_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      repayments: {
        Row: {
          id: string;
          loan_id: string;
          amount: number;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          loan_id: string;
          amount: number;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          loan_id?: string;
          amount?: number;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "repayments_loan_id_fkey";
            columns: ["loan_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id"];
          },
        ];
      };
      sales: {
        Row: {
          id: string;
          date: string;
          product_id: string;
          quantity_sold: number;
          unit_price: number;
          amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          product_id: string;
          quantity_sold: number;
          unit_price: number;
          amount: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          product_id?: string;
          quantity_sold?: number;
          unit_price?: number;
          amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      stock_adjustments: {
        Row: {
          id: string;
          product_id: string;
          date: string;
          quantity: number;
          note: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          date: string;
          quantity: number;
          note: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          date?: string;
          quantity?: number;
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      payroll_runs: {
        Row: {
          id: string;
          employee_id: string;
          period_start: string;
          period_end: string;
          hours_worked: number;
          daily_rate: number;
          gross_pay: number;
          advance_deductions: number;
          loan_deductions: number;
          adjustments: number;
          adjustment_note: string | null;
          net_pay: number;
          status: "upcoming" | "ready" | "paid";
          paid_at: string | null;
          advance_ids: Json;
          loan_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          period_start: string;
          period_end: string;
          hours_worked: number;
          daily_rate: number;
          gross_pay: number;
          advance_deductions?: number;
          loan_deductions?: number;
          adjustments?: number;
          adjustment_note?: string | null;
          net_pay: number;
          status?: "upcoming" | "ready" | "paid";
          paid_at?: string | null;
          advance_ids?: Json;
          loan_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          period_start?: string;
          period_end?: string;
          hours_worked?: number;
          daily_rate?: number;
          gross_pay?: number;
          advance_deductions?: number;
          loan_deductions?: number;
          adjustments?: number;
          adjustment_note?: string | null;
          net_pay?: number;
          status?: "upcoming" | "ready" | "paid";
          paid_at?: string | null;
          advance_ids?: Json;
          loan_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_runs_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payroll_runs_loan_id_fkey";
            columns: ["loan_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id"];
          },
        ];
      };
      pay_rule_settings: {
        Row: {
          id: string;
          default_reorder_threshold: number;
          standard_hours_per_day: number;
          half_day_threshold_hours: number;
          half_day_rate_multiplier: number;
          late_grace_minutes: number;
          late_deduction_per_minute: number;
          absence_deduction_mode: "full_day" | "none";
          rest_day_rate_multiplier: number;
          holiday_rate_multiplier: number;
          night_differential_percent: number;
          round_hours_to: number;
          payday_rules: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          default_reorder_threshold?: number;
          standard_hours_per_day?: number;
          half_day_threshold_hours?: number;
          half_day_rate_multiplier?: number;
          late_grace_minutes?: number;
          late_deduction_per_minute?: number;
          absence_deduction_mode?: "full_day" | "none";
          rest_day_rate_multiplier?: number;
          holiday_rate_multiplier?: number;
          night_differential_percent?: number;
          round_hours_to?: number;
          payday_rules?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          default_reorder_threshold?: number;
          standard_hours_per_day?: number;
          half_day_threshold_hours?: number;
          half_day_rate_multiplier?: number;
          late_grace_minutes?: number;
          late_deduction_per_minute?: number;
          absence_deduction_mode?: "full_day" | "none";
          rest_day_rate_multiplier?: number;
          holiday_rate_multiplier?: number;
          night_differential_percent?: number;
          round_hours_to?: number;
          payday_rules?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      employee_pay_overrides: {
        Row: {
          id: string;
          employee_id: string;
          half_day_rate_multiplier: number | null;
          late_deduction_per_minute: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          half_day_rate_multiplier?: number | null;
          late_deduction_per_minute?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          half_day_rate_multiplier?: number | null;
          late_deduction_per_minute?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_pay_overrides_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: true;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "manager" | "staff";
      pay_frequency: "weekly" | "semi_monthly" | "monthly";
      shift_type: "full" | "half";
      advance_status: "pending" | "deducted";
      loan_status: "active" | "paid";
      payroll_status: "upcoming" | "ready" | "paid";
      payment_method: "cash" | "gcash" | "bank_transfer" | "credit";
      absence_deduction_mode: "full_day" | "none";
      weekend_adjustment: "none" | "move_earlier" | "move_later";
      category_type: "expense" | "stock";
    };
    CompositeTypes: Record<string, never>;
  };
};
